import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  JOB_INTERRUPTED,
  assemblyViewSchema,
  audioClipSchema,
  audioOverviewSchema,
  castSuggestionsSchema,
  characterSchema,
  characterSheetSchema,
  locationImagesSchema,
  moodboardViewSchema,
  scenePlanSchema,
  shotPlansSchema,
  shotStoryboardSchema,
  shotTakesSchema,
} from '@filmzy/contracts';
import type { JobQueue, ReceiptStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { realVideo, takeWithFile } from '../../test-support/real-clip.js';
import { JOB_QUEUE } from '../database/database.module.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';
import { JobRunner } from './job-runner.service.js';

/**
 * «Vale per tutto» (D84): col server vero, ogni tipo di lavoro viene chiesto a coda ferma, poi si fa come
 * al riavvio. Nessuno deve partire e nessuno deve spendere: ognuno si chiude col suo motivo. Se si aggiunge
 * un tipo di lavoro, va aggiunto qui.
 */
let app: NestExpressApplication;
let client: Client;
let base: string;
let dataDir: string;

beforeAll(async () => {
  ({ app, client, dataDir } = await startApp());
  base = await app.getUrl();
}, 60_000);

afterAll(async () => {
  await app.close();
});

const closedLike = { status: 'failed', errorCode: JOB_INTERRUPTED };

async function untilSetIsReady(route: string): Promise<string> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const { attempts } = locationImagesSchema.parse((await client.call('GET', route)).body);
    const assetId = attempts[0]?.assetIds[0];
    if (assetId !== undefined) return assetId;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il set non è arrivato in tempo');
}

/** Una maschera dipinta, per chiedere un ritocco. */
async function paintedMask(): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-maschera-'));
  const file = path.join(dir, 'maschera.png');
  await promisify(execFile)(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'color=c=white:s=64x64',
      '-frames:v',
      '1',
      file,
    ],
    { windowsHide: true },
  );
  return readFile(file);
}

describe('dopo un riavvio', () => {
  it('nessun lavoro riparte da solo: tutti si chiudono col motivo e non si spende niente', async () => {
    const { film, shot, shots, location, places } = await filmWithShot(client);
    const filmUrl = `/projects/${film.id}`;

    // Un altro film per il ritocco: serve un set già pronto, e un luogo fa un tentativo alla volta.
    const other = await filmWithShot(client);
    const otherImages = `${other.places}/${other.location.id}/images`;
    await client.call('POST', otherImages, {});
    const setAsset = await untilSetIsReady(otherImages);
    const mask = await paintedMask();

    // Un film con i video già pronti per il montaggio: fatti da ffmpeg, senza nessun servizio.
    const mounted = await filmWithFinal(client);
    const { scenes } = shotPlansSchema.parse((await client.call('GET', mounted.shots)).body);
    for (const { sceneNumber } of scenes) {
      const plan = scenePlanSchema.parse(
        (await client.call('POST', mounted.shots, { sceneNumber })).body,
      );
      for (const planned of plan.shots) {
        await takeWithFile(app, dataDir, {
          filmId: mounted.film.id,
          shotId: planned.id,
          file: await realVideo(dataDir),
        });
      }
    }

    const suggestion = castSuggestionsSchema.parse(
      (await client.call('POST', `${filmUrl}/cast/suggestions`, { count: 1 })).body,
    ).suggestions[0];
    const character = characterSchema.parse(
      (await client.call('POST', `${filmUrl}/cast/characters`, { suggestion })).body,
    );
    const clip = audioClipSchema.parse(
      (
        await client.call('POST', `${filmUrl}/audio/clips`, {
          kind: 'music',
          sceneId: 'scene-1',
          durationS: 5,
          description: 'Un piano.',
        })
      ).body,
    );

    // La coda si ferma, come un programma che si chiude: da qui in poi i lavori restano da fare.
    const runner = app.get(JobRunner, { strict: false });
    await runner.onApplicationShutdown();

    const sheetUrl = `${filmUrl}/cast/characters/${character.id}/sheet`;
    const imagesUrl = `${places}/${location.id}/images`;
    const storyboardUrl = `${shots}/${shot.id}/storyboard`;
    const takesUrl = `${shots}/${shot.id}/takes`;
    const requests = await Promise.all([
      client.call('POST', takesUrl, {}),
      client.call('POST', storyboardUrl, {}),
      client.call('POST', imagesUrl, {}),
      client.call('POST', sheetUrl, {}),
      client.call('POST', `${filmUrl}/moodboard/generate`, {}),
      client.call('POST', `${filmUrl}/audio/clips/${clip.id}/variants`, {}),
      client.call('POST', `/projects/${mounted.film.id}/assembly`),
      fetch(
        `${base}/api${other.places}/${other.location.id}/retouch?assetId=${setAsset}&operation=remove`,
        { method: 'POST', headers: { 'content-type': 'image/png' }, body: mask },
      ),
    ]);
    for (const request of requests) expect(request.status).toBeLessThan(300);

    const queue = app.get<JobQueue>(JOB_QUEUE, { strict: false });
    const kinds = new Set(queue.list({ status: 'queued' }).map((job) => job.kind));
    expect([...kinds].sort()).toEqual([
      'audio_generate',
      'character_sheet',
      'film_assemble',
      'location_images',
      'location_retouch',
      'moodboard_images',
      'storyboard_images',
      'take_generate',
    ]);

    const receipts = app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    const spentBefore = receipts.list().length;

    // Il riavvio.
    runner.onApplicationBootstrap();
    await runner.drain();

    expect(receipts.list()).toHaveLength(spentBefore);
    expect(queue.list({ status: 'queued' })).toEqual([]);
    expect(queue.list({ status: 'running' })).toEqual([]);

    const read = async (url: string) => (await client.call('GET', url)).body;
    expect(shotTakesSchema.parse(await read(takesUrl)).takes[0]).toMatchObject(closedLike);
    expect(shotStoryboardSchema.parse(await read(storyboardUrl)).attempts[0]).toMatchObject(
      closedLike,
    );
    expect(locationImagesSchema.parse(await read(imagesUrl)).attempts[0]).toMatchObject(closedLike);
    expect(locationImagesSchema.parse(await read(otherImages)).attempts[0]).toMatchObject(
      closedLike,
    );
    for (const image of characterSheetSchema.parse(await read(sheetUrl)).attempts[0]?.images ??
      []) {
      expect(image).toMatchObject(closedLike);
    }
    expect(moodboardViewSchema.parse(await read(`${filmUrl}/moodboard`)).run).toMatchObject(
      closedLike,
    );
    const { clips } = audioOverviewSchema.parse(await read(`${filmUrl}/audio`));
    expect(clips[0]?.variants[0]).toMatchObject(closedLike);
    expect(
      assemblyViewSchema.parse(await read(`/projects/${mounted.film.id}/assembly`)).latest,
    ).toMatchObject(closedLike);

    // Decide l'utente: un altro lo può chiedere, e questo sì che parte.
    const again = await client.call('POST', takesUrl, {});
    expect(again.status).toBe(201);
    await runner.drain();
  }, 180_000);
});
