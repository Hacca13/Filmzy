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
  createTakeStore,
  openFilmzyDatabase,
  type EnqueueInput,
  type SheetStore,
  type ShotStore,
  type TakeStore,
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
import { TAKE_JOB_KIND, TakesService } from './takes.service.js';
import { STALE_WORK_MS } from './work.js';

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
  roles: {},
  models: {
    'video-a': { family: 'kling', connection: 'fal' },
    'video-b': { family: 'seedance', connection: 'fal' },
  },
};

const options = [
  { modelId: 'video-a', label: 'Video A', estimatedCostUsd: 1.2, isDefault: true },
  { modelId: 'video-b', label: 'Video B', estimatedCostUsd: 0.6, isDefault: false },
];

const WRITING_COST_USD = 0.03;

let dataDir: string;
let openedDb: Awaited<ReturnType<typeof openFilmzyDatabase>>['db'];
let store: ShotStore;
let takes: TakeStore;
let handlers: Map<string, (job: { payload: unknown }) => Promise<void>>;
let enqueued: EnqueueInput[];
let registered: { id: string }[];
let written: { role: string; input: unknown; ctx: GenerationContext }[];
let priced: { role: string; inputs: string[]; characterIds: string[]; durationS?: number }[];
let submitted: {
  role: string;
  request: Parameters<MediaRunner['submit']>[1];
  ctx: GenerationContext;
}[];
/** Cosa fa il finto servizio quando gli si chiede un video: di solito dà una clip, costata 1,17 $. */
let mediaBehaviour: () => Promise<{ assetIds: string[] }>;
let breach: SpendBreach | undefined;
let plan: ScreenplayVersion;

function build() {
  const troupe = {
    run: (role: string, input: unknown, ctx: GenerationContext) => {
      written.push({ role, input, ctx });
      return Promise.resolve({
        data: { prompt: 'slow push-in on [[char:anna]]', negativePrompt: 'text' },
      });
    },
    estimate: () =>
      Promise.resolve({
        modelId: 'testo',
        modelLabel: 'Testo',
        estimatedCostUsd: WRITING_COST_USD,
      }),
    options: (
      role: string,
      request: { inputs: MediaInput[]; characterIds: string[]; durationS?: number },
    ) => {
      priced.push({
        role,
        inputs: request.inputs.map((input) => input.use),
        characterIds: request.characterIds,
        ...(request.durationS === undefined ? {} : { durationS: request.durationS }),
      });
      return Promise.resolve(options);
    },
  } as unknown as Troupe;

  const media: MediaRunner = {
    submit: (role, request, ctx) => {
      submitted.push({ role, request, ctx });
      return Promise.resolve({
        receiptId: 'scontrino-video',
        providerRequestId: 'p-1',
        modelId: ctx.modelId ?? '',
        modelLabel: 'Servizio finto',
        estimatedCostUsd: 1.2,
      });
    },
    collect: async () => {
      const { assetIds } = await mediaBehaviour();
      return {
        state: 'succeeded',
        receipt: {
          id: 'scontrino-video',
          modelId: 'video-a',
          modelLabel: 'Video A (quello che ha lavorato)',
          actualCostUsd: 1.17,
        },
        assets: assetIds.map((assetId) => ({
          assetId,
          path: path.join(dataDir, 'progetti', film.id, 'take', `${assetId}.mp4`),
          contentType: 'video/mp4',
          bytes: 3,
          checksum: assetId,
        })),
      } as unknown as Awaited<ReturnType<MediaRunner['collect']>>;
    },
  };

  const files = {
    getAsset: (id: string) =>
      ['asset-1', 'asset-4', 'primo', 'ultimo', 'ispirazione'].includes(id)
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

  const service = new TakesService(
    store,
    takes,
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
  const handler = handlers.get(TAKE_JOB_KIND);
  if (job === undefined || handler === undefined) throw new Error('nessun lavoro in coda');
  await handler({ payload: job.payload });
}

const only = () => {
  const [first] = takes.list('shot-1');
  if (first === undefined) throw new Error('doveva esserci un take');
  return first;
};

/** L'utente ha impostato queste immagini: sono file che esistono. */
function withImages(...images: ShotSpec['images']) {
  const stored = store.get('shot-1');
  if (stored === undefined) throw new Error('l’inquadratura doveva esserci');
  store.updateSpec('shot-1', { ...stored.spec, images });
}

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-take-'));
  const references = path.join(dataDir, 'progetti', film.id, 'riferimenti');
  await mkdir(references, { recursive: true });
  for (const [id, content] of [
    ['asset-1', 'VOLTO'],
    ['asset-4', 'SET'],
    ['primo', 'PRIMO'],
    ['ultimo', 'ULTIMO'],
    ['ispirazione', 'ESEMPIO'],
  ] as const) {
    await writeFile(path.join(references, `${id}.png`), content);
  }

  const opened = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createShotStore(opened.db);
  takes = createTakeStore(opened.db);
  openedDb = opened.db;
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
  priced = [];
  submitted = [];
  breach = undefined;
  mediaBehaviour = () => Promise.resolve({ assetIds: ['clip-1'] });
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
  it('il prezzo di ogni servizio è quello del video più il testo del prompt', async () => {
    const { options: shown } = await build().options(film.id, 'shot-1');

    expect(shown.map((option) => [option.modelId, option.estimatedCostUsd])).toEqual([
      ['video-a', 1.2 + WRITING_COST_USD],
      ['video-b', 0.6 + WRITING_COST_USD],
    ]);
  });

  it('i servizi si scelgono con le immagini che il video riceverebbe, e la sua durata', async () => {
    withImages(
      { use: 'first_frame', from: 'generate', assetId: 'primo' },
      { use: 'last_frame', from: 'generate', assetId: 'ultimo' },
    );

    await build().options(film.id, 'shot-1');

    expect(priced).toEqual([
      {
        role: 'camera_operator',
        inputs: ['first_frame', 'last_frame'],
        characterIds: [],
        durationS: spec.intent.durationS,
      },
    ]);
  });
});

describe('chiedere un take', () => {
  it('mette in coda un take col servizio predefinito, che porta il suo nome', async () => {
    const started = await build().start(film.id, 'shot-1', {});

    expect(started.takes).toHaveLength(1);
    expect(started.takes[0]).toMatchObject({
      status: 'queued',
      modelId: 'video-a',
      modelLabel: 'Video A',
    });
    expect(enqueued[0]).toMatchObject({
      kind: TAKE_JOB_KIND,
      projectId: film.id,
      idempotencyKey: `${TAKE_JOB_KIND}:${only().id}`,
      payload: { projectId: film.id, shotId: 'shot-1', takeId: only().id, modelId: 'video-a' },
    });
  });

  it('il servizio scelto è un requisito, e uno che non è tra quelli adatti non si sostituisce', async () => {
    const service = build();

    expect(await failure(() => service.start(film.id, 'shot-1', { modelId: 'altro' }))).toEqual({
      status: 409,
      code: 'no_eligible_model',
    });
    expect(takes.list('shot-1')).toEqual([]);
    expect(enqueued).toEqual([]);

    await service.start(film.id, 'shot-1', { modelId: 'video-b' });
    expect(only().modelLabel).toBe('Video B');
  });

  it('due richieste ravvicinate (un doppio clic) aprono un solo take e pagano una volta', async () => {
    const service = build();

    const replies = await Promise.allSettled([
      service.start(film.id, 'shot-1', {}),
      service.start(film.id, 'shot-1', {}),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(enqueued).toHaveLength(1);
    expect(takes.list('shot-1')).toHaveLength(1);
  });

  it('mentre un take lavora non se ne apre un altro; quando è finito sì, e il primo resta', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', {});

    expect(await failure(() => service.start(film.id, 'shot-1', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });

    await runQueued();
    await service.start(film.id, 'shot-1', { modelId: 'video-b' });
    expect(takes.list('shot-1').map((take) => take.modelLabel)).toEqual([
      'Video B',
      'Video A (quello che ha lavorato)',
    ]);
  });

  it('un limite di spesa ferma prima di mettere in coda, e la conferma dell’utente lo supera', async () => {
    breach = { limit: 'confirm_above', limitUsd: 1, spentUsd: 0, estimatedUsd: 1.23 };
    const service = build();

    await expect(service.start(film.id, 'shot-1', {})).rejects.toMatchObject({
      code: 'spend_cap_reached',
    });
    expect(takes.list('shot-1')).toEqual([]);
    expect(enqueued).toEqual([]);

    await service.start(film.id, 'shot-1', { spendConfirmed: true });
    expect(enqueued[0]?.payload).toMatchObject({ spendConfirmed: true });
  });

  it('se la scena è cambiata dopo il piano, o l’inquadratura non c’è, non parte', async () => {
    const service = build();
    plan.screenplay.scenes = [{ ...scene, summary: 'Una scena riscritta.' }];

    expect(await failure(() => service.start(film.id, 'shot-1', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
    expect(await failure(() => service.start(film.id, 'non-c-e', {}))).toEqual({
      status: 404,
      code: 'not_found',
    });
    expect(await failure(() => service.start('altro', 'shot-1', {}))).toEqual({
      status: 404,
      code: 'not_found',
    });
    expect(enqueued).toEqual([]);
  });
});

describe('il lavoro in coda', () => {
  it('senza immagini impostate il video riceve il volto e il set, e il prompt dice «video»', async () => {
    await build().start(film.id, 'shot-1', { spendConfirmed: true });
    await runQueued();

    expect(written[0]?.role).toBe('cinematographer');
    expect(written[0]?.ctx).toEqual({
      purpose: 'product',
      projectId: film.id,
      shotId: 'shot-1',
      spendConfirmed: true,
    });
    expect(cinematographerInputSchema.parse(written[0]?.input).target).toMatchObject({
      family: 'kling',
      kind: 'video',
      frame: 'clip',
      inputs: ['references'],
    });
    expect(submitted).toHaveLength(1);
    expect(submitted[0]?.role).toBe('camera_operator');
    expect(submitted[0]?.ctx).toMatchObject({ modelId: 'video-a', shotId: 'shot-1' });
    expect(submitted[0]?.request).toMatchObject({
      prompt: 'slow push-in on [[char:anna]]',
      negativePrompt: 'text',
      characterIds: ['anna'],
      durationS: spec.intent.durationS,
    });
    expect(
      submitted[0]?.request.inputs.map((input) => [
        input.use,
        new TextDecoder().decode(input.file.bytes),
      ]),
    ).toEqual([
      ['reference', 'VOLTO'],
      ['reference', 'SET'],
    ]);
  });

  it('con il primo e l’ultimo fotogramma il video parte da lì: i file vanno col loro ruolo, senza volti', async () => {
    withImages(
      { use: 'first_frame', from: 'generate', assetId: 'primo' },
      { use: 'last_frame', from: 'generate', assetId: 'ultimo' },
      { use: 'reference', from: 'generate', assetId: 'ispirazione' },
    );
    await build().start(film.id, 'shot-1', {});
    await runQueued();

    expect(cinematographerInputSchema.parse(written[0]?.input).target.inputs).toEqual([
      'references',
      'first_frame',
      'last_frame',
    ]);
    expect(
      submitted[0]?.request.inputs.map((input) => [
        input.use,
        new TextDecoder().decode(input.file.bytes),
      ]),
    ).toEqual([
      ['first_frame', 'PRIMO'],
      ['last_frame', 'ULTIMO'],
      ['reference', 'ESEMPIO'],
    ]);
    expect(submitted[0]?.request.characterIds).toEqual([]);
  });

  it('un take riuscito porta la clip, il costo vero e il servizio che ha lavorato', async () => {
    await build().start(film.id, 'shot-1', {});
    await runQueued();

    expect(only()).toMatchObject({
      status: 'succeeded',
      assetId: 'clip-1',
      costUsd: 1.17,
      modelId: 'video-a',
      modelLabel: 'Video A (quello che ha lavorato)',
    });
    expect(registered.map((asset) => asset.id)).toEqual(['clip-1']);
    expect(takes.latestClips(film.id)).toEqual({ 'shot-1': 'clip-1' });
  });

  it('se un fotogramma impostato non c’è più sul disco il take fallisce, senza spendere né per il testo né per il video', async () => {
    withImages({ use: 'first_frame', from: 'generate', assetId: 'primo' });
    await build().start(film.id, 'shot-1', {});
    await rm(path.join(dataDir, 'progetti', film.id, 'riferimenti', 'primo.png'));

    await runQueued();

    expect(only()).toMatchObject({ status: 'failed', errorCode: 'invalid_request' });
    expect(written).toEqual([]);
    expect(submitted).toEqual([]);
  });

  it('un’ispirazione che non c’è più si salta, e il video parte lo stesso', async () => {
    withImages({ use: 'reference', from: 'generate', assetId: 'ispirazione' });
    await build().start(film.id, 'shot-1', {});
    await rm(path.join(dataDir, 'progetti', film.id, 'riferimenti', 'ispirazione.png'));

    await runQueued();

    expect(only().status).toBe('succeeded');
  });

  it('se il servizio rifiuta, il take lo dice col codice e non si prova un altro servizio', async () => {
    mediaBehaviour = () => Promise.reject(new ProviderError('content_rejected', false, 'no'));
    await build().start(film.id, 'shot-1', {});
    await runQueued();

    expect(only()).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
    expect(only()).not.toHaveProperty('assetId');
    expect(submitted).toHaveLength(1);
    expect(registered).toEqual([]);
  });

  it('un servizio che non dà il video è un errore, non un take riuscito e vuoto', async () => {
    mediaBehaviour = () => Promise.resolve({ assetIds: [] });
    await build().start(film.id, 'shot-1', {});
    await runQueued();

    expect(only()).toMatchObject({ status: 'failed', errorCode: 'invalid_output' });
  });

  it('un errore imprevisto chiude il take come «unknown»: il lavoro non resta a metà', async () => {
    mediaBehaviour = () => Promise.reject(new Error('disco pieno'));
    await build().start(film.id, 'shot-1', {});
    await runQueued();

    expect(only()).toMatchObject({ status: 'failed', errorCode: 'unknown' });
  });

  it('un lavoro ripetuto su un take già chiuso non spende di nuovo e non cancella la clip', async () => {
    await build().start(film.id, 'shot-1', {});
    await runQueued();
    await runQueued();

    expect(written).toHaveLength(1);
    expect(submitted).toHaveLength(1);
    expect(only()).toMatchObject({ status: 'succeeded', assetId: 'clip-1' });
  });

  it('se il piano è stato rifatto mentre il lavoro aspettava, non c’è più niente da fare', async () => {
    await build().start(film.id, 'shot-1', {});
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

describe('un take rimasto a metà', () => {
  it('dopo troppo tempo si chiude come fallito, e se ne può chiedere un altro', async () => {
    const stuck = createTakeStore(openedDb, {
      now: () => new Date(Date.now() - STALE_WORK_MS - 60_000),
    }).start('shot-1', { modelId: 'video-a', modelLabel: 'Video A' });
    const service = build();

    const shown = service.list(film.id, 'shot-1').takes;

    expect(shown).toHaveLength(1);
    expect(shown[0]).toMatchObject({ id: stuck.id, status: 'failed', errorCode: 'timeout' });
    const started = await service.start(film.id, 'shot-1', {});
    expect(started.takes.map((take) => take.status)).toEqual(['queued', 'failed']);
  });

  it('un take recente che lavora ancora non si tocca, e blocca un secondo take', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', {});

    expect(service.list(film.id, 'shot-1').takes[0]?.status).toBe('queued');
    expect(await failure(() => service.start(film.id, 'shot-1', {}))).toEqual({
      status: 409,
      code: 'invalid_request',
    });
  });
});

describe('leggere i take', () => {
  it('si leggono dal più recente, e un’inquadratura di un altro film non si vede', async () => {
    const service = build();
    await service.start(film.id, 'shot-1', {});

    expect(service.list(film.id, 'shot-1').takes).toHaveLength(1);
    expect(() => service.list('altro', 'shot-1')).toThrow(HttpException);
    expect(() => service.list(film.id, 'non-c-e')).toThrow(HttpException);
  });
});
