import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { domainErrorSchema, moodboardViewSchema, type MoodboardView } from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Le immagini caricate nel moodboard (T4.10, D37, D38), col server vero e un analista finto: una
 * immagine con persone entra solo per l'analisi, una con un marchio si rifiuta, i colori li calcola il
 * codice e, se il controllo non risponde, l'immagine non passa.
 */
const run = promisify(execFile);

interface Running {
  app: NestExpressApplication;
  client: Client;
  base: string;
  receipts: ReceiptStore;
}

const verdict = (containsPeople: boolean, flags: string[]) => ({
  data: {
    description: 'a crowded station platform at dusk',
    moodTags: ['busy', 'warm'],
    lighting: 'low golden light',
    composition: 'wide, deep perspective',
    containsPeople,
    flags,
  },
});

let normal: Running;
let withPeople: Running;
let withBrand: Running;
let failing: Running;
let redImage: Buffer;

async function running(
  started: Promise<{ app: NestExpressApplication; client: Client }>,
): Promise<Running> {
  const { app, client } = await started;
  return {
    app,
    client,
    base: await app.getUrl(),
    receipts: app.get<ReceiptStore>(RECEIPT_STORE),
  };
}

beforeAll(async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-moodboard-'));
  const file = path.join(dir, 'rossa.png');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'color=c=red:s=64x64',
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    { windowsHide: true },
  );
  redImage = await readFile(file);

  normal = await running(startApp());
  withPeople = await running(startAppWithFixtures({ image_analyst: verdict(true, []) }));
  withBrand = await running(
    startAppWithFixtures({ image_analyst: verdict(false, ['brand', 'minor']) }),
  );
  failing = await running(
    startAppWithFixtures({
      image_analyst: { error: { code: 'provider_unavailable', retryable: true, message: 'fermo' } },
    }),
  );
}, 120_000);

afterAll(async () => {
  await Promise.all([
    normal.app.close(),
    withPeople.app.close(),
    withBrand.app.close(),
    failing.app.close(),
  ]);
});

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

async function post(server: Running, route: string, body: Buffer | string | undefined) {
  const response = await fetch(`${server.base}/api${route}`, {
    method: 'POST',
    headers: { 'content-type': 'image/png' },
    ...(body === undefined ? {} : { body }),
  });
  const text = await response.text();
  return { status: response.status, body: text === '' ? undefined : (JSON.parse(text) as unknown) };
}

const view = async (server: Running, film: string): Promise<MoodboardView> =>
  moodboardViewSchema.parse((await server.client.call('GET', `/projects/${film}/moodboard`)).body);

/** Un'immagine diversa a ogni chiamata: stessi byte = stessa immagine. */
const unique = (label: string) => Buffer.concat([redImage, Buffer.from(label)]);

describe('caricare un’immagine nel moodboard', () => {
  it('passa dal controllo, si salva con la lettura dell’analista e i colori calcolati dal codice', async () => {
    const { film } = await filmWithShot(normal.client);
    const before = normal.receipts.list().length;

    const reply = await post(normal, `/projects/${film.id}/moodboard/references`, redImage);

    expect(reply.status).toBe(201);
    const saved = moodboardViewSchema.parse(reply.body).moodboard.film.references;
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ origin: 'uploaded', analysisOnly: false });
    expect(saved[0]?.description.length).toBeGreaterThan(10);
    // I colori vengono dall'immagine vera (rossa), non da un servizio.
    expect(saved[0]?.palette[0]?.hex).toMatch(/^#f[a-f0-9]0000$/);
    expect(saved[0]?.palette[0]?.use).toBe('dominante');
    expect(normal.receipts.list().length).toBe(before + 1);
    const file = await fetch(`${normal.base}/api/assets/${saved[0]?.assetId ?? ''}`);
    expect(file.status).toBe(200);
  }, 90_000);

  it('con persone entra solo per l’analisi: descrizione e colori sì, ma segnata così (D38)', async () => {
    const { film } = await filmWithShot(withPeople.client);

    const reply = await post(
      withPeople,
      `/projects/${film.id}/moodboard/references`,
      unique('folla'),
    );

    expect(reply.status).toBe(201);
    const [saved] = moodboardViewSchema.parse(reply.body).moodboard.film.references;
    expect(saved).toMatchObject({ origin: 'uploaded', analysisOnly: true });
    expect(saved?.description).toContain('crowded station platform');
    expect(saved?.description).toContain('Light: low golden light');
    expect(saved?.moodTags).toEqual(['busy', 'warm']);
  }, 90_000);

  it('con un marchio o un minore si rifiuta, dice perché e non resta sul disco', async () => {
    const { film } = await filmWithShot(withBrand.client);
    const image = unique('marchio');

    const reply = failure(
      await post(withBrand, `/projects/${film.id}/moodboard/references`, image),
    );

    expect(reply).toMatchObject({ status: 422, code: 'image_rejected' });
    expect(reply.details?.imageProblems).toEqual(['brand', 'minor']);
    expect((await view(withBrand, film.id)).moodboard.film.references).toEqual([]);
  }, 90_000);

  it('se il controllo non risponde l’immagine non passa, senza altri servizi', async () => {
    const { film } = await filmWithShot(failing.client);

    const reply = failure(
      await post(failing, `/projects/${film.id}/moodboard/references`, unique('fermo')),
    );

    expect(reply).toMatchObject({ status: 502, code: 'provider_unavailable' });
    expect((await view(failing, film.id)).moodboard.film.references).toEqual([]);
  }, 90_000);

  it('per una scena si salva nella sua parte; una scena che non c’è si rifiuta', async () => {
    const { film } = await filmWithShot(normal.client);
    const route = `/projects/${film.id}/moodboard/references`;

    const ok = await post(normal, `${route}?sceneId=scene-1`, unique('scena'));
    const none = failure(await post(normal, `${route}?sceneId=scene-99`, unique('nessuna')));

    expect(ok.status).toBe(201);
    const board = moodboardViewSchema.parse(ok.body).moodboard;
    expect(board.film.references).toEqual([]);
    expect(board.scenes[0]).toMatchObject({ sceneId: 'scene-1' });
    expect(board.scenes[0]?.references).toHaveLength(1);
    expect(none).toMatchObject({ status: 400, code: 'invalid_request' });
    expect(none.details?.field).toBe('sceneId');
  }, 90_000);

  it('la stessa immagine nella stessa parte non si ripete e non si paga di nuovo', async () => {
    const { film } = await filmWithShot(normal.client);
    const route = `/projects/${film.id}/moodboard/references`;
    const image = unique('doppia');
    await post(normal, route, image);
    const before = normal.receipts.list().length;

    const again = await post(normal, route, image);

    expect(again.status).toBe(201);
    expect(moodboardViewSchema.parse(again.body).moodboard.film.references).toHaveLength(1);
    expect(normal.receipts.list().length).toBe(before);
  }, 90_000);

  it('con la prudenza spenta si salva senza lettura e senza spendere', async () => {
    const { client } = normal;
    const { film } = await filmWithShot(client);
    const preferences = (await client.call('GET', '/preferences')).body as Record<string, unknown>;
    await client.call('PUT', '/preferences', { ...preferences, imageCheck: false });
    const before = normal.receipts.list().length;

    try {
      const reply = await post(
        normal,
        `/projects/${film.id}/moodboard/references`,
        unique('libera'),
      );

      expect(reply.status).toBe(201);
      const [saved] = moodboardViewSchema.parse(reply.body).moodboard.film.references;
      expect(saved).toMatchObject({
        analysisOnly: false,
        description: 'Immagine caricata dall’utente',
      });
      expect(normal.receipts.list().length).toBe(before);
    } finally {
      await client.call('PUT', '/preferences', { ...preferences, imageCheck: true });
    }
  }, 90_000);

  it('senza file, con un file che non è un’immagine o per un film che non c’è: errore chiaro', async () => {
    const { film } = await filmWithShot(normal.client);
    const route = `/projects/${film.id}/moodboard/references`;

    for (const body of [
      undefined,
      Buffer.alloc(0),
      Buffer.from('<svg></svg>'),
      Buffer.from('MZ'),
    ]) {
      const reply = failure(await post(normal, route, body));
      expect(reply, String(body)).toMatchObject({ status: 400, code: 'invalid_request' });
      expect(reply.details?.field).toBe('file');
    }
    expect(
      failure(await post(normal, '/projects/non-esiste/moodboard/references', redImage)).status,
    ).toBe(404);
  }, 90_000);
});
