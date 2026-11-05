import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  shotPlannerInputSchema,
  shotSpecSchema,
  type GenerationContext,
  type Project,
  type ScreenplayScene,
  type ScreenplayVersion,
  type ShotSpec,
  type SpendBreach,
  type StoryBible,
} from '@filmzy/contracts';
import {
  createShotStore,
  openFilmzyDatabase,
  type EnqueueInput,
  type SheetStore,
  type ShotStore,
} from '@filmzy/db';
import {
  ProviderError,
  type ConfigSource,
  type LoadedConfig,
  type MediaInput,
  type MediaRunner,
  type SpendGuard,
  type Troupe,
} from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { BibleService } from '../bible/bible.service.js';
import type { JobRunner } from '../jobs/job-runner.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import type { ScreenplayService } from '../screenplay/screenplay.service.js';
import { hashScene } from './plan-shots.js';
import { STORYBOARD_JOB_KIND, StoryboardService } from './storyboard.service.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer);
const bible: StoryBible = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner).bible;

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
  kind: 'short',
  phase: 'shots',
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

const scene: ScreenplayScene = {
  number: 1,
  heading: 'SCENA 1',
  locationId: 'piazza',
  timeOfDay: 'sera',
  characterIds: ['anna'],
  summary: 'Anna arriva.',
  beats: [],
  durationS: 20,
};

const spec: ShotSpec = shotSpecSchema.parse({ ...example.shot, id: 'shot-1' });

const config = {
  presets: { cameraMovements: [example.movement] },
  roles: { storyboard_artist: { params: { variants: 3 } } },
  models: {
    'servizio-a': { family: 'image_generic', connection: 'fal' },
    'servizio-b': { family: 'image_generic', connection: 'fal' },
  },
};

const options = [
  { modelId: 'servizio-a', label: 'Servizio A', estimatedCostUsd: 0.24, isDefault: true },
  { modelId: 'servizio-b', label: 'Servizio B', estimatedCostUsd: 0.4, isDefault: false },
];

const WRITING_COST_USD = 0.03;

interface Submitted {
  role: string;
  request: Parameters<MediaRunner['submit']>[1];
  ctx: GenerationContext;
}

let dataDir: string;
let store: ShotStore;
let handlers: Map<string, (job: { payload: unknown }) => Promise<void>>;
let enqueued: EnqueueInput[];
let registered: { id: string }[];
let written: { role: string; input: unknown; ctx: GenerationContext }[];
let submitted: Submitted[];
/** Cosa fa il finto servizio quando gli si chiede un lavoro: di solito dà tre immagini. */
let mediaBehaviour: () => Promise<{ assetIds: string[] }>;
let writerBehaviour: () => Promise<void>;
let breach: SpendBreach | undefined;
let plan: ScreenplayVersion;

function build() {
  const troupe = {
    run: async (role: string, input: unknown, ctx: GenerationContext) => {
      written.push({ role, input, ctx });
      await writerBehaviour();
      return { data: { prompt: 'close up of [[char:anna]] in a square', negativePrompt: 'text' } };
    },
    estimate: () =>
      Promise.resolve({
        modelId: 'testo',
        modelLabel: 'Testo',
        estimatedCostUsd: WRITING_COST_USD,
      }),
    options: () => Promise.resolve(options),
  } as unknown as Troupe;

  const media: MediaRunner = {
    submit: (role, request, ctx) => {
      submitted.push({ role, request, ctx });
      return Promise.resolve({
        receiptId: 'scontrino-immagini',
        providerRequestId: 'p-1',
        modelId: ctx.modelId ?? '',
        modelLabel: 'Servizio',
        estimatedCostUsd: 0.24,
      });
    },
    collect: async () => {
      const { assetIds } = await mediaBehaviour();
      return {
        state: 'succeeded',
        receipt: {
          id: 'scontrino-immagini',
          modelId: 'servizio-a',
          modelLabel: 'Servizio A (quello che ha lavorato)',
          actualCostUsd: 0.24,
        },
        assets: assetIds.map((assetId) => ({
          assetId,
          path: path.join(dataDir, 'progetti', film.id, 'immagini', `${assetId}.png`),
          contentType: 'image/png',
          bytes: 3,
          checksum: assetId,
        })),
      } as unknown as Awaited<ReturnType<MediaRunner['collect']>>;
    },
  };

  const files = {
    getAsset: (id: string) =>
      id === 'asset-1' || id === 'asset-4'
        ? { path: `progetti/${film.id}/riferimenti/${id}.png`, contentType: 'image/png' }
        : undefined,
    registerAsset: (asset: { id: string }) => {
      registered.push(asset);
    },
  } as unknown as SheetStore;

  const configSource: ConfigSource = {
    load: () =>
      Promise.resolve({
        config,
        origin: 'prova',
        releaseId: 'prova',
        issues: [],
      } as unknown as LoadedConfig),
  };
  const spend: SpendGuard = { check: () => Promise.resolve(breach) };
  const runner = {
    register: (kind: string, handler: (job: { payload: unknown }) => Promise<void>) => {
      handlers.set(kind, handler);
    },
    enqueue: (input: EnqueueInput) => {
      enqueued.push(input);
      return {};
    },
  } as unknown as JobRunner;
  const projects = {
    get: (id: string) => {
      if (id !== film.id) throw new HttpException({ code: 'not_found', retryable: false }, 404);
      return film;
    },
  } as unknown as ProjectsService;
  const bibles = {
    assemble: () => Promise.resolve(bible),
    knownIds: () => ({
      characters: new Set(bible.characters.map((character) => character.id)),
      locations: new Set(bible.locations.map((location) => location.id)),
    }),
  } as unknown as BibleService;
  const screenplays = { latest: () => plan } as unknown as ScreenplayService;

  const service = new StoryboardService(
    store,
    files,
    troupe,
    configSource,
    spend,
    () => media,
    dataDir,
    runner,
    projects,
    bibles,
    screenplays,
  );
  service.onModuleInit();
  return service;
}

async function failure(call: () => Promise<unknown>): Promise<{ status: number; code: string }> {
  try {
    await call();
  } catch (error) {
    if (error instanceof HttpException) {
      return { status: error.getStatus(), code: (error.getResponse() as { code: string }).code };
    }
    throw error;
  }
  throw new Error('doveva fallire');
}

/** Il lavoro in coda, eseguito come farebbe l'esecutore: con il suo carico, una volta. */
async function runQueued(index = 0): Promise<void> {
  const job = enqueued[index];
  const handler = handlers.get(STORYBOARD_JOB_KIND);
  if (job === undefined || handler === undefined) throw new Error('nessun lavoro in coda');
  await handler({ payload: job.payload });
}

const inputsOf = (index = 0): MediaInput[] => submitted[index]?.request.inputs ?? [];

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-storyboard-'));
  const references = path.join(dataDir, 'progetti', film.id, 'riferimenti');
  await mkdir(references, { recursive: true });
  await writeFile(path.join(references, 'asset-1.png'), 'VOLTO');
  await writeFile(path.join(references, 'asset-4.png'), 'SET');

  const opened = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createShotStore(opened.db);
  store.replaceScene({
    projectId: film.id,
    sceneNumber: 1,
    sceneHash: hashScene(scene),
    screenplayId: 'stesura-1',
    shots: [spec],
  });

  handlers = new Map();
  enqueued = [];
  registered = [];
  written = [];
  submitted = [];
  breach = undefined;
  mediaBehaviour = () => Promise.resolve({ assetIds: ['img-1', 'img-2', 'img-3'] });
  writerBehaviour = () => Promise.resolve();
  plan = {
    id: 'stesura-1',
    projectId: film.id,
    stage: 'final',
    version: 1,
    screenplay: {
      title: film.title,
      logline: 'Una bobina dimenticata.',
      characters: [],
      locations: [],
      scenes: [scene],
    },
    createdAt: '2026-11-02T10:00:00.000Z',
  };
  return () => {
    opened.close();
  };
});

describe('i servizi e il prezzo', () => {
  it('il prezzo di ogni servizio è quello delle immagini più il testo del prompt', async () => {
    const { options: priced } = await build().options(film.id, 'shot-1', 'storyboard');

    expect(priced.map((option) => [option.modelId, option.estimatedCostUsd])).toEqual([
      ['servizio-a', 0.24 + WRITING_COST_USD],
      ['servizio-b', 0.4 + WRITING_COST_USD],
    ]);
  });

  it('per i prezzi non si leggono i file dei riferimenti: contano solo quanti sono', async () => {
    const references = path.join(dataDir, 'progetti', film.id, 'riferimenti');
    await rm(path.join(references, 'asset-1.png'));
    await rm(path.join(references, 'asset-4.png'));

    const { options: priced } = await build().options(film.id, 'shot-1', 'storyboard');

    expect(priced).toHaveLength(2);
  });
});

describe('chiedere lo storyboard', () => {
  it('mette in coda un tentativo col servizio predefinito e un’impronta che non lo conta due volte', async () => {
    const storyboard = await build().start(film.id, 'shot-1', 'storyboard', {});

    expect(storyboard.attempts.map((attempt) => [attempt.attempt, attempt.status])).toEqual([
      [1, 'queued'],
    ]);
    expect(enqueued).toHaveLength(1);
    expect(enqueued[0]).toMatchObject({
      kind: STORYBOARD_JOB_KIND,
      projectId: film.id,
      idempotencyKey: `${STORYBOARD_JOB_KIND}:shot-1:storyboard:1`,
      payload: {
        projectId: film.id,
        shotId: 'shot-1',
        attempt: 1,
        mode: 'storyboard',
        modelId: 'servizio-a',
      },
    });
  });

  it('il servizio scelto è un requisito, e uno che non è tra quelli adatti non si sostituisce', async () => {
    const service = build();

    expect(
      await failure(() => service.start(film.id, 'shot-1', 'storyboard', { modelId: 'altro' })),
    ).toEqual({
      status: 409,
      code: 'no_eligible_model',
    });
    expect(store.storyboard('shot-1', 'storyboard').attempts).toEqual([]);

    await service.start(film.id, 'shot-1', 'storyboard', { modelId: 'servizio-b' });
    expect(enqueued[0]?.payload).toMatchObject({ modelId: 'servizio-b' });
  });

  it('mentre un tentativo lavora non se ne apre un altro', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', 'storyboard', {});

    expect(await failure(() => service.start(film.id, 'shot-1', 'storyboard', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
    expect(enqueued).toHaveLength(1);
  });

  it('due richieste ravvicinate (un doppio clic) aprono un solo tentativo e pagano una volta', async () => {
    const service = build();

    const replies = await Promise.allSettled([
      service.start(film.id, 'shot-1', 'storyboard', {}),
      service.start(film.id, 'shot-1', 'storyboard', {}),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(enqueued).toHaveLength(1);
    expect(store.storyboard('shot-1', 'storyboard').attempts).toHaveLength(1);
  });

  it('un limite di spesa ferma prima di mettere in coda, e la conferma dell’utente lo supera', async () => {
    breach = { limit: 'confirm_above', limitUsd: 0.1, spentUsd: 0, estimatedUsd: 0.27 };
    const service = build();

    await expect(service.start(film.id, 'shot-1', 'storyboard', {})).rejects.toMatchObject({
      code: 'spend_cap_reached',
    });
    expect(enqueued).toEqual([]);
    expect(store.storyboard('shot-1', 'storyboard').attempts).toEqual([]);

    await service.start(film.id, 'shot-1', 'storyboard', { spendConfirmed: true });
    expect(enqueued[0]?.payload).toMatchObject({ spendConfirmed: true });
  });

  it('se la scena è cambiata dopo il piano, o l’inquadratura non c’è, non parte', async () => {
    const service = build();
    plan.screenplay.scenes = [{ ...scene, summary: 'Una scena riscritta.' }];

    expect(await failure(() => service.start(film.id, 'shot-1', 'storyboard', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
    expect(await failure(() => service.start(film.id, 'non-c-e', 'storyboard', {}))).toEqual({
      status: 404,
      code: 'not_found',
    });
    expect(enqueued).toEqual([]);
  });
});

describe('il lavoro in coda', () => {
  it('il direttore della fotografia scrive il prompt, poi il servizio disegna con il volto e il set', async () => {
    await build().start(film.id, 'shot-1', 'storyboard', { spendConfirmed: true });
    await runQueued();

    expect(written).toHaveLength(1);
    expect(written[0]?.role).toBe('cinematographer');
    expect(written[0]?.ctx).toEqual({
      purpose: 'product',
      projectId: film.id,
      shotId: 'shot-1',
      spendConfirmed: true,
    });
    expect(cinematographerInputSchema.parse(written[0]?.input).target.family).toBe('image_generic');

    expect(submitted).toHaveLength(1);
    expect(submitted[0]?.role).toBe('storyboard_artist');
    expect(submitted[0]?.ctx).toMatchObject({ modelId: 'servizio-a', shotId: 'shot-1' });
    expect(submitted[0]?.request).toMatchObject({
      prompt: 'close up of [[char:anna]] in a square',
      negativePrompt: 'text',
      characterIds: ['anna'],
      params: { variants: 3 },
    });
    // Prima i volti (nell'ordine dei personaggi), poi il set.
    expect(
      inputsOf().map((input) => [input.use, new TextDecoder().decode(input.file.bytes)]),
    ).toEqual([
      ['reference', 'VOLTO'],
      ['reference', 'SET'],
    ]);
  });

  it('le immagini si copiano nella cartella del film e il tentativo le elenca', async () => {
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(registered.map((asset) => asset.id)).toEqual(['img-1', 'img-2', 'img-3']);
    const attempt = store.storyboard('shot-1', 'storyboard').attempts[0];
    expect(attempt).toMatchObject({
      attempt: 1,
      status: 'succeeded',
      assetIds: ['img-1', 'img-2', 'img-3'],
    });
  });

  it('il tentativo dice con quale servizio è fatto fin dall’inizio, e alla fine il servizio vero e il costo vero', async () => {
    const service = build();
    const started = await service.start(film.id, 'shot-1', 'storyboard', { modelId: 'servizio-b' });
    expect(started.attempts[0]?.modelLabel).toBe('Servizio B');

    await runQueued();

    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'succeeded',
      modelLabel: 'Servizio A (quello che ha lavorato)',
      costUsd: 0.24,
    });
  });

  it('un riferimento il cui file non c’è più si salta, e il personaggio non si cita nel prompt', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', 'storyboard', {});
    // Il record c'è ma il file è sparito: lo stesso di una cartella ripulita a mano.
    await rm(path.join(dataDir, 'progetti', film.id, 'riferimenti', 'asset-1.png'));

    await runQueued();

    expect(submitted[0]?.request.characterIds).toEqual([]);
    expect(inputsOf().map((input) => new TextDecoder().decode(input.file.bytes))).toEqual(['SET']);
    expect(store.storyboard('shot-1', 'storyboard').attempts[0]?.status).toBe('succeeded');
  });

  it('se il servizio rifiuta, il tentativo lo dice col codice e non si prova un altro servizio', async () => {
    mediaBehaviour = () => Promise.reject(new ProviderError('content_rejected', false, 'no'));
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'content_rejected',
    });
    expect(submitted).toHaveLength(1);
    expect(registered).toEqual([]);
  });

  it('se il direttore della fotografia non riesce, non si spende per le immagini', async () => {
    writerBehaviour = () => Promise.reject(new ProviderError('spend_cap_reached', false, 'tetto'));
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'spend_cap_reached',
    });
    expect(submitted).toEqual([]);
  });

  it('un servizio che non dà immagini è un errore, non un tentativo riuscito e vuoto', async () => {
    mediaBehaviour = () => Promise.resolve({ assetIds: [] });
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'invalid_output',
    });
  });

  it('un lavoro ripetuto su un tentativo già chiuso non spende di nuovo e non cancella le varianti', async () => {
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();
    await runQueued();

    expect(written).toHaveLength(1);
    expect(submitted).toHaveLength(1);
    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'succeeded',
      assetIds: ['img-1', 'img-2', 'img-3'],
    });
  });

  it('un errore imprevisto chiude il tentativo come «unknown»: il lavoro non resta a metà', async () => {
    mediaBehaviour = () => Promise.reject(new Error('disco pieno'));
    await build().start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(store.storyboard('shot-1', 'storyboard').attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'unknown',
    });
  });

  it('se il piano è stato rifatto mentre il lavoro aspettava, non c’è più niente da fare', async () => {
    await build().start(film.id, 'shot-1', 'storyboard', {});
    store.replaceScene({
      projectId: film.id,
      sceneNumber: 1,
      sceneHash: hashScene(scene),
      screenplayId: 'stesura-1',
      shots: [{ ...spec, id: 'shot-2' }],
    });

    await runQueued();

    expect(written).toEqual([]);
    expect(submitted).toEqual([]);
  });
});

describe('scegliere la variante', () => {
  it('vale solo una variante di un tentativo riuscito di quell’inquadratura', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(
      await failure(() =>
        Promise.resolve(service.choose(film.id, 'shot-1', 'storyboard', 'altra')),
      ),
    ).toEqual({ status: 409, code: 'invalid_request' });
    expect(service.choose(film.id, 'shot-1', 'storyboard', 'img-2').chosenAssetId).toBe('img-2');
    expect(store.chosenStoryboards(film.id)).toEqual({ 'shot-1': 'img-2' });
  });

  it('una variante di un tentativo fallito non si può scegliere', async () => {
    mediaBehaviour = () => Promise.reject(new ProviderError('timeout', true, 'lento'));
    const service = build();
    await service.start(film.id, 'shot-1', 'storyboard', {});
    await runQueued();

    expect(
      await failure(() =>
        Promise.resolve(service.choose(film.id, 'shot-1', 'storyboard', 'img-1')),
      ),
    ).toEqual({ status: 409, code: 'invalid_request' });
  });
});

describe('l’ultimo fotogramma', () => {
  /** L'utente ha impostato il primo fotogramma: un'immagine di cui il file esiste. */
  const withFirstFrame = (assetId = 'asset-1') => {
    const stored = store.get('shot-1');
    if (stored === undefined) throw new Error('l’inquadratura doveva esserci');
    store.updateSpec('shot-1', {
      ...stored.spec,
      images: [{ use: 'first_frame', from: 'generate', assetId }],
    });
  };

  it('senza il primo fotogramma non c’è cosa modificare: lo dice, prima di spendere', async () => {
    const service = build();

    expect(await failure(() => service.options(film.id, 'shot-1', 'end_frame'))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
    expect(await failure(() => service.start(film.id, 'shot-1', 'end_frame', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
    expect(enqueued).toEqual([]);
  });

  it('ha i suoi tentativi, numerati a parte, e il lavoro dice il modo', async () => {
    withFirstFrame();
    const service = build();
    await service.start(film.id, 'shot-1', 'storyboard', {});
    await runQueued(0);

    const started = await service.start(film.id, 'shot-1', 'end_frame', {});

    expect(started.attempts.map((attempt) => [attempt.attempt, attempt.status])).toEqual([
      [1, 'queued'],
    ]);
    expect(enqueued[1]).toMatchObject({
      idempotencyKey: `${STORYBOARD_JOB_KIND}:shot-1:end_frame:1`,
      payload: { mode: 'end_frame', attempt: 1 },
    });
    expect(store.storyboard('shot-1', 'storyboard').attempts).toHaveLength(1);
  });

  it('il servizio riceve il primo fotogramma da modificare, poi i volti e il set', async () => {
    withFirstFrame();
    await build().start(film.id, 'shot-1', 'end_frame', {});
    await runQueued();

    expect(cinematographerInputSchema.parse(written[0]?.input).target).toMatchObject({
      frame: 'end',
      inputs: ['first_frame', 'last_frame'],
    });
    expect(submitted[0]?.request.idempotencyKey).toBe('shot-1:end_frame:1');
    expect(
      inputsOf().map((input) => [input.use, new TextDecoder().decode(input.file.bytes)]),
    ).toEqual([
      ['base_image', 'VOLTO'],
      ['reference', 'VOLTO'],
      ['reference', 'SET'],
    ]);
    expect(store.storyboard('shot-1', 'end_frame').attempts[0]?.status).toBe('succeeded');
  });

  it('se il primo fotogramma non c’è più sul disco il tentativo fallisce, senza spendere per le immagini', async () => {
    withFirstFrame('asset-4');
    const service = build();
    await service.start(film.id, 'shot-1', 'end_frame', {});
    await rm(path.join(dataDir, 'progetti', film.id, 'riferimenti', 'asset-4.png'));

    await runQueued();

    expect(store.storyboard('shot-1', 'end_frame').attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'invalid_request',
    });
    // Nemmeno il testo si paga: i file si leggono prima.
    expect(written).toEqual([]);
    expect(submitted).toEqual([]);
  });

  it('scegliere una variante la imposta come ultimo fotogramma, al posto di quello di prima', async () => {
    withFirstFrame();
    const service = build();
    await service.start(film.id, 'shot-1', 'end_frame', {});
    await runQueued();

    const chosen = service.choose(film.id, 'shot-1', 'end_frame', 'img-2');

    expect(chosen.chosenAssetId).toBe('img-2');
    expect(store.get('shot-1')?.spec.images).toEqual([
      { use: 'first_frame', from: 'generate', assetId: 'asset-1' },
      { use: 'last_frame', from: 'generate', assetId: 'img-2' },
    ]);
    // Lo storyboard non si tocca.
    expect(store.chosenStoryboards(film.id)).toEqual({});

    expect(service.choose(film.id, 'shot-1', 'end_frame', 'img-3').chosenAssetId).toBe('img-3');
    expect(store.get('shot-1')?.spec.images.filter((i) => i.use === 'last_frame')).toHaveLength(1);
    expect(
      await failure(() => Promise.resolve(service.choose(film.id, 'shot-1', 'end_frame', 'x'))),
    ).toEqual({ status: 409, code: 'invalid_request' });
  });

  it('un’immagine scelta come ultimo fotogramma lascia gli altri ruoli che aveva', async () => {
    withFirstFrame();
    const service = build();
    await service.start(film.id, 'shot-1', 'end_frame', {});
    await runQueued();
    const stored = store.get('shot-1');
    if (stored === undefined) throw new Error('l’inquadratura doveva esserci');
    store.updateSpec('shot-1', {
      ...stored.spec,
      images: [...stored.spec.images, { use: 'reference', from: 'generate', assetId: 'img-2' }],
    });

    service.choose(film.id, 'shot-1', 'end_frame', 'img-2');

    expect(store.get('shot-1')?.spec.images).toEqual([
      { use: 'first_frame', from: 'generate', assetId: 'asset-1' },
      { use: 'last_frame', from: 'generate', assetId: 'img-2' },
    ]);
  });

  it('se l’ultimo fotogramma impostato non viene da questi tentativi, non si segna come scelto', async () => {
    withFirstFrame();
    const stored = store.get('shot-1');
    if (stored === undefined) throw new Error('l’inquadratura doveva esserci');
    store.updateSpec('shot-1', {
      ...stored.spec,
      images: [...stored.spec.images, { use: 'last_frame', from: 'generate', assetId: 'altrove' }],
    });
    const service = build();
    await service.start(film.id, 'shot-1', 'end_frame', {});
    await runQueued();

    expect(service.storyboard(film.id, 'shot-1', 'end_frame').chosenAssetId).toBeUndefined();
  });
});
