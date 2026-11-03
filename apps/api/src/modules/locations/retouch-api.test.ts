import { execFile } from 'node:child_process';
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  domainErrorSchema,
  locationImagesSchema,
  shotPlansSchema,
  sheetOptionsSchema,
  uploadedImageSchema,
  type LocationImages,
} from '@filmzy/contracts';
import { projectsDir, type ReceiptStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Il ritocco col pennello (T4.9, D21), col server vero e il fornitore finto (nessuna spesa vera): si
 * dipinge una zona di un'immagine del set, si sceglie cosa farne, il lavoro in coda dà un nuovo
 * tentativo del luogo; usato come riferimento, fa ingiallire le inquadrature già fatte (R6).
 */
const SEED_CONFIG = fileURLToPath(new URL('../../../../../config', import.meta.url));
const run = promisify(execFile);

interface Running {
  app: NestExpressApplication;
  client: Client;
  base: string;
  dataDir: string;
  receipts: ReceiptStore;
}

let normal: Running;
let strict: Running;
let paintedMask: Buffer;
let emptyMask: Buffer;

async function maskFile(name: string, source: string): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-maschera-'));
  const file = path.join(dir, name);
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      source,
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    { windowsHide: true },
  );
  return readFile(file);
}

async function running(
  started: Promise<{ app: NestExpressApplication; client: Client; dataDir: string }>,
): Promise<Running> {
  const { app, client, dataDir } = await started;
  return {
    app,
    client,
    dataDir,
    base: await app.getUrl(),
    receipts: app.get<ReceiptStore>(RECEIPT_STORE),
  };
}

beforeAll(async () => {
  paintedMask = await maskFile('piena.png', 'color=c=white:s=64x64,format=rgba');
  emptyMask = await maskFile('vuota.png', 'color=c=black@0.0:s=64x64,format=rgba');
  normal = await running(startApp());

  // Una copia della configurazione in cui il moderatore finto risponde sempre «no».
  const root = await mkdtemp(path.join(tmpdir(), 'filmzy-ritocco-'));
  const configDir = path.join(root, 'config');
  const fixturesDir = path.join(root, 'fixtures');
  cpSync(SEED_CONFIG, configDir, { recursive: true });
  mkdirSync(fixturesDir);
  writeFileSync(
    path.join(fixturesDir, 'moderator.json'),
    JSON.stringify({ data: { allowed: false, reason: 'Non si può.' } }),
  );
  writeFileSync(
    path.join(configDir, 'ai', 'environments', 'offline.yaml'),
    `connections:\n  "*":\n    adapter: fake\n    fixtures: ${JSON.stringify(fixturesDir.replaceAll('\\', '/'))}\n`,
  );
  strict = await running(startApp(undefined, 'offline', configDir));
}, 90_000);

afterAll(async () => {
  await Promise.all([normal.app.close(), strict.app.close()]);
});

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

/** Manda una richiesta con un file come corpo, come fa l'interfaccia. */
async function post(server: Running, route: string, body: Buffer | string | undefined) {
  const response = await fetch(`${server.base}/api${route}`, {
    method: 'POST',
    headers: { 'content-type': 'image/png' },
    ...(body === undefined ? {} : { body }),
  });
  const text = await response.text();
  return { status: response.status, body: text === '' ? undefined : (JSON.parse(text) as unknown) };
}

async function untilIdle(server: Running, route: string): Promise<LocationImages> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const images = locationImagesSchema.parse((await server.client.call('GET', route)).body);
    if (images.attempts.every((item) => item.status === 'succeeded' || item.status === 'failed')) {
      return images;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il lavoro non è finito in tempo');
}

/** Un film con un luogo che ha già un set fatto da Filmzy, pronto da ritoccare. */
async function filmWithSet(server: Running) {
  const film = await filmWithShot(server.client);
  const route = `${film.places}/${film.location.id}/images`;
  await server.client.call('POST', route, {});
  const images = await untilIdle(server, route);
  const assetId = images.attempts[0]?.assetIds[0];
  if (assetId === undefined) throw new Error('il set doveva avere delle immagini');
  return { ...film, route, assetId, retouch: `${film.places}/${film.location.id}/retouch` };
}

describe('i servizi e la stima del ritocco', () => {
  it('dice quali servizi possono farlo e quanto costerebbe', async () => {
    const { retouch, assetId } = await filmWithSet(normal);

    const reply = await normal.client.call(
      'GET',
      `${retouch}/options?assetId=${assetId}&operation=remove`,
    );

    expect(reply.status).toBe(200);
    const { options } = sheetOptionsSchema.parse(reply.body);
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.estimatedCostUsd > 0)).toBe(true);
  }, 90_000);
});

describe('ritoccare', () => {
  it('«togli»: nasce un tentativo di ritocco che riesce, con il suo servizio e costo, senza file provvisori', async () => {
    const { film, route, assetId, retouch } = await filmWithSet(normal);

    const started = await post(
      normal,
      `${retouch}?assetId=${assetId}&operation=remove`,
      paintedMask,
    );

    expect(started.status).toBe(201);
    const first = locationImagesSchema.parse(started.body).attempts[0];
    expect(first?.retouch).toEqual({ sourceAssetId: assetId, operation: 'remove' });

    const done = await untilIdle(normal, route);
    const attempt = done.attempts[0];
    expect(attempt?.status).toBe('succeeded');
    expect(attempt?.assetIds).toHaveLength(1);
    expect(attempt?.modelLabel).toBeTruthy();
    expect(typeof attempt?.costUsd).toBe('number');
    const file = await fetch(`${normal.base}/api/assets/${attempt?.assetIds[0] ?? ''}`);
    expect(file.status).toBe(200);

    // La maschera e l'immagine marcata servivano al lavoro: finito, non restano.
    const folder = path.join(projectsDir(normal.dataDir), film.id, 'ritocco');
    expect(await readdir(folder)).toEqual([]);
  }, 90_000);

  it('«sostituisci» porta le parole dell’utente nel tentativo; il risultato si sceglie come riferimento', async () => {
    const { route, assetId, retouch, places, location } = await filmWithSet(normal);

    await post(
      normal,
      `${retouch}?assetId=${assetId}&operation=replace&instruction=${encodeURIComponent('una lampada rossa')}`,
      paintedMask,
    );
    const done = await untilIdle(normal, route);
    const attempt = done.attempts[0];
    expect(attempt?.retouch).toMatchObject({
      operation: 'replace',
      instruction: 'una lampada rossa',
    });

    const result = attempt?.assetIds[0] ?? '';
    const chosen = await normal.client.call('PUT', `${places}/${location.id}/images/choice`, {
      assetId: result,
    });
    expect(locationImagesSchema.parse(chosen.body).chosenAssetId).toBe(result);
  }, 90_000);

  it('un ritocco si può fare anche su un ritocco di prima', async () => {
    const { route, assetId, retouch } = await filmWithSet(normal);
    await post(normal, `${retouch}?assetId=${assetId}&operation=remove`, paintedMask);
    const first = (await untilIdle(normal, route)).attempts[0]?.assetIds[0] ?? '';

    const again = await post(normal, `${retouch}?assetId=${first}&operation=remove`, paintedMask);

    expect(again.status).toBe(201);
  }, 90_000);

  it('mentre un tentativo lavora non se ne apre un altro: un doppio clic costa una volta sola', async () => {
    const { retouch, assetId } = await filmWithSet(normal);

    const replies = await Promise.all([
      post(normal, `${retouch}?assetId=${assetId}&operation=remove`, paintedMask),
      post(normal, `${retouch}?assetId=${assetId}&operation=remove`, paintedMask),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual([201, 409]);
  }, 90_000);
});

describe('un ritocco che non si può fare', () => {
  it('manca la maschera, è vuota, non è un PNG o la richiesta non c’è: errore chiaro, niente in coda', async () => {
    const { route, assetId, retouch } = await filmWithSet(normal);
    const before = normal.receipts.list().length;

    const cases: [string, Buffer | undefined, string][] = [
      [`operation=remove`, undefined, 'mask'],
      [`operation=remove`, Buffer.alloc(0), 'mask'],
      [`operation=remove`, emptyMask, 'mask'],
      [`operation=remove`, Buffer.from('non sono un png'), 'mask'],
      [`operation=replace`, paintedMask, 'instruction'],
      [`operation=remove&instruction=ciao`, paintedMask, 'instruction'],
      [`operation=dipingi`, paintedMask, 'operation'],
    ];
    for (const [query, body, field] of cases) {
      const reply = failure(await post(normal, `${retouch}?assetId=${assetId}&${query}`, body));
      expect(reply, query).toMatchObject({ status: 400, code: 'invalid_request' });
      expect(reply.details?.field, query).toBe(field);
    }
    expect(
      locationImagesSchema.parse((await normal.client.call('GET', route)).body).attempts,
    ).toHaveLength(1);
    expect(normal.receipts.list().length).toBe(before);
  }, 90_000);

  it('un’immagine che non è di questo luogo, o un luogo che non c’è, non si ritoccano', async () => {
    const { retouch, places } = await filmWithSet(normal);

    const foreign = failure(
      await post(normal, `${retouch}?assetId=${'f'.repeat(64)}&operation=remove`, paintedMask),
    );
    expect(foreign).toMatchObject({ status: 409, code: 'invalid_request' });
    expect(foreign.details?.field).toBe('image');

    const nowhere = failure(
      await post(
        normal,
        `${places}/non-esiste/retouch?assetId=${'f'.repeat(64)}&operation=remove`,
        paintedMask,
      ),
    );
    expect(nowhere.status).toBe(404);
  }, 90_000);

  it('una foto caricata senza controllo non si ritocca; con il controllo sì (D19)', async () => {
    const { client } = normal;
    const { film, location, retouch } = await filmWithSet(normal);
    const photo = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('foto di prova'),
    ]);
    const upload = async () =>
      uploadedImageSchema.parse(
        (
          await post(
            normal,
            `/projects/${film.id}/uploads?kind=location&locationId=${location.id}`,
            photo,
          )
        ).body,
      );
    const preferences = (await client.call('GET', '/preferences')).body as Record<string, unknown>;

    await client.call('PUT', '/preferences', { ...preferences, imageCheck: false });
    const unchecked = await upload();
    await client.call('PUT', '/preferences', { ...preferences, imageCheck: true });

    const refused = failure(
      await post(normal, `${retouch}?assetId=${unchecked.assetId}&operation=remove`, paintedMask),
    );
    expect(refused).toMatchObject({ status: 409, code: 'invalid_request' });
    expect(refused.details?.field).toBe('unchecked');

    const checked = await upload();
    expect(checked.checked).toBe(true);
    const accepted = await post(
      normal,
      `${retouch}?assetId=${checked.assetId}&operation=remove`,
      paintedMask,
    );
    expect(accepted.status).toBe(201);
  }, 120_000);

  it('le parole dell’utente passano dal moderatore: un «no» non mette niente in coda e non spende', async () => {
    const { client } = strict;
    const preferences = (await client.call('GET', '/preferences')).body as Record<string, unknown>;
    await client.call('PUT', '/preferences', { ...preferences, moderation: false });
    const { route, assetId, retouch } = await filmWithSet(strict);
    await client.call('PUT', '/preferences', { ...preferences, moderation: true });
    const before = strict.receipts.list().length;

    const reply = failure(
      await post(
        strict,
        `${retouch}?assetId=${assetId}&operation=replace&instruction=${encodeURIComponent('un nome famoso')}`,
        paintedMask,
      ),
    );

    expect(reply).toMatchObject({ status: 422, code: 'content_rejected' });
    expect(
      locationImagesSchema.parse((await client.call('GET', route)).body).attempts,
    ).toHaveLength(1);
    // Il moderatore ha avuto il suo scontrino; il ritocco no.
    expect(strict.receipts.list().length).toBe(before + 1);
  }, 120_000);
});

describe('R6: un luogo cambiato ingiallisce le inquadrature già fatte', () => {
  it('scegliere il ritocco come riferimento fa ingiallire l’inquadratura già disegnata; rifarla toglie il giallo', async () => {
    const { client } = normal;
    const { shot, shots, route, assetId, retouch, places, location } = await filmWithSet(normal);
    expect(shot.location.locationId).toBe(location.id);

    // L'inquadratura ha già un lavoro riuscito: uno storyboard.
    await client.call('POST', `${shots}/${shot.id}/storyboard`, {});
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const sb = (await client.call('GET', `${shots}/${shot.id}/storyboard`)).body as {
        attempts: { status: string }[];
      };
      if (sb.attempts[0]?.status === 'succeeded') break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const flagsOf = async () =>
      shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0]?.flags ?? {};
    expect(await flagsOf()).toEqual({});

    // Il ritocco, da solo, non cambia il luogo: il giallo viene quando lo si usa.
    await new Promise((resolve) => setTimeout(resolve, 20));
    await post(normal, `${retouch}?assetId=${assetId}&operation=remove`, paintedMask);
    const result = (await untilIdle(normal, route)).attempts[0]?.assetIds[0] ?? '';
    expect(await flagsOf()).toEqual({});

    await client.call('PUT', `${places}/${location.id}/images/choice`, { assetId: result });
    const flags = await flagsOf();
    expect(flags[shot.id]).toEqual([
      { code: 'R6', reason: expect.stringContaining('Rifai') as string, origin: 'rule' },
    ]);

    // Rifatto lo storyboard dopo il cambiamento, l'inquadratura è di nuovo allineata.
    await new Promise((resolve) => setTimeout(resolve, 20));
    await client.call('POST', `${shots}/${shot.id}/storyboard`, {});
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const sb = (await client.call('GET', `${shots}/${shot.id}/storyboard`)).body as {
        attempts: { status: string }[];
      };
      if (sb.attempts[0]?.status === 'succeeded') break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(await flagsOf()).toEqual({});
  }, 120_000);
});
