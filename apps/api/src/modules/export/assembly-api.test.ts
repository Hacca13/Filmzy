import { execFile } from 'node:child_process';
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  assemblyViewSchema,
  audioOverviewSchema,
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  scenePlanSchema,
  shotPlansSchema,
  type AssemblyView,
} from '@filmzy/contracts';
import type { ReceiptStore, SheetStore } from '@filmzy/db';
import { ffmpegPath, hasAudioStream, videoDurationS } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal } from '../../test-support/film-with-shot.js';
import { realSound, realVideo, takeWithFile } from '../../test-support/real-clip.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/** Il montaggio col server vero, la coda e ffmpeg vero, su video veri fatti da ffmpeg. Nessuna spesa. */
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

const assemblyOf = (filmId: string) => `/projects/${filmId}/assembly`;

const viewOf = async (filmId: string): Promise<AssemblyView> =>
  assemblyViewSchema.parse((await client.call('GET', assemblyOf(filmId))).body);

/** Aspetta che l'ultimo montaggio sia chiuso. */
async function settled(filmId: string): Promise<AssemblyView> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    const view = await viewOf(filmId);
    const status = view.latest?.status;
    if (status === 'succeeded' || status === 'failed') return view;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il montaggio non è finito in tempo');
}

/** Un film con tutte le scene pensate e un video vero per ogni inquadratura. */
async function filmReady({ withSound = false }: { withSound?: boolean } = {}) {
  const { film, shots: shotsUrl } = await filmWithFinal(client);
  const first = shotPlansSchema.parse((await client.call('GET', shotsUrl)).body);
  const shotIds: string[] = [];
  const takeIds: string[] = [];
  for (const { sceneNumber } of first.scenes) {
    const plan = scenePlanSchema.parse((await client.call('POST', shotsUrl, { sceneNumber })).body);
    for (const shot of plan.shots) {
      const file = await realVideo(dataDir, { withSound });
      takeIds.push(await takeWithFile(app, dataDir, { filmId: film.id, shotId: shot.id, file }));
      shotIds.push(shot.id);
    }
  }
  return { film, shotIds, takeIds };
}

/** Il file del film montato, dal registro. */
function filmFile(view: AssemblyView): string {
  const assetId = view.latest?.assetId;
  if (assetId === undefined) throw new Error('doveva esserci il film');
  const record = app.get<SheetStore>(SHEET_STORE, { strict: false }).getAsset(assetId);
  if (record === undefined) throw new Error('il film doveva essere registrato');
  return path.join(dataDir, record.path);
}

async function loudness(file: string): Promise<number> {
  const { stderr } = await promisify(execFile)(
    ffmpegPath(),
    ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'],
    { windowsHide: true },
  );
  const found = /max_volume: (-?[\d.]+) dB/.exec(stderr);
  if (found === null) throw new Error('niente volume');
  return Number(found[1]);
}

describe('cosa manca per montare', () => {
  it('senza la stesura finale non c’è niente da montare', async () => {
    const options = projectOptionsSchema.parse(
      (await client.call('GET', '/projects/options')).body,
    );
    const film = projectSchema.parse(
      (
        await client.call('POST', '/projects', {
          idea: 'Una storia ancora da scrivere.',
          genre: options.defaults.genre,
          tone: options.defaults.tone,
          style: options.defaults.style,
          cinematography: options.defaults.cinematography,
          durationS: 60,
        })
      ).body,
    );

    expect((await client.call('GET', assemblyOf(film.id))).status).toBe(404);
    expect((await client.call('POST', assemblyOf(film.id))).status).toBe(404);
  });

  it('una scena non pensata lo dice, e non si monta', async () => {
    const { film } = await filmWithFinal(client);

    const view = await viewOf(film.id);

    expect(view.gaps[0]).toMatchObject({ sceneNumber: 1, kind: 'not_planned' });
    expect(view.upToDate).toBe(false);
    const reply = await client.call('POST', assemblyOf(film.id));
    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('assembly');
  });

  it('un’inquadratura senza video lo dice', async () => {
    const { film, shots } = await filmWithFinal(client);
    await client.call('POST', shots, { sceneNumber: 1 });

    const view = await viewOf(film.id);

    expect(view.gaps[0]).toMatchObject({ sceneNumber: 1, kind: 'no_take' });
    expect(view.gaps[0]?.missing).toBeGreaterThan(0);
  });

  it('i titoli si leggono prima, con la dicitura', async () => {
    const { film } = await filmWithFinal(client);

    const { titles } = await viewOf(film.id);

    expect(titles.title).toBe(film.title);
    expect(titles.aiNotice).toContain('intelligenza artificiale');
  });
});

describe('montare il film', () => {
  it('dà un film con i titoli, il suo silenzio, e non spende niente', async () => {
    const { film, shotIds } = await filmReady();
    const receipts = app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    const spent = () => receipts.list().filter((r) => r.projectId === film.id).length;
    const before = spent();

    const started = await client.call('POST', assemblyOf(film.id));
    expect(started.status).toBe(201);
    const view = await settled(film.id);

    expect(view.latest).toMatchObject({ status: 'succeeded' });
    expect(view.upToDate).toBe(true);
    expect(spent()).toBe(before);

    const file = filmFile(view);
    // Tre secondi di apertura, cinque di chiusura e un secondo per inquadratura.
    expect(await videoDurationS(file)).toBeCloseTo(8 + shotIds.length, 0);
    expect(await hasAudioStream(file)).toBe(true);
    expect(await loudness(file)).toBeLessThan(-60);

    const served = await fetch(`${base}/api/assets/${view.latest?.assetId ?? ''}`);
    expect(served.headers.get('content-type')).toContain('video/mp4');

    // I pezzi intermedi non restano: nella cartella c'è solo il film.
    const folder = path.join(dataDir, 'progetti', film.id, 'montaggio');
    expect(await readdir(folder)).toEqual([path.basename(file)]);

    const project = projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body);
    expect(project.phase).toBe('export');
  }, 180_000);

  it('una musica caricata si sente, e cambiarla rende il film indietro senza toccare i video', async () => {
    const { film } = await filmReady();
    const sound = await realSound(dataDir, 3);
    const uploaded = await fetch(
      `${base}/api/projects/${film.id}/audio/uploads?${new URLSearchParams({
        kind: 'music',
        sceneId: 'scene-1',
        description: 'La mia musica',
      }).toString()}`,
      { method: 'POST', headers: { 'content-type': 'audio/wav' }, body: sound },
    );
    expect(uploaded.status).toBe(201);

    await client.call('POST', assemblyOf(film.id));
    const view = await settled(film.id);
    expect(view.latest?.status).toBe('succeeded');
    expect(await loudness(filmFile(view))).toBeGreaterThan(-40);

    const { tracks } = audioOverviewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    const music = tracks.find(({ kind }) => kind === 'music');
    await client.call('PUT', `/projects/${film.id}/audio/tracks/${music?.id ?? ''}`, {
      muted: true,
    });
    expect((await viewOf(film.id)).upToDate).toBe(false);

    await client.call('POST', assemblyOf(film.id));
    const remade = await settled(film.id);
    expect(remade.upToDate).toBe(true);
    expect(await loudness(filmFile(remade))).toBeLessThan(-60);
  }, 240_000);

  it('l’audio originale acceso si sente, spento no', async () => {
    const { film, takeIds } = await filmReady({ withSound: true });

    await client.call('POST', assemblyOf(film.id));
    const silent = await settled(film.id);
    expect(await loudness(filmFile(silent))).toBeLessThan(-60);

    for (const takeId of takeIds) {
      await client.call('PUT', `/projects/${film.id}/audio/takes/${takeId}/native`, { on: true });
    }
    await client.call('POST', assemblyOf(film.id));
    const heard = await settled(film.id);
    expect(heard.latest?.status).toBe('succeeded');
    expect(await loudness(filmFile(heard))).toBeGreaterThan(-40);
  }, 240_000);

  it('mentre si monta non se ne apre un altro', async () => {
    const { film } = await filmReady();

    await client.call('POST', assemblyOf(film.id));
    const second = await client.call('POST', assemblyOf(film.id));

    expect(second.status).toBe(409);
    expect(domainErrorSchema.parse(second.body).details?.field).toBe('assemblyWorking');
    await settled(film.id);
  }, 180_000);

  it('se un video non c’è più lo dice, non lascia pezzi, e si può rifare', async () => {
    const { film, shotIds } = await filmReady();
    const record = app
      .get<SheetStore>(SHEET_STORE, { strict: false })
      .getAsset(
        shotPlansSchema
          .parse((await client.call('GET', `/projects/${film.id}/shots`)).body)
          .scenes.flatMap((scene) => Object.values(scene.clips))[0] ?? '',
      );
    if (record === undefined) throw new Error('doveva esserci un video');
    await rm(path.join(dataDir, record.path));
    expect(shotIds.length).toBeGreaterThan(0);

    await client.call('POST', assemblyOf(film.id));
    const view = await settled(film.id);

    expect(view.latest?.status).toBe('failed');
    expect(view.latest?.errorCode).toBeDefined();
    expect(view.upToDate).toBe(false);
    const folder = path.join(dataDir, 'progetti', film.id, 'montaggio');
    expect(await readdir(folder)).toEqual([]);
    // Non resta bloccato: un altro tentativo si può chiedere.
    expect((await client.call('POST', assemblyOf(film.id))).status).toBe(201);
    await settled(film.id);
  }, 180_000);
});
