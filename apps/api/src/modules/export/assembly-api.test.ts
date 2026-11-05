import { execFile } from 'node:child_process';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  assemblyViewSchema,
  audioClipSchema,
  audioOverviewSchema,
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  scenePlanSchema,
  shotPlansSchema,
  type AssemblyView,
} from '@filmzy/contracts';
import {
  createAssemblyStore,
  type AssemblyStore,
  type AudioStore,
  type ExportStore,
  type OpenedDatabase,
  type ReceiptStore,
  type SheetStore,
} from '@filmzy/db';
import { ffmpegPath, hasAudioStream, videoDurationS } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal } from '../../test-support/film-with-shot.js';
import {
  filmAlreadyMounted,
  realSound,
  realVideo,
  takeWithFile,
} from '../../test-support/real-clip.js';
import { AUDIO_STORE } from '../audio/tokens.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { STALE_WORK_MS } from '../shots/work.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';
import { ASSEMBLY_JOB_KIND } from './assembly.service.js';
import { ASSEMBLY_STORE, EXPORT_STORE } from './tokens.js';

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

/** Una musica caricata sulla prima scena. Dà l'id della clip. */
async function uploadMusic(filmId: string): Promise<string> {
  const reply = await fetch(
    `${base}/api/projects/${filmId}/audio/uploads?${new URLSearchParams({
      kind: 'music',
      sceneId: 'scene-1',
      description: 'La mia musica',
    }).toString()}`,
    {
      method: 'POST',
      headers: { 'content-type': 'audio/wav' },
      body: await realSound(dataDir, 3),
    },
  );
  expect(reply.status).toBe(201);
  return audioClipSchema.parse(await reply.json()).id;
}

/** Il file del film montato, dal registro. */
function filmFile(view: AssemblyView): string {
  const assetId = view.film?.assetId;
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

describe('i film montati prima', () => {
  /** Un film con la stesura e due montaggi: non serve rifarli davvero per provare l'elenco. */
  async function twoFilms() {
    const { film } = await filmWithFinal(client);
    const first = await filmAlreadyMounted(app, dataDir, { filmId: film.id, size: '320x180' });
    const second = await filmAlreadyMounted(app, dataDir, { filmId: film.id, size: '320x180' });
    const view = await viewOf(film.id);
    const earlier = view.earlier[0];
    if (earlier === undefined) throw new Error('doveva esserci il film di prima');
    return { film, first, second, earlier, view };
  }

  it('l’elenco ha quelli di prima, non l’ultimo', async () => {
    const { first, second, view } = await twoFilms();

    expect(view.film?.assetId).toBe(second.assetId);
    expect(view.earlier.map(({ assetId }) => assetId)).toEqual([first.assetId]);
  }, 60_000);

  it('si salva una copia, col nome del film e la data', async () => {
    const { film, earlier } = await twoFilms();

    const reply = await fetch(`${base}/api${assemblyOf(film.id)}/${earlier.id}/file`);

    expect(reply.status).toBe(200);
    expect(reply.headers.get('content-disposition')).toContain('attachment');
    expect(reply.headers.get('content-disposition')).toContain('montato');
    await reply.body?.cancel();
  }, 60_000);

  it('toglierlo cancella il file, e non si offre più', async () => {
    const { film, first, earlier } = await twoFilms();

    const reply = await client.call('DELETE', `${assemblyOf(film.id)}/${earlier.id}`);

    expect(reply.status).toBe(204);
    expect((await viewOf(film.id)).earlier).toEqual([]);
    await expect(stat(first.file)).rejects.toMatchObject({ code: 'ENOENT' });
    expect((await client.call('DELETE', `${assemblyOf(film.id)}/${earlier.id}`)).status).toBe(404);
  }, 60_000);

  it('l’ultimo film non si toglie', async () => {
    const { film, second, view } = await twoFilms();

    const reply = await client.call('DELETE', `${assemblyOf(film.id)}/${view.film?.id ?? ''}`);

    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('currentFilm');
    expect((await stat(second.file)).size).toBeGreaterThan(0);
  }, 60_000);

  it('rifatto identico si elenca una volta, e se è anche l’ultimo non si elenca né si toglie', async () => {
    const { film, first, second } = await twoFilms();
    const assemblies = app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false });
    const again = assemblies.start(film.id, 'prova');
    assemblies.finish(again.id, { status: 'succeeded', assetId: first.assetId, durationS: 1 });

    const view = await viewOf(film.id);

    // L'ultimo è di nuovo il primo file: nell'elenco resta solo il secondo.
    expect(view.film?.assetId).toBe(first.assetId);
    expect(view.earlier.map(({ assetId }) => assetId)).toEqual([second.assetId]);

    const twin = assemblies.succeeded(film.id).at(-1);
    expect(twin?.assembly.assetId).toBe(first.assetId);
    const reply = await client.call('DELETE', `${assemblyOf(film.id)}/${twin?.assembly.id ?? ''}`);
    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('currentFilm');
    expect((await stat(first.file)).size).toBeGreaterThan(0);
  }, 60_000);

  it('mentre si monta non si toglie: rifare un film identico riusa lo stesso file', async () => {
    const { film, first, earlier } = await twoFilms();
    const assemblies = app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false });
    const mounting = assemblies.start(film.id, 'in corso');

    const reply = await client.call('DELETE', `${assemblyOf(film.id)}/${earlier.id}`);

    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('assemblyWorking');
    expect((await stat(first.file)).size).toBeGreaterThan(0);
    assemblies.finish(mounting.id, { status: 'failed', errorCode: 'unknown' });
  }, 60_000);

  it('un film tolto a mano dalla cartella sparisce dall’elenco', async () => {
    const { film, first } = await twoFilms();

    await rm(first.file);

    expect((await viewOf(film.id)).earlier).toEqual([]);
  }, 60_000);

  it('il film di un altro progetto, o uno che non c’è, è «non trovato»', async () => {
    const { earlier } = await twoFilms();
    const { film: other } = await filmWithFinal(client);

    expect((await client.call('DELETE', `${assemblyOf(other.id)}/${earlier.id}`)).status).toBe(404);
    expect((await client.call('GET', `${assemblyOf(other.id)}/${earlier.id}/file`)).status).toBe(
      404,
    );
    expect((await client.call('DELETE', `${assemblyOf(other.id)}/nessuno`)).status).toBe(404);
  }, 60_000);

  it('se il sistema non lo lascia togliere lo dice col suo codice', async () => {
    const { film, first, earlier } = await twoFilms();
    // Al posto del file una cartella: non si toglie, in ogni sistema, come un file tenuto aperto su Windows.
    await rm(first.file);
    await mkdir(first.file);

    const reply = await client.call('DELETE', `${assemblyOf(film.id)}/${earlier.id}`);

    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body)).toMatchObject({
      code: 'media_failed',
      retryable: true,
      details: { field: 'earlierFilm' },
    });
    expect((await viewOf(film.id)).earlier).toHaveLength(1);
  }, 60_000);
});

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

describe('quando qualcosa va storto', () => {
  it('un montaggio che fallisce non nasconde il film buono di prima', async () => {
    const { film } = await filmReady();
    await client.call('POST', assemblyOf(film.id));
    const good = await settled(film.id);
    expect(good.film?.assetId).toBeDefined();

    const plans = shotPlansSchema.parse(
      (await client.call('GET', `/projects/${film.id}/shots`)).body,
    );
    const clipId = plans.scenes.flatMap((scene) => Object.values(scene.clips))[0] ?? '';
    const record = app.get<SheetStore>(SHEET_STORE, { strict: false }).getAsset(clipId);
    if (record === undefined) throw new Error('doveva esserci un video');
    await rm(path.join(dataDir, record.path));

    await client.call('POST', assemblyOf(film.id));
    const view = await settled(film.id);

    expect(view.latest?.status).toBe('failed');
    expect(view.film?.assetId).toBe(good.film?.assetId);
    expect(view.upToDate).toBe(true);
  }, 180_000);

  it('rifare lo stesso film dà lo stesso file, senza errori anche se è aperto', async () => {
    const { film } = await filmReady();
    await client.call('POST', assemblyOf(film.id));
    const first = await settled(film.id);
    const served = await fetch(`${base}/api/assets/${first.film?.assetId ?? ''}`);
    // Un lettore che tiene il file aperto: il corpo non è stato ancora letto.
    expect(served.ok).toBe(true);

    await client.call('POST', assemblyOf(film.id));
    const second = await settled(film.id);

    expect(second.latest?.status).toBe('succeeded');
    await served.body?.cancel();
  }, 180_000);

  it('un suono che non si sente non ferma il film, anche se il suo file non c’è più', async () => {
    const { film } = await filmReady();
    const clipId = await uploadMusic(film.id);
    const audio = app.get<AudioStore>(AUDIO_STORE, { strict: false });
    const assetId = audio.getClip(clipId)?.clip.variants[0]?.assetId ?? '';
    const record = app.get<SheetStore>(SHEET_STORE, { strict: false }).getAsset(assetId);
    if (record === undefined) throw new Error('doveva esserci il file');
    await rm(path.join(dataDir, record.path));

    await client.call('POST', assemblyOf(film.id));
    const heard = await settled(film.id);
    expect(heard.latest?.errorCode).toBe('not_found');

    const { tracks } = audioOverviewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    const music = tracks.find(({ kind }) => kind === 'music');
    await client.call('PUT', `/projects/${film.id}/audio/tracks/${music?.id ?? ''}`, {
      muted: true,
    });
    await client.call('POST', assemblyOf(film.id));
    expect((await settled(film.id)).latest?.status).toBe('succeeded');
  }, 180_000);

  it('l’audio originale con la traccia a zero non si sente', async () => {
    const { film, takeIds } = await filmReady({ withSound: true });
    for (const takeId of takeIds) {
      await client.call('PUT', `/projects/${film.id}/audio/takes/${takeId}/native`, { on: true });
    }
    const { tracks } = audioOverviewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    const native = tracks.find(({ kind }) => kind === 'native');
    await client.call('PUT', `/projects/${film.id}/audio/tracks/${native?.id ?? ''}`, {
      volume: 0,
    });

    await client.call('POST', assemblyOf(film.id));
    const view = await settled(film.id);

    expect(view.latest?.status).toBe('succeeded');
    expect(await loudness(filmFile(view))).toBeLessThan(-60);
  }, 180_000);

  it('se la coda non accetta il lavoro il tentativo non resta aperto', async () => {
    const { film } = await filmReady();
    const runner = app.get(JobRunner, { strict: false });
    const enqueue = vi.spyOn(runner, 'enqueue').mockImplementationOnce(() => {
      throw new Error('coda rotta');
    });

    const reply = await client.call('POST', assemblyOf(film.id));
    enqueue.mockRestore();

    expect(reply.status).toBeGreaterThanOrEqual(500);
    expect((await viewOf(film.id)).latest).toMatchObject({
      status: 'failed',
      errorCode: 'unknown',
    });
    expect((await client.call('POST', assemblyOf(film.id))).status).toBe(201);
    await settled(film.id);
  }, 180_000);

  it('se mentre aspettava è cambiato qualcosa, si ferma con il motivo', async () => {
    const { film } = await filmWithFinal(client);
    const assemblies = app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false });
    const assembly = assemblies.start(film.id, 'x');

    app.get(JobRunner, { strict: false }).enqueue({
      kind: ASSEMBLY_JOB_KIND,
      payload: { projectId: film.id, assemblyId: assembly.id },
      projectId: film.id,
      idempotencyKey: `prova:${assembly.id}`,
    });

    expect((await settled(film.id)).latest).toMatchObject({
      status: 'failed',
      errorCode: 'invalid_request',
    });
  }, 60_000);

  it('un tentativo fermo da troppo tempo si chiude, e quello ripreso conta dall’ultimo segno di vita', async () => {
    const { film } = await filmWithFinal(client);
    const opened = app.get<OpenedDatabase>(OPENED_DATABASE, { strict: false });
    const old = createAssemblyStore(opened.db, {
      now: () => new Date(Date.now() - STALE_WORK_MS - 60_000),
    });
    const stuck = old.start(film.id, 'x');

    const view = await viewOf(film.id);

    expect(view.latest).toMatchObject({ id: stuck.id, status: 'failed', errorCode: 'timeout' });

    const alive = old.start(film.id, 'y');
    app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false }).finish(alive.id, {
      status: 'running',
    });
    expect((await viewOf(film.id)).latest).toMatchObject({ id: alive.id, status: 'running' });
    app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false }).finish(alive.id, {
      status: 'failed',
      errorCode: 'unknown',
    });
  }, 60_000);
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

    // I pezzi intermedi non restano: a lavoro finito nella cartella c'è solo il film.
    await app.get(JobRunner, { strict: false }).drain();
    const folder = path.join(dataDir, 'progetti', film.id, 'montaggio');
    expect(await readdir(folder)).toEqual([path.basename(file)]);

    const project = projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body);
    expect(project.phase).toBe('export');
  }, 180_000);

  it('una musica caricata si sente, e cambiarla rende il film indietro senza toccare i video', async () => {
    const { film } = await filmReady();
    await uploadMusic(film.id);

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

  it('un nuovo film non toglie quello di prima: lo toglie l’utente, se vuole', async () => {
    const { film } = await filmReady();
    await client.call('POST', assemblyOf(film.id));
    const first = await settled(film.id);
    expect(first.earlier).toEqual([]);
    await uploadMusic(film.id);

    await client.call('POST', assemblyOf(film.id));
    const second = await settled(film.id);

    expect(second.film?.assetId).not.toBe(first.film?.assetId);
    expect(second.earlier.map(({ id }) => id)).toEqual([first.film?.id]);
    await app.get(JobRunner, { strict: false }).drain();
    const folder = path.join(dataDir, 'progetti', film.id, 'montaggio');
    expect((await readdir(folder)).sort()).toEqual(
      [path.basename(filmFile(first)), path.basename(filmFile(second))].sort(),
    );
  }, 240_000);

  it('mentre si esporta non si monta: un film alla volta', async () => {
    const { film } = await filmReady();
    const exportsStore = app.get<ExportStore>(EXPORT_STORE, { strict: false });
    const open = exportsStore.start(film.id, {
      sourceAssetId: 'film',
      shortSide: 720,
      container: 'mp4',
    });

    const reply = await client.call('POST', assemblyOf(film.id));

    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('exportWorking');
    expect((await viewOf(film.id)).exportWorking).toBe(true);
    exportsStore.finish(open.id, { status: 'failed', errorCode: 'unknown' });
    expect((await viewOf(film.id)).exportWorking).toBe(false);
  }, 60_000);

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
    expect(view.latest?.errorCode).toBe('not_found');
    expect(view.upToDate).toBe(false);
    await app.get(JobRunner, { strict: false }).drain();
    const folder = path.join(dataDir, 'progetti', film.id, 'montaggio');
    expect(await readdir(folder)).toEqual([]);
    // Non resta bloccato: un altro tentativo si può chiedere.
    expect((await client.call('POST', assemblyOf(film.id))).status).toBe(201);
    await settled(film.id);
  }, 180_000);
});
