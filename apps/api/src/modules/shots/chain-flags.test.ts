import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  type ContinuityState,
  type ShotSpec,
} from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { chainFlags, continuityDifferences, type Names } from './chain-flags.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;

const names: Names = {
  characters: { anna: 'Anna', marco: 'Marco' },
  locations: { piazza: 'La piazza', stazione: 'La stazione' },
};

const state = (patch: Partial<ContinuityState> = {}): ContinuityState => ({
  locationId: 'piazza',
  timeOfDay: 'sera',
  present: ['anna'],
  costumes: { anna: 'giacca blu' },
  props: ['valigia'],
  ...patch,
});

/** Un'inquadratura che comincia con `entry` e finisce con `exit` (l'uscita è uguale all'entrata se non si dice). */
const shot = (
  id: string,
  order: number,
  entry: ContinuityState,
  exit: ContinuityState = entry,
  change?: string,
): ShotSpec => ({
  ...example,
  id,
  order,
  continuity: { entry, exit, ...(change === undefined ? {} : { change }) },
});

describe('cosa è diverso fra uscita ed entrata', () => {
  it('uguali (anche con maiuscole, accenti e punteggiatura diversi) non c’è niente', () => {
    const same = state({
      timeOfDay: 'Sera.',
      costumes: { anna: 'Giacca  blu!' },
      props: ['Valigia'],
    });

    expect(continuityDifferences(state(), same, names)).toEqual([]);
  });

  it('articoli e preposizioni non contano: «sera» e «di sera» sono la stessa cosa', () => {
    const worded = state({
      timeOfDay: 'di sera',
      costumes: { anna: 'la giacca blu' },
      props: ['la valigia'],
    });

    expect(continuityDifferences(state(), worded, names)).toEqual([]);
    expect(continuityDifferences(worded, state(), names)).toEqual([]);
  });

  it('una parola in più cambia il senso: si segnala', () => {
    for (const costume of ['giacca rossa', 'senza giacca blu', 'giacca blu strappata']) {
      expect(
        continuityDifferences(state(), state({ costumes: { anna: costume } }), names),
      ).toHaveLength(1);
    }
    expect(continuityDifferences(state(), state({ timeOfDay: 'di notte' }), names)).toHaveLength(1);
    // Un oggetto diverso è uno che sparisce e uno che compare.
    expect(continuityDifferences(state(), state({ props: ['valigia rotta'] }), names)).toHaveLength(
      2,
    );
  });

  it('luogo, ora, persone, abiti e oggetti che cambiano sono detti con i nomi', () => {
    const to = state({
      locationId: 'stazione',
      timeOfDay: 'notte',
      present: ['anna', 'marco'],
      costumes: { anna: 'giacca rossa', marco: 'cappotto' },
      props: ['lettera'],
    });

    expect(continuityDifferences(state(), to, names)).toEqual([
      'il luogo cambia (da «La piazza» a «La stazione»)',
      "l'ora cambia (da «sera» a «notte»)",
      'Marco compare',
      "Anna cambia d'abito (da «giacca blu» a «giacca rossa»)",
      'compare «lettera»',
      'sparisce «valigia»',
    ]);
  });

  it('chi esce di scena e un nome che non si conosce hanno parole semplici', () => {
    const from = state({ present: ['anna', 'sconosciuto'] });
    const to = state({ present: ['anna'] });

    expect(continuityDifferences(from, to, names)).toEqual(["Un personaggio non c'è più"]);
  });
});

describe('R1: dentro la scena l’entrata combacia con l’uscita di prima', () => {
  const none = { basedOn: undefined, before: undefined, names };

  it('un’inquadratura che comincia dove l’altra finisce non ha niente', () => {
    const shots = [
      shot('s1', 0, state(), state({ props: [] })),
      shot('s2', 1, state({ props: [] })),
    ];

    expect(chainFlags({ shots, ...none })).toEqual({});
  });

  it('un’entrata diversa dall’uscita ingiallisce la seconda, con il motivo e senza essere leggera', () => {
    const shots = [
      shot('s1', 0, state(), state()),
      shot('s2', 1, state({ costumes: { anna: 'giacca rossa' } })),
    ];

    const flags = chainFlags({ shots, ...none });

    expect(Object.keys(flags)).toEqual(['s2']);
    expect(flags['s2']).toEqual([
      expect.objectContaining({
        code: 'R1',
        reason: expect.stringContaining("Anna cambia d'abito") as string,
        origin: 'rule',
        light: false,
        fix: 'replan',
      }),
    ]);
  });

  it('un cambiamento dichiarato non è un errore', () => {
    const shots = [
      shot('s1', 0, state()),
      shot(
        's2',
        1,
        state({ costumes: { anna: 'giacca rossa' } }),
        undefined,
        'Anna si è cambiata.',
      ),
    ];

    expect(chainFlags({ shots, ...none })).toEqual({});
  });

  it('conta l’ordine dell’inquadratura, non quello dell’elenco', () => {
    const shots = [shot('s2', 1, state({ timeOfDay: 'notte' })), shot('s1', 0, state())];

    expect(Object.keys(chainFlags({ shots, ...none }))).toEqual(['s2']);
  });
});

describe('R2: l’uscita della scena prima è cambiata rispetto a quella da cui si è partiti', () => {
  const first = shot('s1', 0, state({ locationId: 'stazione' }));
  const oldExit = state({ locationId: 'stazione' });
  const newExit = state();

  it('se è cambiata e ora non combacia, la prima inquadratura è gialla', () => {
    const flags = chainFlags({ shots: [first], basedOn: oldExit, before: newExit, names });

    expect(flags['s1']).toEqual([
      expect.objectContaining({
        code: 'R2',
        reason: expect.stringContaining('il luogo cambia') as string,
        origin: 'rule',
        light: false,
        fix: 'replan',
      }),
    ]);
  });

  it('una differenza che c’era già non è un errore: è un taglio fra due scene', () => {
    // La scena prima finisce in piazza e questa comincia in stazione, da sempre.
    expect(chainFlags({ shots: [first], basedOn: newExit, before: newExit, names })).toEqual({});
  });

  it('senza un’uscita di partenza, se combacia o senza scena prima non c’è niente', () => {
    // Pensata prima della scena che la precede: non ne dipendeva.
    expect(chainFlags({ shots: [first], basedOn: undefined, before: newExit, names })).toEqual({});
    // È cambiata, ma ora combacia.
    expect(
      chainFlags({ shots: [shot('s1', 0, newExit)], basedOn: oldExit, before: newExit, names }),
    ).toEqual({});
    expect(chainFlags({ shots: [first], basedOn: oldExit, before: undefined, names })).toEqual({});
  });

  it('un cambiamento dichiarato non salva: era scritto pensando all’uscita di prima', () => {
    const flags = chainFlags({
      shots: [shot('s1', 0, state({ locationId: 'stazione' }), undefined, 'Un anno dopo.')],
      basedOn: oldExit,
      before: newExit,
      names,
    });

    expect(flags['s1']?.[0]?.code).toBe('R2');
  });

  describe('la chiave, per ricordare che l’utente l’ha ignorato', () => {
    const keyOf = (before: ContinuityState, usedNames: Names = names): string | undefined =>
      chainFlags({
        shots: [shot('s1', 0, state({ timeOfDay: 'notte' }))],
        basedOn: state({ timeOfDay: 'notte' }),
        before,
        names: usedNames,
      })['s1']?.[0]?.key;

    it('non cambia se il modello riscrive la stessa uscita con altre parole', () => {
      expect(keyOf(state({ timeOfDay: 'sera' }))).toBeDefined();
      expect(keyOf(state({ timeOfDay: 'Di sera.' }))).toBe(keyOf(state({ timeOfDay: 'sera' })));
    });

    it('non cambia se si rinomina un luogo', () => {
      const keyAfterMove = (usedNames: Names) =>
        chainFlags({
          shots: [shot('s1', 0, state({ locationId: 'stazione' }))],
          basedOn: state({ locationId: 'stazione' }),
          before: state(),
          names: usedNames,
        })['s1']?.[0]?.key;

      expect(
        keyAfterMove({ ...names, locations: { piazza: 'La piazzetta', stazione: 'Il binario' } }),
      ).toBe(keyAfterMove(names));
    });

    it('cambia se la scena prima finisce in un altro modo: è un’altra situazione', () => {
      expect(keyOf(state({ timeOfDay: 'alba' }))).not.toBe(keyOf(state({ timeOfDay: 'sera' })));
    });
  });

  it('solo la prima inquadratura dipende dalla scena prima; le altre dalla precedente (R1)', () => {
    const shots = [first, shot('s2', 1, state({ locationId: 'stazione' }))];

    const flags = chainFlags({ shots, basedOn: oldExit, before: newExit, names });

    expect(Object.keys(flags)).toEqual(['s1']);
  });
});
