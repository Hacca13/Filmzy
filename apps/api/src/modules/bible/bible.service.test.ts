import {
  ROLE_INPUT_EXAMPLES,
  shotPlannerInputSchema,
  type Character,
  type Location,
  type Moodboard,
  type Project,
} from '@filmzy/contracts';
import type { CharacterStore, LocationStore, MoodboardStore, SheetStore } from '@filmzy/db';
import type { ConfigSource, LoadedConfig } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type { ProjectsService } from '../projects/projects.service.js';
import { BibleService } from './bible.service.js';

const example = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner).bible;
const [baseCharacter] = example.characters;
const [baseLocation] = example.locations;
if (baseCharacter === undefined || baseLocation === undefined) {
  throw new Error('la Bibbia d’esempio ha un personaggio e un luogo');
}

const anna: Character = { ...baseCharacter, id: 'c-anna', name: 'Anna', sheet: [] };
const marco: Character = { ...baseCharacter, id: 'c-marco', name: 'Marco', sheet: [] };
const piazza: Location = {
  ...baseLocation,
  id: 'l-piazza',
  name: 'La piazza',
  references: [{ assetId: 'set-piazza' }],
};

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata sull’ultimo treno',
  genre: 'drama',
  tone: 'moving',
  style: example.style.id,
  cinematography: example.cinematography.id,
  language: 'it',
  durationS: 90,
  phase: 'final',
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

function build(
  options: {
    styles?: unknown[];
    cinematography?: unknown[];
    locked?: Record<string, string[]>;
    moodboard?: Moodboard;
  } = {},
) {
  const characters = { list: () => [anna, marco] } as unknown as CharacterStore;
  const sheets = {
    lockedAssetIds: (characterId: string) => options.locked?.[characterId] ?? [],
  } as unknown as SheetStore;
  const locations = { list: () => [piazza] } as unknown as LocationStore;
  const configSource: ConfigSource = {
    load: () =>
      Promise.resolve({
        config: {
          presets: {
            styles: options.styles ?? [example.style],
            cinematography: options.cinematography ?? [example.cinematography],
          },
          limits: { max_characters: 2 },
        },
        origin: 'prova',
        releaseId: 'prova',
        issues: [],
      } as unknown as LoadedConfig),
  };
  const projects = {
    get: (id: string) => {
      if (id !== film.id) throw new HttpException({ code: 'not_found', retryable: false }, 404);
      return film;
    },
  } as unknown as ProjectsService;
  const moodboards = {
    get: () =>
      options.moodboard ?? {
        projectId: film.id,
        film: { palette: [], notes: '', references: [] },
        scenes: [],
      },
  } as unknown as MoodboardStore;
  return new BibleService(characters, sheets, locations, configSource, moodboards, projects);
}

async function codeOf(call: () => Promise<unknown>): Promise<string> {
  try {
    await call();
  } catch (error) {
    if (error instanceof HttpException) {
      const body = error.getResponse() as { code: string; details?: { field?: string } };
      return `${body.code}:${body.details?.field ?? ''}`;
    }
    throw error;
  }
  throw new Error('doveva fallire');
}

describe('la Bibbia del film', () => {
  it('mette insieme il film, lo stile, la fotografia, il cast, i luoghi e il limite di personaggi', async () => {
    const bible = await build().assemble(film.id);

    expect(bible.project).toEqual({
      id: film.id,
      title: film.title,
      idea: film.idea,
      genre: 'drama',
      tone: 'moving',
      language: 'it',
      durationS: 90,
    });
    expect(bible.style.id).toBe(example.style.id);
    expect(bible.cinematography.id).toBe(example.cinematography.id);
    expect(bible.characters.map((c) => c.name)).toEqual(['Anna', 'Marco']);
    expect(bible.locations.map((l) => l.name)).toEqual(['La piazza']);
    expect(bible.limits).toEqual({ maxCharacters: 2 });
    expect(bible.moodboard).toBeUndefined();
  });

  it('la scheda di un personaggio sono le immagini del volto bloccato, nell’ordine; senza volto bloccato è vuota', async () => {
    const bible = await build({ locked: { 'c-anna': ['volto-1', 'volto-2', 'volto-3'] } }).assemble(
      film.id,
    );

    expect(bible.characters[0]?.sheet).toEqual([
      { assetId: 'volto-1' },
      { assetId: 'volto-2' },
      { assetId: 'volto-3' },
    ]);
    expect(bible.characters[1]?.sheet).toEqual([]);
  });

  it('l’immagine del set scelta è il riferimento del luogo', async () => {
    const bible = await build().assemble(film.id);

    expect(bible.locations[0]?.references).toEqual([{ assetId: 'set-piazza' }]);
  });

  it('se lo stile o la fotografia del film non esistono più nella configurazione lo dice', async () => {
    expect(await codeOf(() => build({ styles: [] }).assemble(film.id))).toBe(
      'config_invalid:style',
    );
    expect(await codeOf(() => build({ cinematography: [] }).assemble(film.id))).toBe(
      'config_invalid:cinematography',
    );
  });

  it('senza moodboard la Bibbia è quella di prima; con un moodboard porta solo il testo (T4.10)', async () => {
    expect((await build().assemble(film.id)).moodboard).toBeUndefined();

    const withMoodboard: Moodboard = {
      projectId: film.id,
      film: {
        palette: [{ hex: '#c2813a' }],
        notes: 'Luce calda, ombre lunghe.',
        references: [
          {
            assetId: 'img-1',
            origin: 'uploaded',
            analysisOnly: true,
            description: 'a quiet station at dusk',
            moodTags: ['quiet'],
            palette: [],
          },
        ],
      },
      scenes: [],
    };
    const bible = await build({ moodboard: withMoodboard }).assemble(film.id);

    expect(bible.moodboard).toEqual({
      palette: [{ hex: '#c2813a' }],
      notes: 'Luce calda, ombre lunghe.',
      referenceDescriptions: ['a quiet station at dusk'],
    });
  });

  it('un film che non esiste dà «non trovato»', async () => {
    expect(await codeOf(() => build().assemble('film-sconosciuto'))).toBe('not_found:');
  });
});

describe('gli id che il film ha adesso', () => {
  it('sono quelli dei personaggi e dei luoghi, senza toccare la configurazione', () => {
    const known = build().knownIds(film.id);

    expect([...known.characters]).toEqual(['c-anna', 'c-marco']);
    expect([...known.locations]).toEqual(['l-piazza']);
    expect(() => build().knownIds('film-sconosciuto')).toThrow(HttpException);
  });
});
