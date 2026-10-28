import {
  ROLE_OUTPUT_EXAMPLES,
  screenplaySchema,
  type GenerationContext,
  type Project,
  type ScreenwriterInput,
  type TroupePresetsData,
} from '@filmzy/contracts';
import { createScreenplayStore, openFilmzyDatabase, type ScreenplayStore } from '@filmzy/db';
import type { ConfigSource, LoadedConfig, Troupe } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ModerationRequest, ModerationService } from '../moderation/moderation.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from './screenplay.service.js';

const screenplay = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

const presets: TroupePresetsData = {
  genres: [{ id: 'drama', label: 'Drammatico' }],
  tones: [{ id: 'moving', label: 'Commovente' }],
  styles: [
    { id: 'realistic', label: 'Realistico', description: 'Dal vero', hint: 'x', enabled: true },
  ],
  cinematography: [],
  cameraMovements: [],
  characterTags: [],
};

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata sull’ultimo treno',
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
  // Basta la parte che il servizio legge: preset, limiti e funzioni.
  load: () =>
    Promise.resolve({
      config: { presets, limits: { max_characters: 2 }, features: { dialogue: true } },
      origin: 'prova',
      releaseId: 'prova',
      issues: [],
    } as unknown as LoadedConfig),
};

interface RunCall {
  input: ScreenwriterInput;
  ctx: GenerationContext;
}

let store: ScreenplayStore;
let events: string[];
let runs: RunCall[];
let estimates: ScreenwriterInput[];
let moderated: ModerationRequest[];

function build(options: { rejects?: boolean; unknownFilm?: boolean } = {}) {
  const troupe = {
    run: (_role: string, input: ScreenwriterInput, ctx: GenerationContext) => {
      events.push('troupe');
      runs.push({ input, ctx });
      const title = input.request === null ? screenplay.title : `Rivisto: ${input.request}`;
      return Promise.resolve({
        data: { ...screenplay, title },
        receipt: { id: `scontrino-${String(runs.length)}` },
      });
    },
    estimate: (_role: string, input: ScreenwriterInput) => {
      estimates.push(input);
      return Promise.resolve({ modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: 0.02 });
    },
  } as unknown as Troupe;
  const moderation = {
    assertAllowed: (request: ModerationRequest) => {
      events.push('moderatore');
      moderated.push(request);
      return options.rejects === true
        ? Promise.reject(new HttpException({ code: 'content_rejected', retryable: false }, 422))
        : Promise.resolve();
    },
  } as unknown as ModerationService;
  const projects = {
    get: (id: string) => {
      if (options.unknownFilm === true || id !== film.id) {
        throw new HttpException({ code: 'not_found', retryable: false }, 404);
      }
      return film;
    },
  } as unknown as ProjectsService;
  return new ScreenplayService(store, troupe, configSource, projects, moderation);
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
    dataDir: await mkdtemp(path.join(tmpdir(), 'filmzy-sceneggiatura-')),
    appVersion: '0.0.0-test',
  });
  store = createScreenplayStore(opened.db);
  events = [];
  runs = [];
  estimates = [];
  moderated = [];
  return () => {
    opened.close();
  };
});

describe('la bozza da zero', () => {
  it('chiama lo sceneggiatore con l’idea, le scelte del film e i limiti, e salva la versione 1', async () => {
    const version = await build().writeDraft(film.id, {});

    expect(runs).toHaveLength(1);
    expect(runs[0]?.input).toMatchObject({
      mode: 'draft',
      idea: film.idea,
      genre: { id: 'drama', label: 'Drammatico' },
      tone: { id: 'moving', label: 'Commovente' },
      style: { id: 'realistic' },
      durationS: 90,
      language: 'it',
      maxCharacters: 2,
      dialogueEnabled: true,
      characters: [],
      locations: [],
      draft: null,
      request: null,
      accepted: [],
    });
    expect(runs[0]?.ctx).toEqual({ purpose: 'product', projectId: film.id });
    expect(version).toMatchObject({
      projectId: film.id,
      stage: 'draft',
      version: 1,
      generationId: 'scontrino-1',
    });
    expect(version.request).toBeUndefined();
    expect(store.latest(film.id, 'draft')).toEqual(version);
  });

  it('non passa dal moderatore: il testo è l’idea, già controllata quando il film è nato', async () => {
    await build().writeDraft(film.id, {});

    expect(moderated).toEqual([]);
  });

  it('con la conferma dell’utente il limite di spesa si supera per questa richiesta sola', async () => {
    await build().writeDraft(film.id, { spendConfirmed: true });
    await build().writeDraft(film.id, {});

    expect(runs[0]?.ctx.spendConfirmed).toBe(true);
    expect(runs[1]?.ctx.spendConfirmed).toBeUndefined();
  });

  it('scrivere di nuovo crea una versione nuova e la precedente resta', async () => {
    const first = await build().writeDraft(film.id, {});
    const second = await build().writeDraft(film.id, {});

    expect(second.version).toBe(2);
    expect(store.get(first.id)).toEqual(first);
  });

  it('un film che non c’è non chiama nessuno', async () => {
    const error = await failure(() => build().writeDraft('non-c-e', {}));

    expect(error.getStatus()).toBe(404);
    expect(runs).toEqual([]);
  });
});

describe('«Parla con lo sceneggiatore»', () => {
  it('prima il moderatore, poi lo sceneggiatore con l’ultima versione e la richiesta', async () => {
    const first = await build().writeDraft(film.id, {});
    events.length = 0;

    const second = await build().revise(film.id, { request: 'Rendila più cupa' });

    expect(events).toEqual(['moderatore', 'troupe']);
    expect(moderated).toEqual([
      { text: 'Rendila più cupa', context: 'idea', language: 'it', projectId: film.id },
    ]);
    expect(runs[1]?.input).toMatchObject({
      mode: 'revise',
      draft: first.screenplay,
      request: 'Rendila più cupa',
    });
    expect(second).toMatchObject({ version: 2, request: 'Rendila più cupa' });
    expect(second.screenplay.title).toBe('Rivisto: Rendila più cupa');
  });

  it('la versione precedente resta consultabile, com’era', async () => {
    const first = await build().writeDraft(film.id, {});
    await build().revise(film.id, { request: 'Rendila più cupa' });

    const old = build().version(film.id, first.id);

    expect(old).toEqual(first);
    expect(old.request).toBeUndefined();
  });

  it('una richiesta respinta dal moderatore non spende e non crea una versione', async () => {
    await build().writeDraft(film.id, {});
    runs.length = 0;

    const error = await failure(() => build({ rejects: true }).revise(film.id, { request: 'x' }));

    expect(error.getStatus()).toBe(422);
    expect(runs).toEqual([]);
    expect(store.list(film.id, 'draft')).toHaveLength(1);
  });

  it('senza una bozza non c’è niente da modificare: non spende nemmeno il moderatore', async () => {
    const error = await failure(() => build().revise(film.id, { request: 'Più breve' }));

    expect(error.getStatus()).toBe(404);
    expect(error.getResponse()).toMatchObject({ details: { field: 'draft' } });
    expect(events).toEqual([]);
  });
});

describe('la stima', () => {
  it('per la bozza non chiama nessuno e non salva niente', async () => {
    const { estimate } = await build().estimate(film.id, { mode: 'draft' });

    expect(estimate.estimatedCostUsd).toBe(0.02);
    expect(estimates[0]).toMatchObject({ mode: 'draft', draft: null, request: null });
    expect(runs).toEqual([]);
    expect(store.list(film.id, 'draft')).toEqual([]);
  });

  it('per una modifica parte dall’ultima versione, e senza ancora la frase ne usa una breve', async () => {
    const first = await build().writeDraft(film.id, {});

    await build().estimate(film.id, { mode: 'revise' });

    expect(estimates[0]).toMatchObject({ mode: 'revise', draft: first.screenplay });
    expect(estimates[0]?.request).toBeTruthy();
    expect(moderated).toEqual([]);
  });

  it('di una modifica senza bozza dice «non trovato»', async () => {
    const error = await failure(() => build().estimate(film.id, { mode: 'revise' }));

    expect(error.getStatus()).toBe(404);
  });
});

describe('le versioni', () => {
  it('l’elenco va dalla più recente; l’ultima versione è quella in cima', async () => {
    await build().writeDraft(film.id, {});
    await build().revise(film.id, { request: 'Più breve' });

    const { versions } = build().versions(film.id);

    expect(versions.map((v) => v.version)).toEqual([2, 1]);
    expect(build().latest(film.id).version).toBe(2);
  });

  it('senza bozza «ultima versione» è non trovato', () => {
    expect(() => build().latest(film.id)).toThrow(HttpException);
  });

  it('una versione si legge solo dal suo film', async () => {
    const first = await build().writeDraft(film.id, {});

    const error = await failure(() =>
      Promise.resolve().then(() => build().version('altro', first.id)),
    );

    expect(error.getStatus()).toBe(404);
  });
});
