import {
  configDiffSchema,
  domainErrorSchema,
  draftViewSchema,
  publishResponseSchema,
  releaseListSchema,
  type ReleaseList,
} from '@filmzy/contracts';
import type { ConfigSource } from '@filmzy/troupe';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { CONFIG_SOURCE } from './tokens.js';

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
});

afterAll(async () => {
  await app.close();
});

async function history(): Promise<ReleaseList['releases']> {
  return releaseListSchema.parse((await client.call('GET', '/troupe/releases')).body).releases;
}

async function diff(route: string) {
  return configDiffSchema.parse((await client.call('GET', route)).body).changes;
}

/** Cambia il servizio di un ruolo nella bozza, come farebbe l'editor, e la salva. */
async function setDraftModel(roleId: string, model: string): Promise<void> {
  const { config } = await client.draft();
  const role = config.roles[roleId];
  if (role === undefined) throw new Error(`il seme non ha il ruolo ${roleId}`);
  const reply = await client.call('PUT', '/troupe/draft', {
    config: { ...config, roles: { ...config.roles, [roleId]: { ...role, model } } },
  });
  expect(reply.status).toBe(200);
}

async function publish(note: string): Promise<void> {
  const reply = await client.call('POST', '/troupe/publish', { note });
  expect(publishResponseSchema.parse(reply.body).release).toBeDefined();
}

async function activeModel(roleId: string): Promise<string | undefined> {
  const loaded = await app.get<ConfigSource>(CONFIG_SOURCE).load();
  return loaded.config?.roles[roleId]?.model;
}

describe('differenze, storico e ripristino (T2.6)', () => {
  it("all'inizio c'è una sola versione, la prima, ed è quella attiva", async () => {
    const releases = await history();

    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({ number: 1, isActive: true, author: 'programma' });
    expect(await diff('/troupe/draft/diff')).toEqual([]);
  });

  it('la bozza modificata dice cosa cambierebbe pubblicandola', async () => {
    await setDraftModel('screenwriter', 'claude-haiku');

    expect(await diff('/troupe/draft/diff')).toEqual([
      {
        section: 'roles',
        key: 'screenwriter',
        label: 'Sceneggiatore',
        kind: 'changed',
        fields: ['model'],
      },
    ]);
  });

  it('pubblicare dà la versione 2, la prima non è più attiva e non ci sono più differenze', async () => {
    await publish('Sceneggiatore più veloce');

    const releases = await history();
    expect(releases.map((release) => [release.number, release.isActive])).toEqual([
      [2, true],
      [1, false],
    ]);
    expect(releases[0]?.note).toBe('Sceneggiatore più veloce');
    expect(await diff('/troupe/draft/diff')).toEqual([]);
  });

  it("di una versione vecchia si vede cosa tornerebbe com'era", async () => {
    const first = (await history()).find((release) => release.number === 1);

    const changes = await diff(`/troupe/releases/${first?.id ?? ''}/diff`);

    expect(changes.map((change) => [change.section, change.key, change.fields])).toEqual([
      ['roles', 'screenwriter', ['model']],
    ]);
  });

  it('ripristinare riporta la configurazione di prima, come versione nuova, in meno di un minuto', async () => {
    const first = (await history()).find((release) => release.number === 1);
    expect(await activeModel('screenwriter')).toBe('claude-haiku');

    const started = Date.now();
    const reply = await client.call('POST', `/troupe/releases/${first?.id ?? ''}/restore`, {
      note: 'Ripristino della versione 1',
    });
    const elapsedMs = Date.now() - started;

    const result = publishResponseSchema.parse(reply.body);
    expect(result.release).toMatchObject({ number: 3, note: 'Ripristino della versione 1' });
    expect(elapsedMs).toBeLessThan(60_000);
    expect(await activeModel('screenwriter')).toBe('claude-sonnet');

    // Lo storico resta lineare: niente è sparito, la 2 c'è ancora e la 3 è quella attiva.
    expect((await history()).map((release) => [release.number, release.isActive])).toEqual([
      [3, true],
      [2, false],
      [1, false],
    ]);
  });

  it('la bozza senza modifiche segue il ripristino', async () => {
    const draft = draftViewSchema.parse((await client.call('GET', '/troupe/draft')).body);

    expect(draft.config.roles.screenwriter?.model).toBe('claude-sonnet');
    expect(draft.hasUnpublishedChanges).toBe(false);
  });

  it("una bozza con modifiche non pubblicate resta com'è: un ripristino non butta via il lavoro", async () => {
    await setDraftModel('cinematographer', 'claude-haiku');
    const second = (await history()).find((release) => release.number === 2);

    const reply = await client.call('POST', `/troupe/releases/${second?.id ?? ''}/restore`, {
      note: 'Ripristino della versione 2',
    });

    expect(publishResponseSchema.parse(reply.body).release?.number).toBe(4);
    const draft = draftViewSchema.parse((await client.call('GET', '/troupe/draft')).body);
    expect(draft.config.roles.cinematographer?.model).toBe('claude-haiku');
    expect(draft.hasUnpublishedChanges).toBe(true);
  });

  it("serve una nota, e una versione che non c'è è 404", async () => {
    const some = (await history())[0];

    const noNote = await client.call('POST', `/troupe/releases/${some?.id ?? ''}/restore`, {});
    expect(noNote.status).toBe(400);
    expect(domainErrorSchema.parse(noNote.body).details?.field).toBe('note');

    expect(
      (await client.call('POST', '/troupe/releases/inventata/restore', { note: 'x' })).status,
    ).toBe(404);
    expect((await client.call('GET', '/troupe/releases/inventata/diff')).status).toBe(404);
  });
});
