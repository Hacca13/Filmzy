import {
  connectionsOverviewSchema,
  connectionTestResultSchema,
  domainErrorSchema,
  type GroupState,
  type ModelGroup,
  type ProviderState,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { fakeCipher, startApp, type Client } from '../../test-support/app-client.js';

/**
 * Senza `TROUPE_ENV`: le connessioni sono quelle vere del seme (fal, Anthropic…) con le loro chiavi.
 * Le chiavi arrivano da variabili d'ambiente finte, che nessuno chiama (regola 5: nei test niente
 * rete), e si tolgono a metà per provare cosa succede senza.
 */
const KEYS = { ANTHROPIC_API_KEY: 'chiave-finta-anthropic', FAL_KEY: 'chiave-finta-fal' };
const previous = Object.fromEntries(Object.keys(KEYS).map((name) => [name, process.env[name]]));

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  Object.assign(process.env, KEYS);
  ({ app, client } = await startApp(fakeCipher, 'none'));
});

afterAll(async () => {
  await app.close();
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) Reflect.deleteProperty(process.env, name);
    else process.env[name] = value;
  }
});

async function overview() {
  const reply = await client.call('GET', '/connections');
  expect(reply.status).toBe(200);
  return connectionsOverviewSchema.parse(reply.body);
}

function group(state: { groups: GroupState[] }, name: ModelGroup): GroupState {
  const found = state.groups.find((candidate) => candidate.group === name);
  if (found === undefined) throw new Error(`manca il gruppo ${name}`);
  return found;
}

function provider(state: { groups: GroupState[] }, name: ModelGroup, id: string): ProviderState {
  const found = group(state, name).providers.find((candidate) => candidate.connectionId === id);
  if (found === undefined) throw new Error(`manca il fornitore ${id} nel gruppo ${name}`);
  return found;
}

async function put(route: string, body: unknown) {
  return client.call('PUT', route, body);
}

function errorOf(reply: { body: unknown }) {
  return domainErrorSchema.parse(reply.body);
}

describe('fornitori e servizi (T2.7)', () => {
  it('senza scelte salvate vale la release: servizi attivi, nessun predefinito, nome del fornitore', async () => {
    const state = await overview();
    const fal = provider(state, 'video', 'fal');

    expect(state.hasChoices).toBe(false);
    expect(fal).toMatchObject({
      label: 'fal.ai',
      enabled: true,
      keyRequired: true,
      key: { name: 'FAL_KEY', present: true, foundIn: 'env' },
      keyWritable: true,
      canTest: true,
    });
    expect(fal.services.every((service) => service.enabled && service.usable)).toBe(true);
    expect(group(state, 'video').defaultModelId).toBeUndefined();
  });

  it('ogni fornitore sta nei gruppi dei suoi servizi, e «Lettura immagini» ha solo quelli che leggono', async () => {
    const state = await overview();

    expect(provider(state, 'text', 'anthropic').services.length).toBeGreaterThan(0);
    expect(provider(state, 'image', 'fal').services.every((s) => s.kind === 'image')).toBe(true);
    expect(provider(state, 'vision', 'anthropic').services.every((s) => s.vision)).toBe(true);
    expect(group(state, 'vision').providers.map((p) => p.connectionId)).toEqual(['anthropic']);
  });

  it('dice quali ruoli usano un fornitore', async () => {
    const used = provider(await overview(), 'video', 'fal').usedBy.map((role) => role.roleId);

    expect(used).toContain('camera_operator');
  });

  it('un fornitore spento nella release si vede, ma i suoi servizi non si possono usare', async () => {
    const elevenlabs = provider(await overview(), 'audio', 'elevenlabs');

    expect(elevenlabs.enabled).toBe(false);
    expect(elevenlabs.services[0]).toMatchObject({
      usable: false,
      unusableReason: 'connection_disabled',
    });
    expect(elevenlabs.canTest).toBe(false);
  });

  it('attivarne uno spento è rifiutato, e non salva niente', async () => {
    const reply = await put('/connections/elevenlabs/services', { modelIds: ['music-elevenlabs'] });

    expect(reply.status).toBe(400);
    expect(errorOf(reply).code).toBe('invalid_request');
    expect((await overview()).hasChoices).toBe(false);
  });

  it('un servizio che non è del fornitore è rifiutato', async () => {
    const reply = await put('/connections/fal/services', { modelIds: ['claude-sonnet'] });

    expect(reply.status).toBe(400);
    expect(errorOf(reply).details?.field).toBe('modelIds');
  });

  it("spegnere un servizio lo spegne solo lui, e da lì le scelte sono dell'utente", async () => {
    const before = provider(await overview(), 'video', 'fal').services.map((s) => s.modelId);
    const keep = before.filter((id) => id !== 'seedance-2');

    const reply = await put('/connections/fal/services', { modelIds: keep });
    const state = connectionsOverviewSchema.parse(reply.body);

    expect(reply.status).toBe(200);
    expect(state.hasChoices).toBe(true);
    const services = provider(state, 'video', 'fal').services;
    expect(services.find((s) => s.modelId === 'seedance-2')?.enabled).toBe(false);
    expect(services.filter((s) => s.modelId !== 'seedance-2').every((s) => s.enabled)).toBe(true);
    // Gli altri fornitori non si sono mossi: la prima scelta non ha spento niente.
    expect(provider(state, 'text', 'anthropic').services.every((s) => s.enabled)).toBe(true);
  });

  it("il predefinito del fornitore dev'essere un servizio attivato, suo", async () => {
    const off = await put('/connections/fal/default-service', { modelId: 'seedance-2' });
    expect(off.status).toBe(409);
    expect(errorOf(off).code).toBe('no_eligible_model');

    const foreign = await put('/connections/fal/default-service', { modelId: 'claude-sonnet' });
    expect(foreign.status).toBe(400);

    const ok = await put('/connections/fal/default-service', { modelId: 'kling-o3-standard' });
    expect(
      provider(connectionsOverviewSchema.parse(ok.body), 'video', 'fal').services.find(
        (s) => s.modelId === 'kling-o3-standard',
      )?.isProviderDefault,
    ).toBe(true);
  });

  it('il fornitore predefinito del gruppo parte dal suo servizio predefinito', async () => {
    const reply = await put('/groups/video/default', { connectionId: 'fal' });
    const video = group(connectionsOverviewSchema.parse(reply.body), 'video');

    expect(video).toMatchObject({
      defaultConnectionId: 'fal',
      defaultModelId: 'kling-o3-standard',
    });
  });

  it('un gruppo che non esiste è 404, un fornitore senza servizi attivati lì è 409', async () => {
    expect((await put('/groups/inventato/default', { connectionId: 'fal' })).status).toBe(404);

    const reply = await put('/groups/video/default', { connectionId: 'anthropic' });
    expect(reply.status).toBe(409);
    expect(errorOf(reply).code).toBe('no_eligible_model');
  });

  it('spegnere il servizio predefinito toglie anche i predefiniti che puntavano a lui', async () => {
    const all = provider(await overview(), 'video', 'fal').services.map((s) => s.modelId);

    const reply = await put('/connections/fal/services', {
      modelIds: all.filter((id) => id !== 'kling-o3-standard' && id !== 'seedance-2'),
    });
    const state = connectionsOverviewSchema.parse(reply.body);

    expect(group(state, 'video').defaultModelId).toBeUndefined();
    expect(provider(state, 'video', 'fal').services.some((s) => s.isProviderDefault)).toBe(false);
  });

  it('il limite di spesa mensile si mette e si toglie; nessuno è preimpostato', async () => {
    expect(provider(await overview(), 'video', 'fal').monthlyCapUsd).toBeUndefined();

    const set = await put('/connections/fal/monthly-cap', { usd: 25 });
    expect(provider(connectionsOverviewSchema.parse(set.body), 'video', 'fal').monthlyCapUsd).toBe(
      25,
    );

    const cleared = await put('/connections/fal/monthly-cap', { usd: null });
    expect(
      provider(connectionsOverviewSchema.parse(cleared.body), 'video', 'fal').monthlyCapUsd,
    ).toBeUndefined();

    expect((await put('/connections/fal/monthly-cap', { usd: -1 })).status).toBe(400);
    expect((await put('/connections/inventata/monthly-cap', { usd: 5 })).status).toBe(404);
  });

  describe('senza la chiave', () => {
    it('i servizi restano scelti ma si segnano come non utilizzabili, e attivarne uno dà secret_missing', async () => {
      Reflect.deleteProperty(process.env, 'FAL_KEY');

      const fal = provider(await overview(), 'video', 'fal');
      expect(fal.key).toMatchObject({ name: 'FAL_KEY', present: false });
      expect(fal.services.find((s) => s.modelId === 'kling-o3-standard')).toMatchObject({
        enabled: false,
        usable: false,
        unusableReason: 'key_missing',
      });

      const reply = await put('/connections/fal/services', {
        modelIds: [
          ...fal.services.filter((s) => s.enabled).map((s) => s.modelId),
          'kling-o3-standard',
        ],
      });
      expect(reply.status).toBe(409);
      expect(errorOf(reply)).toMatchObject({
        code: 'secret_missing',
        details: { connectionId: 'fal' },
      });
    });

    it("una chiave scritta dal programma vale come la variabile d'ambiente (D50), e non si rilegge", async () => {
      const value = 'chiave-vera-scritta-dal-programma';
      const written = await client.call('PUT', '/secrets/FAL_KEY', { value });
      expect(written.status).toBe(200);

      const state = await overview();
      expect(provider(state, 'video', 'fal').key).toMatchObject({
        present: true,
        foundIn: 'stored',
      });
      expect(JSON.stringify(state)).not.toContain(value);

      const fal = provider(state, 'video', 'fal');
      const reply = await put('/connections/fal/services', {
        modelIds: [
          ...fal.services.filter((s) => s.enabled).map((s) => s.modelId),
          'kling-o3-standard',
        ],
      });
      expect(reply.status).toBe(200);
      expect(JSON.stringify(reply.body)).not.toContain(value);
    });
  });

  it("provare un fornitore che non c'è è 404", async () => {
    expect((await client.call('POST', '/connections/inventata/test')).status).toBe(404);
  });
});

describe('prova della connessione con il fornitore finto', () => {
  let offline: NestExpressApplication;
  let offlineClient: Client;

  beforeAll(async () => {
    ({ app: offline, client: offlineClient } = await startApp());
  });

  afterAll(async () => {
    await offline.close();
  });

  it('risponde senza chiave e senza rete', async () => {
    const reply = await offlineClient.call('POST', '/connections/fal/test');

    expect(reply.status).toBe(200);
    expect(connectionTestResultSchema.parse(reply.body)).toEqual({ ok: true });
  });

  it('con il fornitore finto nessuna chiave è richiesta e tutto è utilizzabile', async () => {
    const reply = await offlineClient.call('GET', '/connections');
    const state = connectionsOverviewSchema.parse(reply.body);
    const fal = provider(state, 'video', 'fal');

    expect(fal.keyRequired).toBe(false);
    expect(fal.key).toBeUndefined();
    expect(fal.services.every((service) => service.usable)).toBe(true);
  });
});
