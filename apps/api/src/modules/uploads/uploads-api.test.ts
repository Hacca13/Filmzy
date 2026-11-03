import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  UPLOAD_MAX_BYTES,
  domainErrorSchema,
  locationImagesSchema,
  projectOptionsSchema,
  projectSchema,
  shotImagesSchema,
  uploadedImageSchema,
  uploadsSchema,
} from '@filmzy/contracts';
import { projectsDir, type ReceiptStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Le foto caricate (T4.8, D19), col server vero e il fornitore finto (nessuna spesa vera): una foto
 * di un luogo o di un oggetto si controlla con l'analista di immagini e si salva; una con persone
 * (o un marchio…) si rifiuta e non resta sul disco; se il controllo non risponde la foto non passa.
 */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = (label: string) => Buffer.concat([PNG_SIGNATURE, Buffer.from(label)]);
const checksum = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

interface Running {
  app: NestExpressApplication;
  client: Client;
  base: string;
  dataDir: string;
  receipts: ReceiptStore;
}

const run = promisify(execFile);

let accepting: Running;
let people: Running;
let failing: Running;

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
  accepting = await running(startApp());
  people = await running(
    startAppWithFixtures({
      image_analyst: {
        data: {
          description: 'a living room with a family photo',
          moodTags: ['cosy'],
          lighting: 'daylight',
          composition: 'wide',
          containsPeople: true,
          flags: ['brand', 'minor', 'a-weapon'],
        },
      },
    }),
  );
  failing = await running(
    startAppWithFixtures({
      image_analyst: { error: { code: 'provider_unavailable', retryable: true, message: 'fermo' } },
    }),
  );
}, 90_000);

afterAll(async () => {
  await Promise.all([accepting.app.close(), people.app.close(), failing.app.close()]);
});

/** Una foto vera, di rumore, che pesa più del limite oltre il quale la foto si riduce per la lettura. */
async function realBigPng(): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-grande-'));
  const file = path.join(dir, 'grande.png');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc2=size=2000x1500:rate=1',
      '-vf',
      'noise=alls=80:allf=t',
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    { windowsHide: true },
  );
  return readFile(file);
}

async function plainFilm(client: Client) {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  return projectSchema.parse(
    (
      await client.call('POST', '/projects', {
        idea: 'Una bobina dimenticata sull’ultimo treno della sera.',
        genre: options.defaults.genre,
        tone: options.defaults.tone,
        style: options.defaults.style,
        cinematography: options.defaults.cinematography,
        durationS: 60,
      })
    ).body,
  );
}

async function upload(
  server: Running,
  projectId: string,
  query: string,
  body: Buffer | string | undefined,
  contentType = 'image/png',
) {
  const response = await fetch(`${server.base}/api/projects/${projectId}/uploads?${query}`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    ...(body === undefined ? {} : { body }),
  });
  const text = await response.text();
  return { status: response.status, body: text === '' ? undefined : (JSON.parse(text) as unknown) };
}

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

const list = async (server: Running, projectId: string) =>
  uploadsSchema.parse((await server.client.call('GET', `/projects/${projectId}/uploads`)).body);

describe('caricare una foto', () => {
  it('prima di cominciare non ce n’è nessuna, e la funzione e la prudenza sono accese', async () => {
    const film = await plainFilm(accepting.client);

    expect(await list(accepting, film.id)).toEqual({ enabled: true, checking: true, uploads: [] });
  });

  it('la foto di un luogo passa dal controllo, si salva e si serve com’era', async () => {
    const { client, base } = accepting;
    const { film, location } = await filmWithShot(client);
    const bytes = png('stanza vuota');
    const before = accepting.receipts.list().length;

    const reply = await upload(
      accepting,
      film.id,
      `kind=location&locationId=${location.id}&name=${encodeURIComponent('La stanza')}`,
      bytes,
    );

    expect(reply.status).toBe(201);
    const saved = uploadedImageSchema.parse(reply.body);
    expect(saved).toMatchObject({
      assetId: checksum(bytes),
      kind: 'location',
      locationId: location.id,
      name: 'La stanza',
      checked: true,
    });
    expect(saved.description).toBeTruthy();
    // Il controllo è una chiamata a un servizio: lascia il suo scontrino (regola 4).
    expect(accepting.receipts.list().length).toBe(before + 1);

    const file = await fetch(`${base}/api/assets/${saved.assetId}`);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('image/png');
    expect(Buffer.from(await file.arrayBuffer()).equals(bytes)).toBe(true);
    expect((await list(accepting, film.id)).uploads).toEqual([saved]);
  }, 60_000);

  it('la foto di un luogo si sceglie come riferimento del luogo, come le immagini fatte da Filmzy', async () => {
    const { client } = accepting;
    const { film, location, places } = await filmWithShot(client);
    const saved = uploadedImageSchema.parse(
      (await upload(accepting, film.id, `kind=location&locationId=${location.id}`, png('cucina')))
        .body,
    );

    const images = locationImagesSchema.parse(
      (await client.call('GET', `${places}/${location.id}/images`)).body,
    );
    expect(images.uploadedAssetIds).toEqual([saved.assetId]);

    const chosen = await client.call('PUT', `${places}/${location.id}/images/choice`, {
      assetId: saved.assetId,
    });
    expect(locationImagesSchema.parse(chosen.body).chosenAssetId).toBe(saved.assetId);
  }, 60_000);

  it('la foto di un oggetto entra tra le immagini dell’inquadratura e si può impostare', async () => {
    const { client } = accepting;
    const { film, shot, shots } = await filmWithShot(client);
    const saved = uploadedImageSchema.parse(
      (await upload(accepting, film.id, 'kind=object&name=La%20lanterna', png('lanterna'))).body,
    );
    expect(saved.locationId).toBeUndefined();

    const path = `${shots}/${shot.id}/images`;
    const offered = shotImagesSchema.parse((await client.call('GET', path)).body);
    expect(offered.candidates).toContainEqual({ assetId: saved.assetId, mode: 'upload' });

    const set = await client.call('PUT', path, {
      images: [{ use: 'reference', assetId: saved.assetId }],
    });
    expect(shotImagesSchema.parse(set.body).images).toEqual([
      { use: 'reference', from: 'upload', assetId: saved.assetId },
    ]);
  }, 60_000);

  it('la stessa foto per lo stesso luogo è una sola, e non si controlla due volte la stessa risposta', async () => {
    const { film, location } = await filmWithShot(accepting.client);
    const query = `kind=location&locationId=${location.id}`;

    const first = uploadedImageSchema.parse(
      (await upload(accepting, film.id, query, png('uguale'))).body,
    );
    const again = uploadedImageSchema.parse(
      (await upload(accepting, film.id, query, png('uguale'))).body,
    );

    expect(again.id).toBe(first.id);
    expect((await list(accepting, film.id)).uploads).toHaveLength(1);
  }, 60_000);

  it('ricaricare una foto già controllata non chiama di nuovo il servizio: niente spesa in più', async () => {
    const { film } = await filmWithShot(accepting.client);
    await upload(accepting, film.id, 'kind=object', png('già vista'));
    const before = accepting.receipts.list().length;

    const again = await upload(accepting, film.id, 'kind=object', png('già vista'));

    expect(again.status).toBe(201);
    expect(accepting.receipts.list().length).toBe(before);
  }, 60_000);

  it('una foto salvata a controllo spento si controlla quando lo si riaccende, e la riga si aggiorna', async () => {
    const { client } = accepting;
    const film = await plainFilm(client);
    const preferences = (await client.call('GET', '/preferences')).body as Record<string, unknown>;
    const bytes = png('prima senza controllo');

    await client.call('PUT', '/preferences', { ...preferences, imageCheck: false });
    const unchecked = uploadedImageSchema.parse(
      (await upload(accepting, film.id, 'kind=object', bytes)).body,
    );
    await client.call('PUT', '/preferences', { ...preferences, imageCheck: true });
    const before = accepting.receipts.list().length;

    const checked = uploadedImageSchema.parse(
      (await upload(accepting, film.id, 'kind=object', bytes)).body,
    );

    expect(unchecked.checked).toBe(false);
    expect(checked).toMatchObject({ id: unchecked.id, checked: true });
    expect(checked.description).toBeTruthy();
    expect(accepting.receipts.list().length).toBe(before + 1);
    expect((await list(accepting, film.id)).uploads).toHaveLength(1);
  }, 60_000);

  it('togliendo un luogo dal film escono anche le sue foto, dall’elenco e dalle immagini delle inquadrature', async () => {
    const { client } = accepting;
    const { film, location, shot, shots, places } = await filmWithShot(client);
    const photo = uploadedImageSchema.parse(
      (
        await upload(
          accepting,
          film.id,
          `kind=location&locationId=${location.id}`,
          png('da togliere'),
        )
      ).body,
    );
    const object = uploadedImageSchema.parse(
      (await upload(accepting, film.id, 'kind=object', png('resta'))).body,
    );

    expect((await client.call('DELETE', `${places}/${location.id}`)).status).toBe(204);

    expect((await list(accepting, film.id)).uploads.map((item) => item.id)).toEqual([object.id]);
    const offered = shotImagesSchema.parse(
      (await client.call('GET', `${shots}/${shot.id}/images`)).body,
    );
    expect(offered.candidates.map((candidate) => candidate.assetId)).not.toContain(photo.assetId);
    expect(offered.candidates.map((candidate) => candidate.assetId)).toContain(object.assetId);
  }, 60_000);

  it('una foto grande da telefono si controlla ridotta ma si salva intera, senza lasciare copie provvisorie', async () => {
    const { client } = accepting;
    const { film } = await filmWithShot(client);
    const big = await realBigPng();
    expect(big.length).toBeGreaterThan(3 * 1024 * 1024);

    const reply = await upload(accepting, film.id, 'kind=object', big);

    expect(reply.status).toBe(201);
    const saved = uploadedImageSchema.parse(reply.body);
    expect(saved.checked).toBe(true);
    const file = await fetch(`${accepting.base}/api/assets/${saved.assetId}`);
    expect(Buffer.from(await file.arrayBuffer()).equals(big)).toBe(true);
    const folder = path.join(projectsDir(accepting.dataDir), film.id, 'caricate');
    expect((await readdir(folder)).filter((name) => name.startsWith('lettura-'))).toEqual([]);
  }, 90_000);

  it('una foto grande che ffmpeg non sa leggere non passa: errore chiaro, niente salvato, niente copie', async () => {
    const film = await plainFilm(accepting.client);
    const broken = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(4 * 1024 * 1024)]);

    const reply = failure(await upload(accepting, film.id, 'kind=object', broken));

    expect(reply).toMatchObject({ status: 422, code: 'media_failed' });
    expect((await list(accepting, film.id)).uploads).toEqual([]);
    const folder = path.join(projectsDir(accepting.dataDir), film.id, 'caricate');
    expect(await readdir(folder).catch(() => [])).toEqual([]);
  }, 60_000);

  it('con la prudenza spenta la foto si salva senza controllo e senza spendere', async () => {
    const { client } = accepting;
    const film = await plainFilm(client);
    const preferences = (await client.call('GET', '/preferences')).body as Record<string, unknown>;
    await client.call('PUT', '/preferences', { ...preferences, imageCheck: false });
    const before = accepting.receipts.list().length;

    try {
      const reply = await upload(accepting, film.id, 'kind=object', png('senza controllo'));

      expect(reply.status).toBe(201);
      expect(uploadedImageSchema.parse(reply.body)).toMatchObject({ checked: false });
      expect(uploadedImageSchema.parse(reply.body).description).toBeUndefined();
      expect(accepting.receipts.list().length).toBe(before);
      expect((await list(accepting, film.id)).checking).toBe(false);
    } finally {
      await client.call('PUT', '/preferences', { ...preferences, imageCheck: true });
    }
  }, 60_000);
});

describe('una foto che non va', () => {
  it('con persone (o un marchio, un minore…) si rifiuta, dice perché e non resta sul disco', async () => {
    const film = await plainFilm(people.client);
    const bytes = png('famiglia');
    const before = people.receipts.list().length;

    const reply = failure(await upload(people, film.id, 'kind=object', bytes));

    expect(reply).toMatchObject({ status: 422, code: 'image_rejected', retryable: false });
    expect(reply.details?.imageProblems).toEqual(['people', 'brand', 'minor', 'other']);
    // Il controllo ha avuto il suo scontrino, ma la foto non è stata salvata da nessuna parte.
    expect(people.receipts.list().length).toBe(before + 1);
    expect((await list(people, film.id)).uploads).toEqual([]);
    expect((await fetch(`${people.base}/api/assets/${checksum(bytes)}`)).status).toBe(404);
  }, 60_000);

  it('se il controllo non risponde la foto non passa, senza altri servizi provati', async () => {
    const film = await plainFilm(failing.client);
    const bytes = png('controllo fermo');
    const before = failing.receipts.list().length;

    const raw = await upload(failing, film.id, 'kind=object', bytes);
    const reply = failure(raw);

    expect(reply.status).toBe(502);
    expect(reply.code).toBe('provider_unavailable');
    expect((await list(failing, film.id)).uploads).toEqual([]);
    expect((await fetch(`${failing.base}/api/assets/${checksum(bytes)}`)).status).toBe(404);
    // Un solo servizio chiamato, con i suoi tentativi: nessun altro scontrino fuori da quello.
    expect(
      new Set(
        failing.receipts
          .list()
          .slice(0, failing.receipts.list().length - before)
          .map((r) => r.modelId),
      ).size,
    ).toBe(1);
  }, 60_000);
});

describe('un caricamento sbagliato', () => {
  it('senza file, con un file che non è un’immagine o con un nome da foto ma altro dentro', async () => {
    const film = await plainFilm(accepting.client);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>');

    for (const body of [undefined, Buffer.alloc(0), svg, Buffer.from('MZ programma')]) {
      const reply = failure(await upload(accepting, film.id, 'kind=object', body));
      expect(reply, String(body)).toMatchObject({ status: 400, code: 'invalid_request' });
      expect(reply.details?.field).toBe('file');
    }
    // Un corpo che non è un file (JSON) non passa dal parser delle immagini.
    const json = failure(
      await upload(accepting, film.id, 'kind=object', JSON.stringify({ a: 1 }), 'application/json'),
    );
    expect(json).toMatchObject({ status: 400, code: 'invalid_request' });
    expect((await list(accepting, film.id)).uploads).toEqual([]);
  }, 60_000);

  it('una foto troppo grande si rifiuta con un errore chiaro', async () => {
    const film = await plainFilm(accepting.client);
    const big = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(UPLOAD_MAX_BYTES)]);

    const reply = failure(await upload(accepting, film.id, 'kind=object', big));

    expect(reply).toMatchObject({ status: 400, code: 'invalid_request' });
    expect(reply.details?.field).toBe('file');
  }, 60_000);

  it('il luogo: obbligatorio per un luogo, assente per un oggetto, e deve essere di quel film', async () => {
    const { film, location } = await filmWithShot(accepting.client);
    const other = await plainFilm(accepting.client);

    const cases = [
      `kind=location`,
      `kind=location&locationId=non-esiste`,
      `kind=object&locationId=${location.id}`,
    ];
    for (const query of cases) {
      const reply = failure(await upload(accepting, film.id, query, png('luogo sbagliato')));
      expect(reply, query).toMatchObject({ status: 400, code: 'invalid_request' });
      expect(reply.details?.field, query).toBe('locationId');
    }
    // Il luogo di un altro film non vale.
    const foreign = failure(
      await upload(
        accepting,
        other.id,
        `kind=location&locationId=${location.id}`,
        png('altro film'),
      ),
    );
    expect(foreign.details?.field).toBe('locationId');
  }, 60_000);

  it('le domande sbagliate o un film che non c’è danno un errore chiaro', async () => {
    const film = await plainFilm(accepting.client);

    for (const query of ['', 'kind=persona', 'kind=object&altro=1', 'kind=object&name=']) {
      expect(failure(await upload(accepting, film.id, query, png('domanda'))).status, query).toBe(
        400,
      );
    }
    expect(failure(await upload(accepting, 'non-esiste', 'kind=object', png('film'))).status).toBe(
      404,
    );
    expect((await accepting.client.call('GET', '/projects/non-esiste/uploads')).status).toBe(404);
  }, 60_000);
});
