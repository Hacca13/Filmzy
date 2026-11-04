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

  it("il testo libero detto in modo un po' diverso è lo stesso: «sera» e «di sera», «giacca blu» e «giacca blu scura»", () => {
    const worded = state({
      timeOfDay: 'di sera',
      costumes: { anna: 'giacca blu scura' },
      props: ['la valigia'],
    });

    expect(continuityDifferences(state(), worded, names)).toEqual([]);
    expect(continuityDifferences(worded, state(), names)).toEqual([]);
    // Ma un’ora o un colore diversi no.
    expect(
      continuityDifferences(state(), state({ costumes: { anna: 'giacca rossa' } }), names),
    ).toHaveLength(1);
    expect(continuityDifferences(state(), state({ timeOfDay: 'di notte' }), names)).toHaveLength(1);
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
  const none = { plannedAt: 1000, before: undefined, names };

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
      {
        code: 'R1',
        reason: expect.stringContaining("Anna cambia d'abito") as string,
        origin: 'rule',
        light: false,
      },
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

describe('R2: la scena prima è stata pensata di nuovo dopo questa', () => {
  const first = shot('s1', 0, state({ locationId: 'stazione' }));

  it('se ora finisce in modo diverso da come questa comincia, la prima inquadratura è gialla', () => {
    const flags = chainFlags({
      shots: [first],
      plannedAt: 1000,
      before: { exit: state(), plannedAt: 2000 },
      names,
    });

    expect(flags['s1']).toEqual([
      {
        code: 'R2',
        reason: expect.stringContaining('il luogo cambia') as string,
        origin: 'rule',
        light: false,
      },
    ]);
  });

  it('se la scena prima è più vecchia, o combacia, o è dichiarato, non c’è niente', () => {
    const before = { exit: state(), plannedAt: 2000 };

    // Pensata prima di questa: tra due scene può passare del tempo, e non è un errore.
    expect(chainFlags({ shots: [first], plannedAt: 3000, before, names })).toEqual({});
    // Combacia.
    expect(
      chainFlags({
        shots: [shot('s1', 0, state())],
        plannedAt: 1000,
        before,
        names,
      }),
    ).toEqual({});
    // Cambiamento dichiarato.
    expect(
      chainFlags({
        shots: [shot('s1', 0, state({ locationId: 'stazione' }), undefined, 'Un anno dopo.')],
        plannedAt: 1000,
        before,
        names,
      }),
    ).toEqual({});
    // Nessuna scena prima.
    expect(chainFlags({ shots: [first], plannedAt: 1000, before: undefined, names })).toEqual({});
  });

  it('solo la prima inquadratura dipende dalla scena prima; le altre dalla precedente (R1)', () => {
    const shots = [first, shot('s2', 1, state({ locationId: 'stazione' }))];

    const flags = chainFlags({
      shots,
      plannedAt: 1000,
      before: { exit: state(), plannedAt: 2000 },
      names,
    });

    expect(Object.keys(flags)).toEqual(['s1']);
  });
});
