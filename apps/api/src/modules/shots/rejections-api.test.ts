import {
  shotStoryboardSchema,
  shotTakesSchema,
  type ShotStoryboard,
  type ShotTakes,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Un servizio che **rifiuta il contenuto** (T4.5, D36, regola 6), col server vero, la coda e un
 * fornitore finto che risponde sempre «rifiutato»: il lavoro si ferma col suo motivo, non si spende
 * niente e nessun altro servizio viene provato per aggirare il rifiuto.
 */
const REJECTION = {
  error: { code: 'content_rejected', retryable: false, message: 'il fornitore finto rifiuta' },
};

let app: NestExpressApplication;
let client: Client;
let receipts: ReceiptStore;

beforeAll(async () => {
  ({ app, client } = await startAppWithFixtures({
    camera_operator: REJECTION,
    storyboard_artist: REJECTION,
  }));
  receipts = app.get<ReceiptStore>(RECEIPT_STORE);
}, 60_000);

afterAll(async () => {
  await app.close();
});

async function untilTakes(path: string): Promise<ShotTakes> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);
    if (current.takes.every((take) => take.status === 'succeeded' || take.status === 'failed')) {
      return current;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il take non è arrivato in tempo');
}

async function untilStoryboard(path: string): Promise<ShotStoryboard> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = shotStoryboardSchema.parse(
      (await client.call('GET', `${path}/storyboard`)).body,
    );
    const status = current.attempts[0]?.status;
    if (status === 'succeeded' || status === 'failed') return current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('lo storyboard non è arrivato in tempo');
}

/** Gli scontrini di un ruolo, di un film. */
const receiptsOf = (role: string, projectId: string) =>
  receipts.list().filter((receipt) => receipt.role === role && receipt.projectId === projectId);

/** Quanto contano gli scontrini nella spesa: il costo vero, la stima, tranne per un lavoro fallito (0). */
const costOf = (receipt: ReturnType<ReceiptStore['list']>[number]): number =>
  receipt.actualCostUsd ?? (receipt.status === 'failed' ? 0 : receipt.estimatedCostUsd);

describe('un video rifiutato dal servizio', () => {
  it('il take si ferma col motivo, senza clip e senza costo', async () => {
    const film = await filmWithShot(client);
    const path = `${film.shots}/${film.shot.id}`;

    await client.call('POST', `${path}/takes`, {});
    const { takes } = await untilTakes(path);

    expect(takes).toHaveLength(1);
    expect(takes[0]).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
    expect(takes[0]).not.toHaveProperty('assetId');
    expect(takes[0]).not.toHaveProperty('costUsd');
  }, 30_000);

  it('non registra spesa per il video e non prova nessun altro servizio', async () => {
    const film = await filmWithShot(client);
    const path = `${film.shots}/${film.shot.id}`;

    await client.call('POST', `${path}/takes`, {});
    await untilTakes(path);

    const video = receiptsOf('camera_operator', film.film.id);
    // Un solo scontrino: il servizio scelto. Se se ne fosse provato un altro ce ne sarebbero due.
    expect(video).toHaveLength(1);
    expect(video[0]).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
    expect(video[0]).not.toHaveProperty('actualCostUsd');
    expect(new Set(video.map((receipt) => receipt.modelId)).size).toBe(1);

    // La spesa del film è solo quella del testo del prompt: il video fallito conta zero.
    const others = receipts.list().filter((receipt) => receipt.projectId === film.film.id);
    const withoutVideo = others
      .filter((receipt) => receipt.role !== 'camera_operator')
      .reduce((total, receipt) => total + costOf(receipt), 0);
    expect(receipts.spentOnProject(film.film.id)).toBeCloseTo(withoutVideo, 10);
  }, 30_000);

  it('un nuovo tentativo lo decide l’utente: con lo stesso servizio si rifiuta ancora, e il primo take resta', async () => {
    const film = await filmWithShot(client);
    const path = `${film.shots}/${film.shot.id}`;
    await client.call('POST', `${path}/takes`, {});
    await untilTakes(path);

    await client.call('POST', `${path}/takes`, {});
    const { takes } = await untilTakes(path);

    expect(takes).toHaveLength(2);
    expect(takes.every((take) => take.errorCode === 'content_rejected')).toBe(true);
    expect(receiptsOf('camera_operator', film.film.id)).toHaveLength(2);
  }, 30_000);
});

describe('uno storyboard rifiutato dal servizio', () => {
  it('il tentativo si ferma col motivo, senza immagini, e non si prova un altro servizio', async () => {
    const film = await filmWithShot(client);
    const path = `${film.shots}/${film.shot.id}`;

    await client.call('POST', `${path}/storyboard`, {});
    const storyboard = await untilStoryboard(path);

    expect(storyboard.attempts[0]).toMatchObject({
      status: 'failed',
      errorCode: 'content_rejected',
      assetIds: [],
    });
    const images = receiptsOf('storyboard_artist', film.film.id);
    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({ status: 'failed' });
    expect(images[0]).not.toHaveProperty('actualCostUsd');
    expect(storyboard.chosenAssetId).toBeUndefined();
  }, 30_000);
});

describe('un testo del prompt rifiutato dal servizio', () => {
  it('il take si ferma prima del video: nessuna chiamata a pagamento per il video, nessun altro servizio', async () => {
    const other = await startAppWithFixtures({ cinematographer: REJECTION });
    try {
      const store = other.app.get<ReceiptStore>(RECEIPT_STORE);
      const film = await filmWithShot(other.client);
      const path = `${film.shots}/${film.shot.id}`;

      await other.client.call('POST', `${path}/takes`, {});
      for (let attempt = 0; attempt < 150; attempt += 1) {
        const current = shotTakesSchema.parse(
          (await other.client.call('GET', `${path}/takes`)).body,
        );
        if (current.takes.every((take) => take.status === 'failed')) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const { takes } = shotTakesSchema.parse(
        (await other.client.call('GET', `${path}/takes`)).body,
      );
      expect(takes[0]).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
      const mine = store.list().filter((receipt) => receipt.projectId === film.film.id);
      expect(mine.filter((receipt) => receipt.role === 'camera_operator')).toEqual([]);
      expect(mine.filter((receipt) => receipt.role === 'cinematographer')).toHaveLength(1);
      // Il testo rifiutato non conta nella spesa. (Le altre chiamate del film, scritte prima, sì.)
      const prompt = mine.filter((receipt) => receipt.role === 'cinematographer');
      expect(prompt.map(costOf)).toEqual([0]);
    } finally {
      await other.app.close();
    }
  }, 60_000);
});
