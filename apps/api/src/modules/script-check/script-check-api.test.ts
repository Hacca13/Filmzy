import {
  domainErrorSchema,
  scenePlanSchema,
  scriptCheckEstimateSchema,
  scriptCheckViewSchema,
  shotPlansSchema,
  type ScriptCheckView,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * «Controlla la storia» (T5.2), col server vero e il fornitore finto (nessuna spesa vera): la segretaria
 * di edizione risponde come dicono le fixture, e ciò che dice diventa gialli sulle scene.
 */
interface Running {
  app: NestExpressApplication;
  client: Client;
  receipts: ReceiptStore;
}

let finds: Running;
let fails: Running;

async function running(fixture: unknown): Promise<Running> {
  const { app, client } = await startAppWithFixtures({ script_supervisor: fixture });
  return { app, client, receipts: app.get<ReceiptStore>(RECEIPT_STORE) };
}

beforeAll(async () => {
  finds = await running({
    data: {
      issues: [
        {
          sceneId: 'scene-1',
          code: 'plot',
          severity: 'warning',
          reason: 'Marco parla di una lettera che non ha ancora ricevuto.',
        },
        { code: 'time_place', severity: 'notice', reason: 'Non si capisce quanto tempo passa.' },
        // Un'inquadratura inventata cade sulla sua scena.
        {
          sceneId: 'scene-1',
          shotId: 'inventata',
          code: 'costume',
          severity: 'notice',
          reason: 'Un dubbio sull’abito.',
        },
      ],
    },
  });
  fails = await running({
    error: { code: 'provider_unavailable', retryable: true, message: 'fermo' },
  });
}, 90_000);

afterAll(async () => {
  await Promise.all([finds.app.close(), fails.app.close()]);
});

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

const supervisorCalls = (server: Running) =>
  server.receipts.list().filter((receipt) => receipt.role === 'script_supervisor').length;

async function view(server: Running, film: string): Promise<ScriptCheckView> {
  return scriptCheckViewSchema.parse(
    (await server.client.call('GET', `/projects/${film}/script-check`)).body,
  );
}

describe('prima del controllo', () => {
  it('non c’è niente, e la stima dice quanto costerebbe senza chiamare nessuno', async () => {
    const { film } = await filmWithShot(finds.client);
    const before = supervisorCalls(finds);

    expect(await view(finds, film.id)).toEqual({ state: 'none', issues: [] });
    const estimate = scriptCheckEstimateSchema.parse(
      (await finds.client.call('GET', `/projects/${film.id}/script-check/estimate`)).body,
    );

    expect(estimate.estimate.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect(supervisorCalls(finds)).toBe(before);
  }, 60_000);

  it('senza stesura finale, o senza scene pensate, non c’è niente da controllare', async () => {
    const bare = (
      await finds.client.call('POST', '/projects', {
        idea: 'Un film senza storia ancora.',
        genre: 'drama',
        tone: 'moving',
        style: 'realistic',
        cinematography: 'noir',
        durationS: 60,
      })
    ).body as { id?: string };
    const unplanned = await filmWithFinal(finds.client);
    const before = supervisorCalls(finds);

    const noFinal = failure(
      await finds.client.call('POST', `/projects/${bare.id ?? ''}/script-check`, {}),
    );
    const noShots = failure(
      await finds.client.call('POST', `/projects/${unplanned.film.id}/script-check`, {}),
    );

    expect(noFinal.status).toBeGreaterThanOrEqual(400);
    expect(noShots).toMatchObject({ status: 409, code: 'invalid_request' });
    expect(noShots.details?.field).toBe('shots');
    expect(supervisorCalls(finds)).toBe(before);
  }, 60_000);
});

describe('controllare la storia', () => {
  it('le segnalazioni ingialliscono scene e inquadrature, e ripeterlo sostituisce il controllo di prima', async () => {
    const { film, shots } = await filmWithShot(finds.client);
    const before = supervisorCalls(finds);

    const ran = await finds.client.call('POST', `/projects/${film.id}/script-check`, {});

    expect(ran.status).toBe(201);
    const checked = scriptCheckViewSchema.parse(ran.body);
    expect(checked.state).toBe('current');
    expect(checked.issues).toHaveLength(3);
    expect(checked.issues[0]).toMatchObject({ sceneNumber: 1, light: false });
    // Quella del film intero non ha una scena, ma sta nell'elenco.
    expect(checked.issues[1]).toMatchObject({ light: true });
    expect(checked.issues[1]).not.toHaveProperty('sceneNumber');
    // L'inquadratura inventata è caduta sulla scena.
    expect(checked.issues[2]).toMatchObject({ sceneNumber: 1 });
    expect(checked.issues[2]).not.toHaveProperty('shotNumber');
    expect(supervisorCalls(finds)).toBe(before + 1);

    const scene = shotPlansSchema.parse((await finds.client.call('GET', shots)).body).scenes[0];
    expect(scene?.sceneFlags).toEqual([
      expect.objectContaining({ origin: 'llm', light: false, code: 'plot' }),
      expect.objectContaining({ origin: 'llm', light: true, code: 'costume' }),
    ]);

    // Di nuovo: un controllo solo, l'ultimo.
    const again = scriptCheckViewSchema.parse(
      (await finds.client.call('POST', `/projects/${film.id}/script-check`, {})).body,
    );
    expect(again.issues).toHaveLength(3);
    expect(again.issues[0]?.id).not.toBe(checked.issues[0]?.id);
    expect(supervisorCalls(finds)).toBe(before + 2);
  }, 90_000);

  it('se la storia cambia dopo, il controllo è vecchio: si legge ancora ma non ingiallisce più', async () => {
    const { film, shots } = await filmWithShot(finds.client);
    await finds.client.call('POST', `/projects/${film.id}/script-check`, {});

    // La scena viene ripensata: nuove inquadrature, il controllo non le ha lette.
    const replanned = await finds.client.call('POST', shots, { sceneNumber: 1 });
    expect(scenePlanSchema.parse(replanned.body).sceneFlags).toEqual([]);

    const old = await view(finds, film.id);
    expect(old.state).toBe('outdated');
    expect(old.issues).toHaveLength(3);
    const scene = shotPlansSchema.parse((await finds.client.call('GET', shots)).body).scenes[0];
    expect(scene?.sceneFlags).toEqual([]);

    // Rifatto, torna a valere.
    await finds.client.call('POST', `/projects/${film.id}/script-check`, {});
    expect((await view(finds, film.id)).state).toBe('current');
  }, 90_000);

  it('un doppio clic costa una volta sola', async () => {
    const { film } = await filmWithShot(finds.client);
    const before = supervisorCalls(finds);

    const replies = await Promise.all([
      finds.client.call('POST', `/projects/${film.id}/script-check`, {}),
      finds.client.call('POST', `/projects/${film.id}/script-check`, {}),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual([201, 409]);
    expect(supervisorCalls(finds)).toBe(before + 1);
  }, 60_000);

  it('un limite di spesa si ferma prima di spendere, e con «prosegui» passa', async () => {
    const { film } = await filmWithShot(finds.client);
    const path = `/projects/${film.id}/script-check`;
    await finds.client.call('PUT', '/limits/confirm-above', { usd: 0.0000001 });
    const before = supervisorCalls(finds);

    try {
      const refused = failure(await finds.client.call('POST', path, {}));
      expect(refused).toMatchObject({ status: 409, code: 'spend_cap_reached' });
      expect(supervisorCalls(finds)).toBe(before);
      expect((await view(finds, film.id)).state).toBe('none');

      const confirmed = await finds.client.call('POST', path, { spendConfirmed: true });
      expect(confirmed.status).toBe(201);
    } finally {
      await finds.client.call('PUT', '/limits/confirm-above', { usd: null });
    }
  }, 60_000);
});

describe('quando qualcosa non va', () => {
  it('un servizio che non risponde dà il suo errore, non salva niente e non blocca il film', async () => {
    const { film } = await filmWithShot(fails.client);
    const path = `/projects/${film.id}/script-check`;

    const reply = failure(await fails.client.call('POST', path, {}));

    expect(reply).toMatchObject({ status: 502, code: 'provider_unavailable' });
    expect((await view(fails, film.id)).state).toBe('none');
    // La richiesta si è chiusa: se ne può fare un'altra.
    expect((await fails.client.call('POST', path, {})).status).not.toBe(409);
    // Una chiamata fallita ha comunque il suo scontrino (regola 4).
    const receipts = fails.receipts
      .list()
      .filter((receipt) => receipt.role === 'script_supervisor');
    expect(receipts.length).toBeGreaterThan(0);
    expect(receipts.every((receipt) => receipt.status === 'failed')).toBe(true);
  }, 90_000);
});
