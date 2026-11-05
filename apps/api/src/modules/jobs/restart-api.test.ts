import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
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
import { afterEach, describe, expect, it } from 'vitest';

import { createApp, listenAndStart } from '../../create-app.js';
import { CONFIG_DIR, startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { realVideo, takeWithFile } from '../../test-support/real-clip.js';
import { JOB_QUEUE } from '../database/database.module.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';
import { JobRunner } from './job-runner.service.js';

/**
 * «Vale per tutto» (D84): col server vero, ogni tipo di lavoro viene chiesto a coda ferma, poi il programma
 * si chiude e si riapre sulla stessa cartella dei dati. Nessuno deve partire e nessuno deve spendere: ognuno
 * si chiude col suo motivo. Il test fallisce da solo se si aggiunge un tipo di lavoro senza provarlo qui.
 */

const closedLike = { status: 'failed', errorCode: JOB_INTERRUPTED };

type Running = Awaited<ReturnType<typeof startApp>>;
const opened: Running[] = [];

afterEach(async () => {
  await Promise.all(opened.splice(0).map(({ app }) => app.close()));
});

async function start(existingDataDir?: string): Promise<Running> {
  const running = await startApp(undefined, 'offline', CONFIG_DIR, existingDataDir);
  opened.push(running);
  return running;
}

/** Chiude il programma: la coda si ferma e la porta si libera. */
async function close(running: Running): Promise<void> {
  opened.splice(opened.indexOf(running), 1);
  await running.app.close();
}

async function untilSetIsReady(client: Client, route: string): Promise<string> {
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
    const first = await start();
    const { app, client, dataDir } = first;
    const base = await app.getUrl();
    const { film, shot, shots, location, places } = await filmWithShot(client);
    const filmUrl = `/projects/${film.id}`;

    // Un altro film per il ritocco: serve un set già pronto, e un luogo fa un tentativo alla volta.
    const other = await filmWithShot(client);
    const otherImages = `${other.places}/${other.location.id}/images`;
    await client.call('POST', otherImages, {});
    const setAsset = await untilSetIsReady(client, otherImages);
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

    // La coda si ferma: da qui in poi i lavori restano da fare, come se il programma si chiudesse adesso.
    const runner = app.get(JobRunner, { strict: false });
    const kinds = runner.registeredKinds();
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

    // Ogni tipo di lavoro che esiste è in coda: uno nuovo fa fallire questo test finché non si prova qui.
    const queued = app.get<JobQueue>(JOB_QUEUE, { strict: false }).list({ status: 'queued' });
    expect([...new Set(queued.map((job) => job.kind))].sort()).toEqual([...kinds].sort());
    const spentBefore = app.get<ReceiptStore>(RECEIPT_STORE, { strict: false }).list().length;

    await close(first);

    // Il riavvio: un programma nuovo sulla stessa cartella dei dati.
    const second = await start(dataDir);
    const secondRunner = second.app.get(JobRunner, { strict: false });
    await secondRunner.drain();

    const queue = second.app.get<JobQueue>(JOB_QUEUE, { strict: false });
    const receipts = second.app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    expect(queue.unfinished()).toEqual([]);
    expect(receipts.list()).toHaveLength(spentBefore);

    const read = async (url: string) => (await second.client.call('GET', url)).body;
    expect(shotTakesSchema.parse(await read(takesUrl)).takes[0]).toMatchObject(closedLike);
    expect(shotStoryboardSchema.parse(await read(storyboardUrl)).attempts[0]).toMatchObject(
      closedLike,
    );
    expect(locationImagesSchema.parse(await read(imagesUrl)).attempts[0]).toMatchObject(closedLike);
    expect(locationImagesSchema.parse(await read(otherImages)).attempts[0]).toMatchObject(
      closedLike,
    );
    const sheetImages = characterSheetSchema.parse(await read(sheetUrl)).attempts[0]?.images ?? [];
    expect(sheetImages.length).toBeGreaterThan(0);
    for (const image of sheetImages) expect(image).toMatchObject(closedLike);
    expect(moodboardViewSchema.parse(await read(`${filmUrl}/moodboard`)).run).toMatchObject(
      closedLike,
    );
    const { clips } = audioOverviewSchema.parse(await read(`${filmUrl}/audio`));
    expect(clips[0]?.variants[0]).toMatchObject(closedLike);
    expect(
      assemblyViewSchema.parse(await read(`/projects/${mounted.film.id}/assembly`)).latest,
    ).toMatchObject(closedLike);

    // I file provvisori del ritocco non restano: il lavoro che doveva toglierli non ripartirà.
    const retouchDir = path.join(dataDir, 'progetti', other.film.id, 'ritocco');
    expect(await readdir(retouchDir)).toEqual([]);

    // Decide l'utente: un altro lo può chiedere, e questo sì che parte.
    expect((await second.client.call('POST', takesUrl, {})).status).toBe(201);
    await secondRunner.drain();
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const { takes } = shotTakesSchema.parse(await read(takesUrl));
      if (takes[0]?.status === 'succeeded') return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('il take chiesto dall’utente doveva partire');
  }, 180_000);

  it('uno scontrino rimasto aperto si chiude: non resta contato alla stima per sempre', async () => {
    const first = await start();
    const { dataDir } = first;
    // Uno scontrino vero fa da forma: quello di prova è una chiamata partita e mai finita.
    await filmWithFinal(first.client);
    const receipts = first.app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    const [example] = receipts.list();
    if (example === undefined) throw new Error('doveva esserci uno scontrino');
    const open = { ...example };
    delete open.actualCostUsd;
    await receipts.write({
      ...open,
      id: 'mai-partito',
      status: 'queued',
      estimatedCostUsd: 3,
      projectId: 'film-1',
    });
    expect(receipts.spentOnProject('film-1')).toBe(3);

    await close(first);
    const second = await start(dataDir);

    const reopened = second.app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    expect(reopened.get('mai-partito')).toMatchObject({
      status: 'failed',
      errorCode: JOB_INTERRUPTED,
    });
    expect(reopened.spentOnProject('film-1')).toBe(0);
  }, 60_000);

  it('un secondo Filmzy lanciato per sbaglio non tocca i lavori del primo', async () => {
    const first = await start();
    const { app, client, dataDir } = first;
    const { shot, shots } = await filmWithShot(client);
    await app.get(JobRunner, { strict: false }).onApplicationShutdown();
    expect((await client.call('POST', `${shots}/${shot.id}/takes`, {})).status).toBe(201);
    const queue = app.get<JobQueue>(JOB_QUEUE, { strict: false });
    const waiting = queue.unfinished().length;
    expect(waiting).toBeGreaterThan(0);

    const port = Number(new URL(await app.getUrl()).port);
    const twin = await createApp({ logger: false, dataDir, environment: 'offline' });

    await expect(listenAndStart(twin, port, '127.0.0.1')).rejects.toThrow();
    await twin.close().catch(() => {
      // La porta non si è aperta: non c'è niente da chiudere bene, e il test guarda altro.
    });

    expect(queue.unfinished()).toHaveLength(waiting);
  }, 60_000);
});
