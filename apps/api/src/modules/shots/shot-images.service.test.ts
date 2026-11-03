import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  shotPlannerInputSchema,
  shotSpecSchema,
  type Project,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';
import {
  createShotStore,
  createSheetStore,
  createTakeStore,
  createUploadStore,
  openFilmzyDatabase,
  type MoodboardStore,
  type SheetStore,
  type ShotStore,
  type TakeStore,
  type UploadStore,
} from '@filmzy/db';
import type { ConfigSource, Troupe } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { BibleService } from '../bible/bible.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import { hashScene } from './plan-shots.js';
import { ShotImagesService } from './shot-images.service.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer);
const bible: StoryBible = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner).bible;
const spec: ShotSpec = shotSpecSchema.parse({ ...example.shot, id: 'shot-1' });

const film = { id: 'film-1' } as Project;

interface VideoCheck {
  uses: string[];
  characterIds: string[];
  role: string;
}

let store: ShotStore;
let takes: TakeStore;
let uploads: UploadStore;
let files: SheetStore;
let dataDir: string;
let checks: VideoCheck[];
let accepted: number;

function build(options: { moodboardOn?: boolean; moodboardAssets?: string[] } = {}) {
  const troupe = {
    options: (role: string, request: { inputs: { use: string }[]; characterIds: string[] }) => {
      checks.push({
        role,
        uses: request.inputs.map((input) => input.use),
        characterIds: request.characterIds,
      });
      return Promise.resolve(Array.from({ length: accepted }, (_, index) => ({ index })));
    },
  } as unknown as Troupe;
  const projects = {
    get: (id: string) => {
      if (id !== film.id) throw new HttpException({ code: 'not_found', retryable: false }, 404);
      return film;
    },
  } as unknown as ProjectsService;
  const bibles = { assemble: () => Promise.resolve(bible) } as unknown as BibleService;
  const moodboards = {
    get: () => ({
      projectId: film.id,
      film: {
        palette: [],
        notes: '',
        references: (options.moodboardAssets ?? []).map((assetId) => ({
          assetId,
          origin: 'generated',
          analysisOnly: false,
          description: 'a reference',
          moodTags: [],
          palette: [],
        })),
      },
      scenes: [],
    }),
  } as unknown as MoodboardStore;
  return new ShotImagesService(
    store,
    takes,
    uploads,
    moodboards,
    {
      load: () =>
        Promise.resolve({ config: { features: { moodboard: options.moodboardOn ?? true } } }),
    } as unknown as ConfigSource,
    files,
    dataDir,
    troupe,
    projects,
    bibles,
  );
}

/** Un tentativo riuscito di uno storyboard con queste immagini: sono quelle tra cui scegliere. */
function withVariants(...assetIds: string[]) {
  store.startStoryboard('shot-1', 'storyboard');
  store.finishStoryboard('shot-1', 'storyboard', 1, { status: 'succeeded', assetIds });
}

async function refusal(call: () => Promise<unknown>): Promise<{ status: number; code: string }> {
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

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-immagini-'));
  const opened = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createShotStore(opened.db);
  takes = createTakeStore(opened.db);
  uploads = createUploadStore(opened.db);
  files = createSheetStore(opened.db);
  store.replaceScene({
    projectId: film.id,
    sceneNumber: 1,
    sceneHash: hashScene({
      number: 1,
      heading: 'SCENA 1',
      locationId: 'piazza',
      timeOfDay: 'sera',
      characterIds: ['anna'],
      summary: 'Anna arriva.',
      beats: [],
      durationS: 20,
    }),
    screenplayId: 'stesura-1',
    shots: [spec],
  });
  checks = [];
  accepted = 2;
  return () => {
    opened.close();
  };
});

describe('quali servizi video accettano le immagini', () => {
  it('senza immagini impostate il video riceve il volto e il set come riferimenti', async () => {
    const images = await build().get(film.id, 'shot-1');

    expect(images.videoServices).toBe(2);
    expect(checks).toEqual([
      { role: 'camera_operator', uses: ['reference', 'reference'], characterIds: ['anna'] },
    ]);
  });

  it('con il primo o l’ultimo fotogramma i personaggi sono già nell’immagine: nessun altro riferimento', async () => {
    withVariants('a', 'b');
    const service = build();

    await service.set(film.id, 'shot-1', {
      images: [
        { use: 'first_frame', assetId: 'a' },
        { use: 'last_frame', assetId: 'b' },
      ],
    });

    expect(checks.at(-1)).toEqual({
      role: 'camera_operator',
      uses: ['first_frame', 'last_frame'],
      characterIds: [],
    });
  });

  it('l’ispirazione si aggiunge al volto e al set', async () => {
    withVariants('a');

    await build().set(film.id, 'shot-1', { images: [{ use: 'reference', assetId: 'a' }] });

    expect(checks.at(-1)?.uses).toEqual(['reference', 'reference', 'reference']);
  });

  it('se nessun servizio accetta la combinazione lo dice con zero, e le immagini restano impostate', async () => {
    withVariants('a');
    accepted = 0;

    const images = await build().set(film.id, 'shot-1', {
      images: [{ use: 'first_frame', assetId: 'a' }],
    });

    expect(images.videoServices).toBe(0);
    expect(images.images).toEqual([{ use: 'first_frame', from: 'generate', assetId: 'a' }]);
    expect(store.get('shot-1')?.spec.images).toEqual(images.images);
  });
});

describe('impostare le immagini', () => {
  it('le immagini tra cui scegliere sono le varianti riuscite, e solo quelle', async () => {
    withVariants('a', 'b');
    store.startStoryboard('shot-1', 'storyboard');
    store.finishStoryboard('shot-1', 'storyboard', 2, { status: 'failed', errorCode: 'timeout' });
    store.startStoryboard('shot-1', 'end_frame');
    store.finishStoryboard('shot-1', 'end_frame', 1, { status: 'succeeded', assetIds: ['c'] });

    const { candidates } = await build().get(film.id, 'shot-1');

    expect(candidates).toEqual([
      { assetId: 'a', mode: 'storyboard', attempt: 1 },
      { assetId: 'b', mode: 'storyboard', attempt: 1 },
      { assetId: 'c', mode: 'end_frame', attempt: 1 },
    ]);
  });

  it('«Dal moodboard» offre le immagini del moodboard, e solo con la funzione accesa; una già presente vale con la prima origine', async () => {
    withVariants('a');

    const on = await build({ moodboardAssets: ['a', 'm'] }).get(film.id, 'shot-1');
    const off = await build({ moodboardAssets: ['a', 'm'], moodboardOn: false }).get(
      film.id,
      'shot-1',
    );

    expect(on.candidates).toEqual([
      { assetId: 'a', mode: 'storyboard', attempt: 1 },
      { assetId: 'a', mode: 'moodboard' },
      { assetId: 'm', mode: 'moodboard' },
    ]);
    expect(off.candidates).toEqual([{ assetId: 'a', mode: 'storyboard', attempt: 1 }]);

    // 'a' sta in due elenchi: scegliendola vale come immagine dello storyboard.
    const set = await build({ moodboardAssets: ['a', 'm'] }).set(film.id, 'shot-1', {
      images: [{ use: 'reference', assetId: 'a' }],
    });
    expect(set.images).toEqual([{ use: 'reference', from: 'generate', assetId: 'a' }]);
  });

  it('una scelta sbagliata non cambia niente di ciò che c’era', async () => {
    withVariants('a');
    const service = build();
    await service.set(film.id, 'shot-1', { images: [{ use: 'first_frame', assetId: 'a' }] });

    expect(
      await refusal(() =>
        service.set(film.id, 'shot-1', { images: [{ use: 'last_frame', assetId: 'x' }] }),
      ),
    ).toEqual({ status: 409, code: 'invalid_request' });
    expect(store.get('shot-1')?.spec.images).toEqual([
      { use: 'first_frame', from: 'generate', assetId: 'a' },
    ]);
  });

  it('un’inquadratura che non c’è o è di un altro film dà «non trovato»', async () => {
    const service = build();

    expect(await refusal(() => service.get(film.id, 'non-c-e'))).toEqual({
      status: 404,
      code: 'not_found',
    });
    expect(await refusal(() => service.set('altro', 'shot-1', { images: [] }))).toEqual({
      status: 404,
      code: 'not_found',
    });
  });
});
