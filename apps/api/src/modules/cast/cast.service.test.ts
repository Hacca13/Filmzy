import {
  ROLE_OUTPUT_EXAMPLES,
  castingOutputSchema,
  type CastingInput,
  type CastingSuggestion,
  type GenerationContext,
  type Project,
  type ProjectPhase,
  type TroupePresetsData,
} from '@filmzy/contracts';
import {
  createCharacterStore,
  createScreenplayStore,
  openFilmzyDatabase,
  type CharacterStore,
  type ScreenplayStore,
} from '@filmzy/db';
import type { ConfigSource, LoadedConfig, Troupe } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ModerationRequest, ModerationService } from '../moderation/moderation.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import { CastService } from './cast.service.js';

const example = castingOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.casting)
  .suggestions[0] as CastingSuggestion;

const presets: TroupePresetsData = {
  genres: [{ id: 'drama', label: 'Drammatico' }],
  tones: [{ id: 'moving', label: 'Commovente' }],
  styles: [
    { id: 'realistic', label: 'Realistico', description: 'Dal vero', hint: 'x', enabled: true },
  ],
  cinematography: [],
  cameraMovements: [],
  characterTags: [
    { id: 'protagonist', label: 'Protagonista', description: 'Lui o lei', enabled: true },
    { id: 'ally', label: 'Alleato', description: 'Aiuta', enabled: true },
    { id: 'mentor', label: 'Mentore', description: 'Guida', enabled: false },
  ],
};

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'noir',
  language: 'it',
  durationS: 90,
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:00:00.000Z',
};

const configSource: ConfigSource = {
  load: () =>
    Promise.resolve({
      config: { presets, limits: { max_characters: 2 }, features: {} },
      origin: 'prova',
      releaseId: 'prova',
      issues: [],
    } as unknown as LoadedConfig),
};

const suggest = (name: string, extra: Partial<CastingSuggestion> = {}): CastingSuggestion => ({
  ...example,
  name,
  tag: 'ally',
  ...extra,
});

let characters: CharacterStore;
let screenplays: ScreenplayStore;
let inputs: { input: CastingInput; ctx: GenerationContext }[];
let estimated: CastingInput[];
let moderated: ModerationRequest[];
let reached: ProjectPhase[];
let proposals: CastingSuggestion[];

function build(options: { rejects?: boolean } = {}) {
  const troupe = {
    run: (_role: string, input: CastingInput, ctx: GenerationContext) => {
      inputs.push({ input, ctx });
      return Promise.resolve({ data: { suggestions: proposals } });
    },
    estimate: (_role: string, input: CastingInput) => {
      estimated.push(input);
      return Promise.resolve({ modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: 0.03 });
    },
  } as unknown as Troupe;
  const moderation = {
    assertAllowed: (request: ModerationRequest) => {
      moderated.push(request);
      return options.rejects === true
        ? Promise.reject(new HttpException({ code: 'content_rejected', retryable: false }, 422))
        : Promise.resolve();
    },
  } as unknown as ModerationService;
  const projects = {
    get: (id: string) => {
      if (id !== film.id) throw new HttpException({ code: 'not_found', retryable: false }, 404);
      return film;
    },
    reach: (_id: string, phase: ProjectPhase) => {
      reached.push(phase);
    },
  } as unknown as ProjectsService;
  return new CastService(characters, screenplays, troupe, configSource, projects, moderation);
}

async function failure(call: () => Promise<unknown>): Promise<HttpException> {
  try {
    await call();
  } catch (error) {
    if (error instanceof HttpException) return error;
    throw error;
  }
  throw new Error('doveva fallire');
}

beforeEach(async () => {
  const opened = await openFilmzyDatabase({
    dataDir: await mkdtemp(path.join(tmpdir(), 'filmzy-cast-')),
    appVersion: '0.0.0-test',
  });
  characters = createCharacterStore(opened.db);
  screenplays = createScreenplayStore(opened.db);
  inputs = [];
  estimated = [];
  moderated = [];
  reached = [];
  proposals = [suggest('Anna'), suggest('Bruno')];
  return () => {
    opened.close();
  };
});

describe('il cast e i suoi limiti', () => {
  it('dice i personaggi, il massimo e i ruoli attivi tra cui scegliere', async () => {
    const cast = await build().cast(film.id);

    expect(cast.characters).toEqual([]);
    expect(cast.maxCharacters).toBe(2);
    expect(cast.tags.map((tag) => tag.id)).toEqual(['protagonist', 'ally']);
  });

  it('un film che non c’è dà «non trovato»', async () => {
    const error = await failure(() => build().cast('non-c-e'));

    expect(error.getStatus()).toBe(404);
  });
});

describe('le proposte del casting', () => {
  it('partono dalla bozza della storia, con il cast attuale nell’input e il numero chiesto', async () => {
    const draft = (await import('@filmzy/contracts')).screenplaySchema.parse(
      ROLE_OUTPUT_EXAMPLES.screenwriter,
    );
    screenplays.create({ projectId: film.id, stage: 'draft', screenplay: draft });

    await build().suggest(film.id, { count: 2 });

    expect(inputs[0]?.input).toMatchObject({
      mode: 'initial',
      idea: film.idea,
      screenplay: draft,
      cast: [],
      count: 2,
      language: 'it',
    });
    expect(inputs[0]?.input.tags.map((tag) => tag.id)).toEqual(['protagonist', 'ally']);
    expect(inputs[0]?.ctx).toEqual({ purpose: 'product', projectId: film.id });
  });

  it('senza una bozza il casting funziona lo stesso: la storia è «niente» e il cast è vuoto', async () => {
    const { suggestions } = await build().suggest(film.id, { count: 1 });

    expect(inputs[0]?.input.screenplay).toBeNull();
    expect(suggestions).toHaveLength(1);
  });

  it('sono quante richieste, anche se il casting ne dà di più', async () => {
    proposals = [suggest('Anna'), suggest('Bruno'), suggest('Carla')];

    const { suggestions } = await build().suggest(film.id, { count: 2 });

    expect(suggestions.map((s) => s.name)).toEqual(['Anna', 'Bruno']);
  });

  it('niente doppioni: né con chi è già nel cast né con le proposte ancora sul tavolo', async () => {
    const service = build();
    await service.add(film.id, { suggestion: suggest('Anna') });
    proposals = [suggest('anna'), suggest('Bruno'), suggest('Carla')];

    const { suggestions } = await service.suggest(film.id, {
      count: 1,
      pending: [suggest('Bruno')],
    });

    expect(suggestions.map((s) => s.name)).toEqual(['Carla']);
    // Il cast attuale è sempre nell'input: il personaggio scelto e la proposta sul tavolo.
    expect(inputs[0]?.input.cast.map((c) => c.name)).toEqual(['Anna', 'Bruno']);
  });

  it('non se ne chiedono più dei posti liberi: il massimo lo applica il server', async () => {
    const service = build();
    await service.add(film.id, { suggestion: suggest('Anna') });

    const error = await failure(() => service.suggest(film.id, { count: 2 }));

    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toMatchObject({ details: { field: 'count' } });
    expect(inputs).toEqual([]);
  });

  it('con la conferma dell’utente il limite di spesa si supera per questa richiesta sola', async () => {
    await build().suggest(film.id, { count: 1, spendConfirmed: true });
    await build().suggest(film.id, { count: 1 });

    expect(inputs[0]?.ctx.spendConfirmed).toBe(true);
    expect(inputs[1]?.ctx.spendConfirmed).toBeUndefined();
  });

  it('la stima non chiama nessuno e rispetta gli stessi limiti', async () => {
    const { estimate } = await build().estimate(film.id, 2);

    expect(estimate.estimatedCostUsd).toBe(0.03);
    expect(estimated[0]?.count).toBe(2);
    expect(inputs).toEqual([]);

    const error = await failure(() => build().estimate(film.id, 3));
    expect(error.getStatus()).toBe(400);
  });
});

describe('aggiungere un personaggio', () => {
  it('la proposta diventa un personaggio e porta il film alla fase dei personaggi', async () => {
    const character = await build().add(film.id, {
      suggestion: suggest('Anna', { proposalId: 'p-anna' }),
    });

    expect(character).toMatchObject({ name: 'Anna', tag: 'ally', proposalId: 'p-anna', sheet: [] });
    expect(characters.list(film.id)).toEqual([character]);
    expect(reached).toEqual(['cast']);
  });

  it('i dettagli facoltativi si possono ignorare: senza profilo si aggiunge lo stesso', async () => {
    const bare = suggest('Anna');
    delete bare.profile;

    const character = await build().add(film.id, { suggestion: bare });

    expect(character.profile).toBeUndefined();
  });

  it('non oltre il massimo, con lo stesso nome due volte, con un ruolo che non c’è o da riusare', async () => {
    const service = build();
    await service.add(film.id, { suggestion: suggest('Anna') });

    const duplicate = await failure(() => service.add(film.id, { suggestion: suggest(' ANNA ') }));
    const unknownTag = await failure(() =>
      service.add(film.id, { suggestion: suggest('Bruno', { tag: 'mentor' }) }),
    );
    const reuse = await failure(() =>
      service.add(film.id, { suggestion: suggest('Bruno', { action: 'reuse', characterId: 'x' }) }),
    );
    await service.add(film.id, { suggestion: suggest('Bruno') });
    const full = await failure(() => service.add(film.id, { suggestion: suggest('Carla') }));

    expect(duplicate.getResponse()).toMatchObject({ details: { field: 'suggestion.name' } });
    expect(unknownTag.getResponse()).toMatchObject({ details: { field: 'suggestion.tag' } });
    expect(reuse.getResponse()).toMatchObject({ details: { field: 'suggestion.action' } });
    expect(full.getStatus()).toBe(409);
    expect(full.getResponse()).toMatchObject({ details: { field: 'cast' } });
    expect(characters.list(film.id).map((c) => c.name)).toEqual(['Anna', 'Bruno']);
  });
});

describe('rivedere un personaggio', () => {
  async function anna() {
    return build().add(film.id, { suggestion: suggest('Anna') });
  }

  it('cambia il ruolo senza passare dal moderatore: non c’è testo nuovo', async () => {
    const character = await anna();

    const updated = await build().update(film.id, character.id, { tag: 'protagonist' });

    expect(updated.tag).toBe('protagonist');
    expect(moderated).toEqual([]);
  });

  it('i dettagli scritti a mano passano dal moderatore, come testo di un personaggio', async () => {
    const character = await anna();

    await build().update(film.id, character.id, {
      profile: { personality: 'testarda', goal: 'ritrovare Luca' },
    });

    expect(moderated).toEqual([
      {
        text: 'testarda\nritrovare Luca',
        context: 'character',
        language: 'it',
        projectId: film.id,
      },
    ]);
  });

  it('un testo respinto non cambia niente', async () => {
    const character = await anna();

    const error = await failure(() =>
      build({ rejects: true }).update(film.id, character.id, { description: 'Una persona famosa' }),
    );

    expect(error.getStatus()).toBe(422);
    expect(characters.get(character.id)?.description).toBe(example.description);
  });

  it('un ruolo che non c’è o un nome già preso si rifiutano', async () => {
    const first = await anna();
    await build().add(film.id, { suggestion: suggest('Bruno') });

    const tag = await failure(() => build().update(film.id, first.id, { tag: 'mentor' }));
    const name = await failure(() => build().update(film.id, first.id, { name: 'bruno' }));

    expect(tag.getResponse()).toMatchObject({ details: { field: 'tag' } });
    expect(name.getStatus()).toBe(409);
  });

  it('un personaggio di un altro film non si cambia né si toglie', async () => {
    const error = await failure(() => build().update(film.id, 'non-c-e', { tag: 'ally' }));

    expect(error.getStatus()).toBe(404);
    expect(() => {
      build().remove(film.id, 'non-c-e');
    }).toThrow(HttpException);
  });

  it('si toglie dal cast, e il posto torna libero', async () => {
    const service = build();
    const first = await service.add(film.id, { suggestion: suggest('Anna') });
    await service.add(film.id, { suggestion: suggest('Bruno') });

    service.remove(film.id, first.id);
    await service.add(film.id, { suggestion: suggest('Carla') });

    expect(characters.list(film.id).map((c) => c.name)).toEqual(['Bruno', 'Carla']);
  });
});
