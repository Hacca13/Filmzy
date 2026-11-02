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
        assertFinalIsConsistent(screenplay(), bible);
      }),
    ).toBeUndefined();
  });

  it('rifiuta le proposte e le scene che citano ciò che il film non ha', () => {
    const withProposals = screenplay({
      characters: [{ id: 'p', name: 'Anna', role: 'protagonista' }],
    });
    expect(
      codeOf(() => {
        assertFinalIsConsistent(withProposals, bible);
      }),
    ).toBe('invalid_request:screenplay.characters');

    const unknown = screenplay({}, { characterIds: ['fantasma'] });
    expect(
      codeOf(() => {
        assertFinalIsConsistent(unknown, bible);
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
