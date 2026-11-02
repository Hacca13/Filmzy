import {
  ROLE_OUTPUT_EXAMPLES,
  screenplaySchema,
  type Character,
  type GenerationContext,
  type Location,
  type Project,
  type Screenplay,
  type ScreenplayScene,
  type ScreenwriterInput,
  type TroupePresetsData,
} from '@filmzy/contracts';
import {
  createScreenplayStore,
  openFilmzyDatabase,
  type CharacterStore,
  type LocationStore,
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
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { FinalScreenplayService } from './final-screenplay.service.js';

const example = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

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
  phase: 'locations',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:00:00.000Z',
};

/** La bozza: due personaggi e un luogo proposti. */
const draft: Screenplay = {
  title: 'L’ultima corsa',
  logline: 'Una bobina dimenticata.',
  characters: [
    { id: 'anna-p', name: 'Anna', role: 'protagonista' },
    { id: 'oste-p', name: 'L’oste', role: 'comparsa' },
  ],
  locations: [
    { id: 'stazione-p', name: 'La stazione', description: 'Di notte', prompt: 'station' },
  ],
  scenes: example.scenes,
};

const anna = {
  id: 'c-anna',
  name: 'Anna',
  proposalId: 'anna-p',
  sheet: [{ assetId: 'a-1' }],
} as unknown as Character;
const stazione = {
  id: 'l-stazione',
  name: 'La stazione',
  proposalId: 'stazione-p',
  references: [{ assetId: 'a-2' }],
} as unknown as Location;

const configSource: ConfigSource = {
  load: () =>
    Promise.resolve({
      config: { presets, limits: { max_characters: 2 }, features: { dialogue: false } },
      origin: 'prova',
      releaseId: 'prova',
      issues: [],
    } as unknown as LoadedConfig),
};

const modelScene: ScreenplayScene = {
  number: 1,
  heading: 'INT. STAZIONE - NOTTE',
  locationId: 'l-stazione',
  timeOfDay: 'notte',
  characterIds: ['c-anna'],
  summary: 'Anna trova la bobina.',
  beats: ['Anna entra', 'Trova la bobina'],
  durationS: 30,
};

interface RunCall {
  input: ScreenwriterInput;
  ctx: GenerationContext;
}

let store: ScreenplayStore;
let runs: RunCall[];
let estimates: ScreenwriterInput[];
let moderated: ModerationRequest[];
let reached: string[];
let modelAnswer: Screenplay;

function build(options: { characters?: Character[]; locations?: Location[] } = {}) {
  const troupe = {
    run: (_role: string, input: ScreenwriterInput, ctx: GenerationContext) => {
      runs.push({ input, ctx });
      return Promise.resolve({
        data: modelAnswer,
        receipt: { id: `scontrino-${String(runs.length)}` },
      });
    },
    estimate: (_role: string, input: ScreenwriterInput) => {
      estimates.push(input);
      return Promise.resolve({ modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: 0.05 });
    },
  } as unknown as Troupe;
  const moderation = {
    assertAllowed: (request: ModerationRequest) => {
      moderated.push(request);
      return Promise.resolve();
    },
  } as unknown as ModerationService;
  const projects = {
    get: (id: string) => {
      if (id !== film.id && id !== 'film-senza-bozza') {
        throw new HttpException({ code: 'not_found', retryable: false }, 404);
      }
      return { ...film, id };
    },
    reach: (_id: string, phase: string) => {
      reached.push(phase);
    },
  } as unknown as ProjectsService;
  const characters = { list: () => options.characters ?? [anna] } as unknown as CharacterStore;
  const locations = { list: () => options.locations ?? [stazione] } as unknown as LocationStore;
  const screenplays = new ScreenplayService(store, troupe, configSource, projects, moderation);
  return new FinalScreenplayService(
    store,
    characters,
    locations,
    troupe,
    configSource,
    screenplays,
    projects,
    moderation,
  );
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

const codeOf = (error: HttpException) => (error.getResponse() as { code: string }).code;

beforeEach(async () => {
  const opened = await openFilmzyDatabase({
    dataDir: await mkdtemp(path.join(tmpdir(), 'filmzy-stesura-')),
    appVersion: '0.0.0-test',
  });
  store = createScreenplayStore(opened.db);
  runs = [];
  estimates = [];
  moderated = [];
  reached = [];
  modelAnswer = {
    title: 'L’ultima corsa',
    logline: 'Una bobina dimenticata.',
    characters: [],
    locations: [],
    scenes: [modelScene],
  };
  store.create({ projectId: film.id, stage: 'draft', screenplay: draft });
  return () => {
    opened.close();
  };
});

describe('il riepilogo', () => {
  it('confronta l’ultima bozza con cast e luoghi: l’oste citato e non scelto è una differenza', () => {
    const review = build().review(film.id);

    expect(review.draftVersionId).toBe(store.latest(film.id, 'draft')?.id);
    expect(review.differences.map((difference) => difference.key)).toEqual([
      'character:not_chosen:oste-p',
    ]);
  });

  it('senza bozza non c’è niente da confrontare, e un film che non esiste dà «non trovato»', () => {
    const service = build();
    expect(() => service.review('film-senza-bozza')).toThrow(HttpException);
    expect(() => service.review('film-sconosciuto')).toThrow(HttpException);
  });
});

describe('la stesura ufficiale', () => {
  it('lo sceneggiatore riceve la bozza, cast e luoghi scelti (senza immagini) e gli elementi tenuti', async () => {
    await build().write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'keep' }],
    });

    expect(runs).toHaveLength(1);
    const input = runs[0]?.input;
    expect(input).toMatchObject({
      mode: 'final',
      request: null,
      draft: draft,
      accepted: [{ kind: 'character', name: 'L’oste' }],
    });
    expect(input?.characters).toEqual([{ ...anna, sheet: [] }]);
    expect(input?.locations).toEqual([{ ...stazione, references: [] }]);
    expect(runs[0]?.ctx).toEqual({ purpose: 'product', projectId: film.id });
  });

  it('«Adatta la storia» non porta niente: l’oste non entra tra gli elementi tenuti', async () => {
    await build().write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'adapt' }],
    });

    expect(runs[0]?.input.accepted).toEqual([]);
  });

  it('salva una versione 1 della stesura, con lo scontrino, e porta il film alla fase «final»', async () => {
    const version = await build().write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'adapt' }],
    });

    expect(version).toMatchObject({ stage: 'final', version: 1, generationId: 'scontrino-1' });
    expect(store.latest(film.id, 'final')).toEqual(version);
    expect(store.latest(film.id, 'draft')?.version).toBe(1);
    expect(reached).toEqual(['final']);
  });

  it('toglie dalle scene i personaggi e i luoghi che il modello ha inventato', async () => {
    modelAnswer = {
      ...modelAnswer,
      characters: [{ id: 'x', name: 'Intruso', role: 'comparsa' }],
      scenes: [{ ...modelScene, characterIds: ['c-anna', 'fantasma'], locationId: 'inventato' }],
    };
    const version = await build().write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'adapt' }],
    });

    expect(version.screenplay.characters).toEqual([]);
    expect(version.screenplay.scenes[0]?.characterIds).toEqual(['c-anna']);
    expect(version.screenplay.scenes[0]).not.toHaveProperty('locationId');
  });

  it('una risposta mancante ferma tutto prima di spendere', async () => {
    const error = await failure(() => build().write(film.id, { answers: [] }));

    expect(codeOf(error)).toBe('invalid_request');
    expect(runs).toEqual([]);
    expect(store.latest(film.id, 'final')).toBeUndefined();
  });

  it('con la conferma dell’utente il limite di spesa si supera per questa richiesta sola', async () => {
    const answers = [{ key: 'character:not_chosen:oste-p', decision: 'adapt' as const }];
    await build().write(film.id, { answers, spendConfirmed: true });
    await build().write(film.id, { answers });

    expect(runs[0]?.ctx.spendConfirmed).toBe(true);
    expect(runs[1]?.ctx.spendConfirmed).toBeUndefined();
    expect(store.latest(film.id, 'final')?.version).toBe(2);
  });

  it('la stima usa gli stessi ingressi e non chiama nessuno', async () => {
    const { estimate } = await build().estimate(film.id);

    expect(estimate.estimatedCostUsd).toBe(0.05);
    expect(estimates[0]).toMatchObject({ mode: 'final', draft });
    expect(runs).toEqual([]);
  });
});

describe('la stesura corretta a mano', () => {
  async function withFinal() {
    const service = build();
    await service.write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'adapt' }],
    });
    runs = [];
    return service;
  }

  it('salva una versione nuova senza chiamare lo sceneggiatore, e fa controllare solo il testo cambiato', async () => {
    const service = await withFinal();
    const latest = store.latest(film.id, 'final');
    if (latest === undefined) throw new Error('la stesura doveva esserci');

    const edited = await service.edit(film.id, {
      screenplay: { ...latest.screenplay, title: 'La corsa di notte' },
    });

    expect(edited).toMatchObject({ stage: 'final', version: 2 });
    expect(edited.screenplay.title).toBe('La corsa di notte');
    expect(edited.generationId).toBeUndefined();
    expect(runs).toEqual([]);
    expect(moderated).toEqual([
      { text: 'La corsa di notte', context: 'scene', language: 'it', projectId: film.id },
    ]);
    expect(store.list(film.id, 'final').map((version) => version.version)).toEqual([2, 1]);
  });

  it('se non è cambiato niente restituisce l’ultima versione e non ne crea una uguale', async () => {
    const service = await withFinal();
    const latest = store.latest(film.id, 'final');
    if (latest === undefined) throw new Error('la stesura doveva esserci');

    const same = await service.edit(film.id, { screenplay: latest.screenplay });

    expect(same).toEqual(latest);
    expect(store.list(film.id, 'final')).toHaveLength(1);
    expect(moderated).toEqual([]);
  });

  it('se cambia solo la durata di una scena si salva, ma non c’è testo da controllare', async () => {
    const service = await withFinal();
    const latest = store.latest(film.id, 'final');
    if (latest === undefined) throw new Error('la stesura doveva esserci');

    await service.edit(film.id, {
      screenplay: {
        ...latest.screenplay,
        scenes: latest.screenplay.scenes.map((scene) => ({ ...scene, durationS: 45 })),
      },
    });

    expect(moderated).toEqual([]);
    expect(store.latest(film.id, 'final')?.version).toBe(2);
  });

  it('rifiuta una scena che cita un personaggio che il film non ha', async () => {
    const service = await withFinal();
    const latest = store.latest(film.id, 'final');
    if (latest === undefined) throw new Error('la stesura doveva esserci');

    const error = await failure(() =>
      service.edit(film.id, {
        screenplay: {
          ...latest.screenplay,
          scenes: latest.screenplay.scenes.map((scene) => ({
            ...scene,
            characterIds: ['fantasma'],
          })),
        },
      }),
    );

    expect(codeOf(error)).toBe('invalid_request');
    expect(store.list(film.id, 'final')).toHaveLength(1);
  });

  it('senza una stesura da correggere dà «non trovato»', async () => {
    const error = await failure(() => build().edit(film.id, { screenplay: example }));

    expect(codeOf(error)).toBe('not_found');
  });
});

describe('la stesura dopo una modifica del cast', () => {
  it('se un personaggio è stato tolto dal film si corregge lo stesso, e la scena non lo cita più', async () => {
    await build().write(film.id, {
      answers: [{ key: 'character:not_chosen:oste-p', decision: 'adapt' }],
    });
    const latest = store.latest(film.id, 'final');
    if (latest === undefined) throw new Error('la stesura doveva esserci');
    expect(latest.screenplay.scenes[0]?.characterIds).toEqual(['c-anna']);

    // Anna è stata tolta dal cast: la stesura la cita ancora, ma il titolo si può correggere.
    const edited = await build({ characters: [] }).edit(film.id, {
      screenplay: { ...latest.screenplay, title: 'La corsa di notte' },
    });

    expect(edited.version).toBe(2);
    expect(edited.screenplay.scenes[0]?.characterIds).toEqual([]);
  });
});
