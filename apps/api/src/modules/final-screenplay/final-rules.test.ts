import type { Screenplay, ScreenplayScene } from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  assertFinalIsConsistent,
  changedText,
  isSameScreenplay,
  settleFinal,
} from './final-rules.js';

const bible = { characters: [{ id: 'c-1' }], locations: [{ id: 'l-1' }] };

const firstScene: ScreenplayScene = {
  number: 1,
  heading: 'INT. STAZIONE',
  locationId: 'l-1',
  timeOfDay: 'notte',
  characterIds: ['c-1'],
  summary: 'Anna trova la bobina.',
  beats: [],
  durationS: 20,
};

/** Una stesura coerente col film; `scene` cambia qualcosa della prima scena. */
function screenplay(
  overrides: Partial<Screenplay> = {},
  scene: Partial<ScreenplayScene> = {},
): Screenplay {
  return {
    title: 'L’ultima corsa',
    logline: 'Una bobina dimenticata.',
    characters: [],
    locations: [],
    scenes: [{ ...firstScene, ...scene }],
    ...overrides,
  };
}

function codeOf(call: () => unknown): unknown {
  try {
    call();
  } catch (error) {
    if (error instanceof HttpException) {
      const body = error.getResponse() as { code: string; details?: { field?: string } };
      return `${body.code}:${body.details?.field ?? ''}`;
    }
    throw error;
  }
  return undefined;
}

describe('settleFinal', () => {
  it('svuota le proposte: nella stesura ufficiale si usano solo cast e luoghi scelti', () => {
    const output = screenplay({
      characters: [{ id: 'p', name: 'Anna', role: 'protagonista' }],
      locations: [{ id: 'q', name: 'Stazione', description: 'x', prompt: 'station' }],
    });
    const settled = settleFinal(output, bible);
    expect(settled.characters).toEqual([]);
    expect(settled.locations).toEqual([]);
  });

  it('toglie dalle scene i personaggi e i luoghi che non esistono, e lascia il testo', () => {
    const output = screenplay({
      scenes: [
        {
          number: 1,
          heading: 'INT. STAZIONE',
          locationId: 'inventato',
          timeOfDay: 'notte',
          characterIds: ['c-1', 'fantasma'],
          summary: 'Anna trova la bobina.',
          beats: [],
          durationS: 20,
        },
      ],
    });
    const [scene] = settleFinal(output, bible).scenes;
    expect(scene).toMatchObject({ characterIds: ['c-1'], summary: 'Anna trova la bobina.' });
    expect(scene).not.toHaveProperty('locationId');
  });

  it('una stesura già coerente non cambia', () => {
    expect(settleFinal(screenplay(), bible)).toEqual(screenplay());
  });
});

describe('assertFinalIsConsistent', () => {
  it('accetta una stesura coerente', () => {
    expect(
      codeOf(() => {
        assertFinalIsConsistent(screenplay(), bible, screenplay());
      }),
    ).toBeUndefined();
  });

  it('rifiuta le proposte e le scene che citano ciò che il film non ha', () => {
    const withProposals = screenplay({
      characters: [{ id: 'p', name: 'Anna', role: 'protagonista' }],
    });
    expect(
      codeOf(() => {
        assertFinalIsConsistent(withProposals, bible, screenplay());
      }),
    ).toBe('invalid_request:screenplay.characters');

    const unknown = screenplay({}, { characterIds: ['fantasma'] });
    expect(
      codeOf(() => {
        assertFinalIsConsistent(unknown, bible, screenplay());
      }),
    ).toBe('invalid_request:screenplay.scenes');
  });
});

describe('changedText', () => {
  it('dà solo i testi cambiati', () => {
    const next = screenplay({ title: 'La corsa' }, { summary: 'Anna trova una lettera.' });
    expect(changedText(screenplay(), next)).toBe('La corsa\nAnna trova una lettera.');
  });

  it('è vuoto se non è cambiato niente o è cambiato solo ciò che non è testo', () => {
    const next = screenplay({}, { durationS: 30 });
    expect(changedText(screenplay(), screenplay())).toBe('');
    expect(changedText(screenplay(), next)).toBe('');
    expect(isSameScreenplay(screenplay(), next)).toBe(false);
    expect(isSameScreenplay(screenplay(), screenplay())).toBe(true);
  });

  it('una scena aggiunta conta come testo nuovo', () => {
    const next = screenplay({
      scenes: [firstScene, { ...firstScene, number: 2, summary: 'Una scena nuova.' }],
    });
    expect(changedText(screenplay(), next)).toContain('Una scena nuova.');
  });
});

describe('settleFinal: gli id della bozza', () => {
  const linked = {
    characters: [{ id: 'c-1', proposalId: 'anna-p' }],
    locations: [{ id: 'l-1', proposalId: 'stazione-p' }],
  };

  it('se il modello cita una proposta della bozza la ricollega a quella scelta, senza doppioni', () => {
    const output = screenplay({}, { characterIds: ['anna-p', 'c-1'], locationId: 'stazione-p' });
    const [scene] = settleFinal(output, linked).scenes;

    expect(scene).toMatchObject({ characterIds: ['c-1'], locationId: 'l-1' });
  });
});

describe('assertFinalIsConsistent: dopo una modifica del cast', () => {
  it('una citazione che c’era già nella versione precedente non blocca la correzione', () => {
    const previous = screenplay({}, { characterIds: ['c-1', 'tolto'] });
    const next = screenplay({ title: 'La corsa' }, { characterIds: ['c-1', 'tolto'] });

    expect(
      codeOf(() => {
        assertFinalIsConsistent(next, bible, previous);
      }),
    ).toBeUndefined();
    // E chi salva la ripulisce.
    expect(settleFinal(next, bible).scenes[0]?.characterIds).toEqual(['c-1']);
  });

  it('una citazione nuova di un id che non esiste invece è rifiutata', () => {
    const previous = screenplay({}, { characterIds: ['c-1', 'tolto'] });
    const next = screenplay({}, { characterIds: ['c-1', 'mai-esistito'] });

    expect(
      codeOf(() => {
        assertFinalIsConsistent(next, bible, previous);
      }),
    ).toBe('invalid_request:screenplay.scenes');
  });

  it('due scene con lo stesso numero sono rifiutate: non si saprebbe quale testo controllare', () => {
    const twice = screenplay({ scenes: [firstScene, { ...firstScene, summary: 'Un’altra.' }] });

    expect(
      codeOf(() => {
        assertFinalIsConsistent(twice, bible, screenplay());
      }),
    ).toBe('invalid_request:screenplay.scenes');
  });
});

describe('isSameScreenplay', () => {
  it('confronta il contenuto, non l’ordine delle chiavi', () => {
    const reordered: Screenplay = {
      scenes: screenplay().scenes,
      locations: [],
      characters: [],
      logline: 'Una bobina dimenticata.',
      title: 'L’ultima corsa',
    };

    expect(isSameScreenplay(screenplay(), reordered)).toBe(true);
  });
});
