import {
  domainErrorSchema,
  moodboardViewSchema,
  sheetOptionsSchema,
  type MoodboardView,
} from '@filmzy/contracts';
import type { MoodboardStore, ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';
import { MoodboardGenerationService } from './moodboard-generation.service.js';
import { MOODBOARD_STORE } from './tokens.js';

/**
 * «Crea il moodboard» (T4.10, D37), col server vero e il fornitore finto (nessuna spesa vera): il
 * responsabile dell'atmosfera propone colori e consigli, un lavoro in coda fa le immagini, e un errore
 * dice perché e lascia decidere all'utente.
 */
interface Running {
  app: NestExpressApplication;
  client: Client;
  base: string;
  receipts: ReceiptStore;
}

let normal: Running;
let artistFails: Running;
let designerFails: Running;

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
  normal = await running(startApp());
  artistFails = await running(
    startAppWithFixtures({
      moodboard_artist: {
        error: {
          code: 'content_rejected',
          retryable: false,
          message: 'il fornitore finto rifiuta',
        },
      },
    }),
  );
  designerFails = await running(
    startAppWithFixtures({
      moodboard_designer: {
        error: { code: 'provider_unavailable', retryable: true, message: 'fermo' },
      },
    }),
  );
}, 90_000);

afterAll(async () => {
  await Promise.all([normal.app.close(), artistFails.app.close(), designerFails.app.close()]);
});

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

async function read(server: Running, film: string): Promise<MoodboardView> {
  return moodboardViewSchema.parse(
    (await server.client.call('GET', `/projects/${film}/moodboard`)).body,
  );
}

async function untilDone(server: Running, film: string): Promise<MoodboardView> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = await read(server, film);
    if (current.run?.status === 'succeeded' || current.run?.status === 'failed') return current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('le immagini non sono arrivate in tempo');
}

describe('i servizi e la stima', () => {
  it('dice quali servizi fanno le immagini e quanto costerebbe tutto il lavoro', async () => {
    const { film } = await filmWithShot(normal.client);

    const reply = await normal.client.call('GET', `/projects/${film.id}/moodboard/options`);

    expect(reply.status).toBe(200);
    const { options } = sheetOptionsSchema.parse(reply.body);
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.estimatedCostUsd > 0)).toBe(true);
  }, 60_000);
});

describe('creare il moodboard', () => {
  it('colori e consigli del film vengono dal responsabile dell’atmosfera, le immagini dal lavoro in coda', async () => {
    const { film } = await filmWithShot(normal.client);
    const path = `/projects/${film.id}/moodboard`;
    await normal.client.call('PUT', path, {
      palette: [{ hex: '#111111' }],
      notes: 'Vecchi consigli.',
    });
    const before = normal.receipts.list().length;

    const started = await normal.client.call('POST', `${path}/generate`, {});

    expect(started.status).toBe(201);
    expect(['queued', 'running']).toContain(moodboardViewSchema.parse(started.body).run?.status);
    const done = await untilDone(normal, film.id);

    expect(done.run).toMatchObject({ status: 'succeeded', images: 2 });
    expect(done.run?.modelLabel).toBeTruthy();
    // Colori e consigli di prima sono sostituiti da quelli proposti.
    expect(done.moodboard.film.palette.map((color) => color.hex)).toEqual(['#2b3a55', '#e0a060']);
    expect(done.moodboard.film.notes).toContain('Luce calda');
    // Le immagini: nate da noi, con il prompt come descrizione e i colori calcolati dal codice.
    const references = done.moodboard.film.references;
    expect(references).toHaveLength(2);
    expect(references.every((reference) => reference.origin === 'generated')).toBe(true);
    expect(references.every((reference) => !reference.analysisOnly)).toBe(true);
    expect(references[0]?.description).toContain('town square');
    expect(references[0]?.palette.length).toBeGreaterThan(0);
    expect(references[0]?.generationId).toBeTruthy();
    const file = await fetch(`${normal.base}/api/assets/${references[0]?.assetId ?? ''}`);
    expect(file.status).toBe(200);
    // Un'immagine per prompt, più il testo: ogni chiamata ha il suo scontrino (regola 4).
    expect(normal.receipts.list().length).toBe(before + 3);
  }, 90_000);

  it('per una scena si crea la sua parte, e quella del film resta com’è', async () => {
    const { film } = await filmWithShot(normal.client);
    const path = `/projects/${film.id}/moodboard`;
    await normal.client.call('PUT', path, { palette: [{ hex: '#111111' }], notes: 'Del film.' });

    await normal.client.call('POST', `${path}/generate`, { sceneId: 'scene-1' });
    const done = await untilDone(normal, film.id);

    expect(done.moodboard.film).toMatchObject({
      palette: [{ hex: '#111111' }],
      notes: 'Del film.',
    });
    expect(done.moodboard.film.references).toEqual([]);
    expect(done.moodboard.scenes[0]).toMatchObject({ sceneId: 'scene-1' });
    expect(done.moodboard.scenes[0]?.references).toHaveLength(2);
    expect(done.run?.sceneId).toBe('scene-1');
  }, 90_000);

  it('mentre un lavoro è aperto non se ne apre un altro: un doppio clic costa una volta sola', async () => {
    const { film } = await filmWithShot(normal.client);
    const path = `/projects/${film.id}/moodboard/generate`;

    const replies = await Promise.all([
      normal.client.call('POST', path, {}),
      normal.client.call('POST', path, {}),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual([201, 409]);
    await untilDone(normal, film.id);
  }, 90_000);

  it('un limite di spesa si ferma prima di spendere, e con «prosegui» passa', async () => {
    const { film } = await filmWithShot(normal.client);
    const path = `/projects/${film.id}/moodboard/generate`;
    await normal.client.call('PUT', '/limits/confirm-above', { usd: 0.0001 });
    const before = normal.receipts.list().length;

    try {
      const refused = failure(await normal.client.call('POST', path, {}));
      expect(refused).toMatchObject({ status: 409, code: 'spend_cap_reached' });
      expect((await read(normal, film.id)).run).toBeUndefined();
      expect(normal.receipts.list().length).toBe(before);

      const confirmed = await normal.client.call('POST', path, { spendConfirmed: true });
      expect(confirmed.status).toBe(201);
      await untilDone(normal, film.id);
    } finally {
      await normal.client.call('PUT', '/limits/confirm-above', { usd: null });
    }
  }, 90_000);

  it('senza la storia non si crea, e una scena che non c’è si rifiuta', async () => {
    const options = (await normal.client.call('GET', '/projects/options')).body as {
      defaults: Record<string, string>;
    };
    const bare = (
      await normal.client.call('POST', '/projects', {
        idea: 'Un film senza storia ancora.',
        genre: options.defaults['genre'],
        tone: options.defaults['tone'],
        style: options.defaults['style'],
        cinematography: options.defaults['cinematography'],
        durationS: 60,
      })
    ).body as { id: string };
    const withStory = await filmWithShot(normal.client);

    const noStory = failure(
      await normal.client.call('POST', `/projects/${bare.id}/moodboard/generate`, {}),
    );
    const noScene = failure(
      await normal.client.call('POST', `/projects/${withStory.film.id}/moodboard/generate`, {
        sceneId: 'scene-99',
      }),
    );

    expect(noStory).toMatchObject({ status: 409, code: 'invalid_request' });
    expect(noStory.details?.field).toBe('screenplay');
    expect(noScene).toMatchObject({ status: 400, code: 'invalid_request' });
    expect(noScene.details?.field).toBe('sceneId');
  }, 60_000);
});

describe('un lavoro ripetuto (regola 10)', () => {
  /** Il lavoro com'è in coda, rimesso insieme da ciò che la richiesta ha lasciato. */
  async function finished() {
    const { film } = await filmWithShot(normal.client);
    await normal.client.call('POST', `/projects/${film.id}/moodboard/generate`, {});
    const done = await untilDone(normal, film.id);
    const { options } = sheetOptionsSchema.parse(
      (await normal.client.call('GET', `/projects/${film.id}/moodboard/options`)).body,
    );
    const references = done.moodboard.film.references;
    const payload = {
      projectId: film.id,
      runId: done.run?.id ?? '',
      // Il prompt di ogni immagine è la sua descrizione.
      prompts: references.map((reference) => reference.description),
      modelId: options[0]?.modelId ?? '',
    };
    return {
      film,
      payload,
      store: normal.app.get<MoodboardStore>(MOODBOARD_STORE),
      service: normal.app.get(MoodboardGenerationService),
    };
  }

  const artistReceipts = () =>
    normal.receipts.list().filter((receipt) => receipt.role === 'moodboard_artist').length;

  it('un lavoro già finito non fa niente', async () => {
    const { film, payload, service } = await finished();
    const before = artistReceipts();

    await service.makeImages(payload);

    expect((await read(normal, film.id)).moodboard.film.references).toHaveLength(2);
    expect(artistReceipts()).toBe(before);
  }, 90_000);

  it('nemmeno uno chiuso con un errore: rifarlo lo decide l’utente', async () => {
    const { film, payload, store, service } = await finished();
    store.updateRun(payload.runId, { status: 'failed', errorCode: 'interrupted' });
    const before = artistReceipts();

    await service.makeImages(payload);

    expect((await read(normal, film.id)).run).toMatchObject({
      status: 'failed',
      errorCode: 'interrupted',
    });
    expect(artistReceipts()).toBe(before);
  }, 90_000);
});

describe('quando qualcosa non va', () => {
  it('un servizio di immagini che rifiuta ferma il lavoro col suo motivo; colori e consigli restano, nessuna riserva', async () => {
    const { film } = await filmWithShot(artistFails.client);

    await artistFails.client.call('POST', `/projects/${film.id}/moodboard/generate`, {});
    const done = await untilDone(artistFails, film.id);

    expect(done.run).toMatchObject({ status: 'failed', errorCode: 'content_rejected', images: 0 });
    expect(done.moodboard.film.palette.length).toBeGreaterThan(0);
    expect(done.moodboard.film.references).toEqual([]);
    // Il testo e una sola chiamata di immagine: l'altro prompt non si prova, e nemmeno un altro servizio.
    const artist = artistFails.receipts
      .list()
      .filter((receipt) => receipt.role === 'moodboard_artist');
    expect(artist).toHaveLength(1);
    expect(artist[0]?.status).toBe('failed');
  }, 90_000);

  it('se il testo non si scrive niente cambia: errore col suo codice, nessuna richiesta lasciata aperta', async () => {
    const { film } = await filmWithShot(designerFails.client);
    const path = `/projects/${film.id}/moodboard`;
    await designerFails.client.call('PUT', path, { palette: [{ hex: '#111111' }], notes: 'Miei.' });

    const reply = failure(await designerFails.client.call('POST', `${path}/generate`, {}));

    expect(reply).toMatchObject({ status: 502, code: 'provider_unavailable' });
    const after = await read(designerFails, film.id);
    expect(after.moodboard.film).toMatchObject({ palette: [{ hex: '#111111' }], notes: 'Miei.' });
    expect(after.run?.status).toBe('failed');
    // Chiusa la richiesta, se ne può fare un'altra.
    expect((await designerFails.client.call('POST', `${path}/generate`, {})).status).not.toBe(409);
  }, 90_000);
});

describe('togliere un’immagine', () => {
  it('si toglie dal moodboard; una che non c’è dà «non trovato»', async () => {
    const { film } = await filmWithShot(normal.client);
    await normal.client.call('POST', `/projects/${film.id}/moodboard/generate`, {});
    const done = await untilDone(normal, film.id);
    const first = done.moodboard.film.references[0];
    expect(first).toBeDefined();

    const removed = await normal.client.call(
      'DELETE',
      `/projects/${film.id}/moodboard/references/${first?.id ?? ''}`,
    );
    expect(removed.status).toBe(200);
    expect(moodboardViewSchema.parse(removed.body).moodboard.film.references).toHaveLength(1);
    const again = failure(
      await normal.client.call(
        'DELETE',
        `/projects/${film.id}/moodboard/references/${first?.id ?? ''}`,
      ),
    );
    expect(again.status).toBe(404);
    const missing = failure(
      await normal.client.call('DELETE', `/projects/${film.id}/moodboard/references/non-esiste`),
    );
    expect(missing).toMatchObject({ status: 404, code: 'not_found' });
  }, 90_000);
});
