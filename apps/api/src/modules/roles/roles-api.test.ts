import {
  domainErrorSchema,
  roleChangeResultSchema,
  rolesOverviewSchema,
  type RoleState,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
});

afterAll(async () => {
  await app.close();
});

async function role(roleId: string): Promise<RoleState> {
  const reply = await client.call('GET', '/roles');
  expect(reply.status).toBe(200);
  const found = rolesOverviewSchema
    .parse(reply.body)
    .roles.find((candidate) => candidate.roleId === roleId);
  if (found === undefined) throw new Error(`manca il ruolo ${roleId}`);
  return found;
}

describe('chi fa cosa (T2.7)', () => {
  it('ogni ruolo dice quale servizio lavora, e quali altri si potrebbero scegliere', async () => {
    const moderator = await role('moderator');

    expect(moderator).toMatchObject({
      label: 'Moderatore',
      kind: 'llm',
      group: 'text',
      enabled: true,
      inUse: { connectionId: 'anthropic', connectionLabel: 'Anthropic', modelId: 'claude-haiku' },
    });
    expect(moderator.chosenModelId).toBeUndefined();
    expect(moderator.providers).toEqual([
      {
        connectionId: 'anthropic',
        label: 'Anthropic',
        services: expect.arrayContaining([
          { modelId: 'claude-sonnet', label: 'Claude Sonnet' },
          { modelId: 'claude-haiku', label: expect.any(String) as string },
        ]) as unknown[],
      },
    ]);
  });

  it('un ruolo con candidati dice quello che userebbe, e le alternative sono solo del suo tipo', async () => {
    const operator = await role('camera_operator');

    expect(operator.inUse?.modelId).toBe('kling-o3-standard');
    expect(operator.providers.flatMap((p) => p.services.map((s) => s.modelId))).toContain(
      'seedance-2',
    );
    expect(operator.providers.flatMap((p) => p.services.map((s) => s.modelId))).not.toContain(
      'claude-sonnet',
    );
  });

  it('un ruolo spento lo dice col suo motivo, e non ha un servizio', async () => {
    const composer = await role('composer');

    expect(composer).toMatchObject({ enabled: false, problem: 'role_disabled' });
    expect(composer.inUse).toBeUndefined();
  });

  it('dice anche la versione delle istruzioni in uso', async () => {
    expect((await role('moderator')).instructions).toEqual({
      label: 'Versione 1',
      recommended: true,
      newerAvailable: false,
    });
  });

  it("la creatività non c'è dove il servizio non la accetta (D42)", async () => {
    expect((await role('moderator')).temperature).toBeUndefined();
  });

  describe('cambiare servizio', () => {
    it("la scelta vale subito e si vede come scelta dell'utente", async () => {
      const reply = await client.call('PUT', '/roles/moderator/service', {
        modelId: 'claude-sonnet',
      });
      const result = roleChangeResultSchema.parse(reply.body);
      const moderator = result.overview.roles.find((r) => r.roleId === 'moderator');

      expect(reply.status).toBe(200);
      expect(result.discarded).toEqual([]);
      expect(moderator).toMatchObject({
        chosenModelId: 'claude-sonnet',
        inUse: { modelId: 'claude-sonnet' },
      });
      // Gli altri ruoli non si sono mossi.
      expect(
        result.overview.roles.find((r) => r.roleId === 'screenwriter')?.chosenModelId,
      ).toBeUndefined();
    });

    it("un servizio di un altro tipo, o che non c'è, è rifiutato senza cambiare niente", async () => {
      const wrongKind = await client.call('PUT', '/roles/moderator/service', {
        modelId: 'kling-o3-standard',
      });
      expect(wrongKind.status).toBe(409);
      expect(domainErrorSchema.parse(wrongKind.body)).toMatchObject({
        code: 'no_eligible_model',
        details: { role: 'moderator', modelId: 'kling-o3-standard' },
      });

      expect(
        (await client.call('PUT', '/roles/moderator/service', { modelId: 'inventato' })).status,
      ).toBe(409);
      expect((await role('moderator')).chosenModelId).toBe('claude-sonnet');
    });

    it("un ruolo che non c'è è 404", async () => {
      expect((await client.call('PUT', '/roles/inventato/service', { modelId: null })).status).toBe(
        404,
      );
      expect(
        (await client.call('PUT', '/roles/inventato/temperature', { value: null })).status,
      ).toBe(404);
    });

    it('con null si torna al servizio della release', async () => {
      await client.call('PUT', '/roles/moderator/service', { modelId: null });
      const moderator = await role('moderator');

      expect(moderator.chosenModelId).toBeUndefined();
      expect(moderator.inUse?.modelId).toBe('claude-haiku');
    });
  });

  it('il fornitore predefinito del gruppo vale per i ruoli, e quello scelto per il ruolo vince', async () => {
    await client.call('PUT', '/connections/anthropic/default-service', {
      modelId: 'claude-sonnet',
    });
    await client.call('PUT', '/groups/text/default', { connectionId: 'anthropic' });

    // Il moderatore della release usa Haiku: il predefinito del gruppo (Sonnet) vince su di lui.
    expect((await role('moderator')).inUse?.modelId).toBe('claude-sonnet');

    await client.call('PUT', '/roles/moderator/service', { modelId: 'claude-haiku' });
    expect((await role('moderator')).inUse?.modelId).toBe('claude-haiku');
    expect((await role('screenwriter')).inUse?.modelId).toBe('claude-sonnet');
  });

  it('una creatività su un servizio che non la accetta è rifiutata', async () => {
    const reply = await client.call('PUT', '/roles/moderator/temperature', { value: 0.5 });

    expect(reply.status).toBe(400);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('value');
    // Tornare al valore del programma, invece, va sempre bene.
    expect((await client.call('PUT', '/roles/moderator/temperature', { value: null })).status).toBe(
      200,
    );
  });
});
