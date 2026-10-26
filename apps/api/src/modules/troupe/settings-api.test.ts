import { readFile } from 'node:fs/promises';

import {
  appPreferencesSchema,
  domainErrorSchema,
  draftViewSchema,
  publishResponseSchema,
  secretsViewSchema,
  updateCheckResultSchema,
} from '@filmzy/contracts';
import { secretsFile } from '@filmzy/db';
import type { ConfigSource } from '@filmzy/troupe';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { fakeCipher, startApp, type Client, type Reply } from '../../test-support/app-client.js';
import { CONFIG_SOURCE } from './tokens.js';

function errorCode(reply: Reply): string {
  return domainErrorSchema.parse(reply.body).code;
}

describe('impostazioni avanzate (T2.3)', () => {
  let app: NestExpressApplication;
  let dataDir: string;
  let client: Client;

  beforeAll(async () => {
    ({ app, dataDir, client } = await startApp(fakeCipher));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await client.call('DELETE', '/troupe/draft');
  });

  describe('bozza e pubblicazione', () => {
    it('senza bozza si parte dalla release attiva, pubblicata dal programma al primo avvio', async () => {
      const view = await client.draft();

      expect(view.hasDraft).toBe(false);
      expect(view.hasUnpublishedChanges).toBe(false);
      expect(view.activeRelease?.author).toBe('programma');
      expect(view.config.roles.screenwriter?.model).toBe('claude-sonnet');
    });

    it('cambio il modello dello sceneggiatore, pubblico, e il ruolo usa subito quello nuovo', async () => {
      const { config } = await client.draft();
      const screenwriter = config.roles.screenwriter;
      if (screenwriter === undefined) throw new Error('il seme non ha lo sceneggiatore');

      const saved = await client.call('PUT', '/troupe/draft', {
        config: {
          ...config,
          roles: { ...config.roles, screenwriter: { ...screenwriter, model: 'claude-haiku' } },
        },
      });
      const view = draftViewSchema.parse(saved.body);
      expect(saved.status).toBe(200);
      expect(view.hasDraft).toBe(true);
      expect(view.hasUnpublishedChanges).toBe(true);
      expect(view.issues.filter((issue) => issue.severity === 'error')).toEqual([]);

      const published = await client.call('POST', '/troupe/publish', {
        note: 'Sceneggiatore più veloce',
      });
      const result = publishResponseSchema.parse(published.body);
      expect(result.release?.note).toBe('Sceneggiatore più veloce');
      expect(result.release?.author).toBe('utente');

      expect((await client.draft()).hasUnpublishedChanges).toBe(false);
      // Senza riavviare niente: la prossima lettura della configurazione vede la release nuova.
      const loaded = await app.get<ConfigSource>(CONFIG_SOURCE).load();
      expect(loaded.config?.roles.screenwriter?.model).toBe('claude-haiku');
    });

    it('una bozza con un riferimento rotto si salva coi problemi, ma non si pubblica', async () => {
      const { config, activeRelease } = await client.draft();
      const moderator = config.roles.moderator;
      if (moderator === undefined) throw new Error('il seme non ha il moderatore');

      const saved = await client.call('PUT', '/troupe/draft', {
        config: {
          ...config,
          roles: { ...config.roles, moderator: { ...moderator, model: 'servizio-inventato' } },
        },
      });
      expect(saved.status).toBe(200);
      expect(
        draftViewSchema.parse(saved.body).issues.some((issue) => issue.code === 'unknown_model'),
      ).toBe(true);

      const published = publishResponseSchema.parse(
        (await client.call('POST', '/troupe/publish', { note: 'rotta' })).body,
      );
      expect(published.release).toBeUndefined();
      expect(published.issues.some((issue) => issue.severity === 'error')).toBe(true);
      expect((await client.draft()).activeRelease?.id).toBe(activeRelease?.id);
    });

    it('la nota è obbligatoria', async () => {
      const reply = await client.call('POST', '/troupe/publish', { note: '   ' });

      expect(reply.status).toBe(400);
      expect(errorCode(reply)).toBe('invalid_request');
      expect(domainErrorSchema.parse(reply.body).details?.field).toBe('note');
    });

    it('una bozza con la forma sbagliata non entra', async () => {
      const reply = await client.call('PUT', '/troupe/draft', { config: { connections: 12 } });

      expect(reply.status).toBe(400);
      expect(errorCode(reply)).toBe('invalid_request');
    });

    it('«Butta via le modifiche» riporta alla release attiva', async () => {
      const { config } = await client.draft();
      await client.call('PUT', '/troupe/draft', {
        config: { ...config, limits: { max_characters: 9 } },
      });
      expect((await client.draft()).hasUnpublishedChanges).toBe(true);

      const view = draftViewSchema.parse((await client.call('DELETE', '/troupe/draft')).body);

      expect(view.hasDraft).toBe(false);
      expect(view.config.limits.max_characters).toBe(config.limits.max_characters);
    });

    it('«Riparti dai valori del programma» mette il seme nella bozza, senza pubblicare', async () => {
      const reply = await client.call('POST', '/troupe/draft/reset');
      const view = draftViewSchema.parse(reply.body);

      expect(reply.status).toBe(200);
      expect(view.hasDraft).toBe(true);
      expect(view.config.roles.screenwriter?.model).toBe('claude-sonnet');
    });
  });

  describe('chiavi', () => {
    async function addConnectionWithSecret(): Promise<void> {
      const { config } = await client.draft();
      await client.call('PUT', '/troupe/draft', {
        config: {
          ...config,
          connections: {
            ...config.connections,
            prova: {
              adapter: 'fake',
              api_key: 'secret:MIA_CHIAVE',
              timeout_s: 30,
              max_concurrency: 1,
              enabled: true,
            },
          },
        },
      });
    }

    it('dice quali chiavi servono e se ci sono, mai il valore', async () => {
      await addConnectionWithSecret();

      const reply = await client.call('GET', '/secrets');
      const view = secretsViewSchema.parse(reply.body);

      expect(view.writable).toBe(true);
      expect(view.secrets).toContainEqual({
        name: 'MIA_CHIAVE',
        source: 'secret',
        present: false,
        connectionIds: ['prova'],
      });
      expect(view.secrets.some((secret) => secret.source === 'env')).toBe(true);
    });

    it('una chiave si scrive e si cancella, senza mai rileggerla', async () => {
      await addConnectionWithSecret();
      const value = 'valore-segreto-1234567890';

      const written = await client.call('PUT', '/secrets/MIA_CHIAVE', { value });
      expect(written.status).toBe(200);
      expect(
        secretsViewSchema.parse(written.body).secrets.find((s) => s.name === 'MIA_CHIAVE')?.present,
      ).toBe(true);

      // Il valore non sta in nessuna risposta, né in chiaro sul disco (D25).
      const others = [
        written,
        await client.call('GET', '/secrets'),
        await client.call('GET', '/troupe/draft'),
      ];
      for (const reply of others) expect(reply.text).not.toContain(value);
      expect(await readFile(secretsFile(dataDir), 'utf8')).not.toContain(value);

      const removed = await client.call('DELETE', '/secrets/MIA_CHIAVE');
      expect(
        secretsViewSchema.parse(removed.body).secrets.find((s) => s.name === 'MIA_CHIAVE')?.present,
      ).toBe(false);
    });

    it('rifiuta un nome che non è un nome di chiave, senza rimandare indietro il valore', async () => {
      const reply = await client.call('PUT', '/secrets/nome-sbagliato', {
        value: 'qualcosa-di-segreto',
      });

      expect(reply.status).toBe(400);
      expect(domainErrorSchema.parse(reply.body).details?.field).toBe('name');
      expect(reply.text).not.toContain('qualcosa-di-segreto');
    });

    it('rifiuta una chiave vuota', async () => {
      const reply = await client.call('PUT', '/secrets/MIA_CHIAVE', { value: '  ' });

      expect(reply.status).toBe(400);
      expect(errorCode(reply)).toBe('invalid_request');
    });
  });

  describe('preferenze e aggiornamenti', () => {
    it("partono con l'audio dei take spento e il controllo acceso", async () => {
      const preferences = appPreferencesSchema.parse(
        (await client.call('GET', '/preferences')).body,
      );

      expect(preferences).toEqual({ takeAudio: false, checkForUpdates: true });
    });

    it('quello che si sceglie si ritrova', async () => {
      await client.call('PUT', '/preferences', { takeAudio: true, checkForUpdates: false });

      expect((await client.call('GET', '/preferences')).body).toEqual({
        takeAudio: true,
        checkForUpdates: false,
      });
    });

    it('rifiuta una preferenza che non è sì o no', async () => {
      const reply = await client.call('PUT', '/preferences', {
        takeAudio: 'sì',
        checkForUpdates: true,
      });

      expect(reply.status).toBe(400);
    });

    it("«Controlla adesso» dice che il controllo c'è solo nell'app installata", async () => {
      const reply = await client.call('POST', '/updates/check');

      expect(updateCheckResultSchema.parse(reply.body)).toEqual({ status: 'unavailable' });
    });
  });
});

describe('senza portachiavi del sistema (prima di Electron, D45)', () => {
  let app: NestExpressApplication;
  let client: Client;

  beforeAll(async () => {
    ({ app, client } = await startApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('dice che le chiavi non si possono scrivere', async () => {
    const view = secretsViewSchema.parse((await client.call('GET', '/secrets')).body);

    expect(view.writable).toBe(false);
  });

  it('scrivere una chiave risponde secret_store_unavailable e non salva niente', async () => {
    const reply = await client.call('PUT', '/secrets/MIA_CHIAVE', { value: 'valore-segreto-123' });

    expect(reply.status).toBe(503);
    expect(errorCode(reply)).toBe('secret_store_unavailable');
    expect(reply.text).not.toContain('valore-segreto-123');
  });
});
