import {
  domainErrorSchema,
  draftTestEstimateSchema,
  draftTestResultSchema,
  testableRolesSchema,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { RECEIPT_STORE } from './tokens.js';

let app: NestExpressApplication;
let client: Client;
let receipts: ReceiptStore;

beforeAll(async () => {
  ({ app, client } = await startApp());
  receipts = app.get<ReceiptStore>(RECEIPT_STORE);
});

afterAll(async () => {
  await app.close();
});

/** Cambia un campo di un ruolo nella bozza, come farebbe l'editor delle impostazioni avanzate. */
async function changeDraftRole(roleId: string, change: Record<string, unknown>): Promise<void> {
  const { config } = await client.draft();
  const role = config.roles[roleId];
  if (role === undefined) throw new Error(`il seme non ha il ruolo ${roleId}`);
  const reply = await client.call('PUT', '/troupe/draft', {
    config: { ...config, roles: { ...config.roles, [roleId]: { ...role, ...change } } },
  });
  expect(reply.status).toBe(200);
}

describe('prova della bozza (T2.5)', () => {
  it('si provano i ruoli di testo accesi, non quelli di immagini e video', async () => {
    const reply = await client.call('GET', '/troupe/test/roles');
    const ids = testableRolesSchema.parse(reply.body).roles.map((role) => role.roleId);

    expect(ids).toContain('cinematographer');
    expect(ids).toContain('screenwriter');
    expect(ids).not.toContain('camera_operator');
  });

  it('la stima dice servizio e costo, e non lascia nessuno scontrino', async () => {
    const reply = await client.call('POST', '/troupe/test/cinematographer/estimate');
    const { estimate, example } = draftTestEstimateSchema.parse(reply.body);

    expect(reply.status).toBe(200);
    expect(estimate).toMatchObject({ modelId: 'claude-sonnet', modelLabel: 'Claude Sonnet' });
    expect(estimate.estimatedCostUsd).toBeGreaterThan(0);
    expect(example).toMatchObject({ shot: expect.anything() as unknown });
    expect(receipts.list({ purpose: 'draft_test' })).toEqual([]);
  });

  it('la prova dà risultato, costo e uno scontrino draft_test che resta nel database', async () => {
    const reply = await client.call('POST', '/troupe/test/cinematographer/run');
    const result = draftTestResultSchema.parse(reply.body);

    expect(reply.status).toBe(200);
    expect(result.output).toMatchObject({
      prompt: expect.stringContaining('town square') as unknown,
    });
    expect(result.receipt).toMatchObject({
      purpose: 'draft_test',
      role: 'cinematographer',
      status: 'succeeded',
      releaseId: 'bozza',
    });
    expect(result.receipt.actualCostUsd).toBeGreaterThan(0);
    expect(receipts.get(result.receipt.id)).toEqual(result.receipt);
  });

  it('prova la bozza, non la release: il servizio cambiato si vede prima di pubblicare', async () => {
    const before = (await client.draft()).activeRelease?.id;
    await changeDraftRole('cinematographer', { model: 'claude-haiku' });

    const estimate = draftTestEstimateSchema.parse(
      (await client.call('POST', '/troupe/test/cinematographer/estimate')).body,
    );
    const result = draftTestResultSchema.parse(
      (await client.call('POST', '/troupe/test/cinematographer/run')).body,
    );

    expect(estimate.estimate.modelId).toBe('claude-haiku');
    expect(result.receipt.modelId).toBe('claude-haiku');
    // La release attiva non si è mossa, e nessuno scontrino è finito fra quelli del prodotto.
    expect((await client.draft()).activeRelease?.id).toBe(before);
    expect(receipts.list({ purpose: 'product' })).toEqual([]);
  });

  it('una bozza che non si può eseguire dà un errore col suo codice, non una schermata vuota', async () => {
    await changeDraftRole('cinematographer', { instructions: 'cinematographer@99' });

    const reply = await client.call('POST', '/troupe/test/cinematographer/run');
    const error = domainErrorSchema.parse(reply.body);

    expect(reply.status).toBe(422);
    expect(error).toMatchObject({
      code: 'config_invalid',
      retryable: false,
      details: { role: 'cinematographer' },
    });
  });

  it("un ruolo che non c'è o non è di testo è 404", async () => {
    expect((await client.call('POST', '/troupe/test/inventato/run')).status).toBe(404);
    expect((await client.call('POST', '/troupe/test/camera_operator/run')).status).toBe(404);
    expect((await client.call('POST', '/troupe/test/camera_operator/estimate')).status).toBe(404);
  });
});
