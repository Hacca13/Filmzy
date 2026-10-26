import {
  createInstructionVersionResponseSchema,
  domainErrorSchema,
  instructionTextSchema,
  instructionsOverviewSchema,
  previewInstructionsResponseSchema,
  roleInstructionsSchema,
  type RoleInstructions,
} from '@filmzy/contracts';
import { resolveInstructions, type ConfigSource, type InstructionsSource } from '@filmzy/troupe';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';
import { INSTRUCTIONS_SOURCE } from './tokens.js';

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
});

afterAll(async () => {
  await app.close();
});

async function moderator(): Promise<RoleInstructions> {
  const overview = instructionsOverviewSchema.parse(
    (await client.call('GET', '/instructions')).body,
  );
  const found = overview.roles.find((role) => role.roleId === 'moderator');
  if (found === undefined) throw new Error('il moderatore non ha istruzioni');
  return found;
}

async function textOf(roleId: string, version: number): Promise<string> {
  const reply = await client.call('GET', `/instructions/${roleId}/versions/${String(version)}`);
  return instructionTextSchema.parse(reply.body).text;
}

describe('versioni di istruzioni (T2.4)', () => {
  it('ogni ruolo con istruzioni ha le sue versioni del programma, con cosa può leggere un testo', async () => {
    const role = await moderator();

    expect(role).toMatchObject({ recommended: 1, inUse: 1, label: 'Moderatore' });
    expect(role.chosen).toBeUndefined();
    expect(role.versions).toHaveLength(1);
    expect(role.versions[0]).toMatchObject({ version: 1, origin: 'bundled', label: 'Versione 1' });
    expect(role.availableVariables).toContain('text');
    expect(role.versions[0]?.changelog.length).toBeGreaterThan(0);
  });

  it("il testo di una versione si legge com'è scritto, con le varianti", async () => {
    const reply = await client.call('GET', '/instructions/cinematographer/versions/1');
    const text = instructionTextSchema.parse(reply.body);

    expect(text.text).toContain('## system');
    expect(text.variants.map((variant) => variant.family).sort()).toEqual([
      'image_generic',
      'seedance',
    ]);
  });

  it("un ruolo senza istruzioni, o una versione che non c'è, è 404", async () => {
    expect((await client.call('GET', '/instructions/inventato/versions/1')).status).toBe(404);
    expect((await client.call('GET', '/instructions/moderator/versions/99')).status).toBe(404);
  });

  describe('anteprima', () => {
    it("un testo giusto si rende con l'esempio fisso", async () => {
      const text = await textOf('moderator', 1);
      const reply = await client.call('POST', '/instructions/moderator/preview', { text });
      const preview = previewInstructionsResponseSchema.parse(reply.body);

      expect(preview.issues).toEqual([]);
      expect(Object.keys(preview.rendered ?? {})).toEqual(['system', 'user']);
    });

    it('una parola che non esiste è un errore che la nomina, senza anteprima', async () => {
      const text = (await textOf('moderator', 1)).replace('{{ text }}', '{{ nome }}');
      const reply = await client.call('POST', '/instructions/moderator/preview', { text });
      const preview = previewInstructionsResponseSchema.parse(reply.body);

      expect(preview.rendered).toBeUndefined();
      expect(preview.issues[0]).toMatchObject({
        code: 'instruction_variable_unknown',
        message: 'Nel file c\'è una parola che non esiste: "nome".',
        field: 'nome',
      });
    });

    it('un corpo senza testo è una richiesta sbagliata', async () => {
      const reply = await client.call('POST', '/instructions/moderator/preview', {});

      expect(reply.status).toBe(400);
      expect(domainErrorSchema.parse(reply.body).code).toBe('invalid_request');
    });
  });

  describe('nuova versione, e scelta', () => {
    it("crea una versione dell'utente senza toccare la precedente", async () => {
      const original = await textOf('moderator', 1);
      const edited = original.replace('Sei il moderatore', 'Sei il moderatore, ma più gentile');
      const reply = await client.call('POST', '/instructions/moderator/versions', {
        text: edited,
        basedOn: 1,
      });
      const created = createInstructionVersionResponseSchema.parse(reply.body);

      expect(created.issues).toEqual([]);
      expect(created.version).toMatchObject({
        version: 101,
        origin: 'user',
        label: 'Le mie istruzioni 1',
      });
      expect((await moderator()).versions.map((version) => version.version)).toEqual([1, 101]);
      expect(await textOf('moderator', 1)).toBe(original);
      // Il numero lo dà il programma: il file salvato lo dice anche nella sua intestazione.
      expect(await textOf('moderator', 101)).toContain('version: 101');
      expect(await textOf('moderator', 101)).toContain('più gentile');
    });

    it('un testo con una parola che non esiste non si salva', async () => {
      const text = (await textOf('moderator', 1)).replace('{{ text }}', '{{ nome }}');
      const reply = await client.call('POST', '/instructions/moderator/versions', { text });
      const created = createInstructionVersionResponseSchema.parse(reply.body);

      expect(created.version).toBeUndefined();
      expect(created.issues[0]?.field).toBe('nome');
      expect((await moderator()).versions).toHaveLength(2);
    });

    it('partendo da una versione porta con sé le sue varianti', async () => {
      const text = await textOf('cinematographer', 1);
      const reply = await client.call('POST', '/instructions/cinematographer/versions', {
        text,
        basedOn: 1,
      });
      const created = createInstructionVersionResponseSchema.parse(reply.body);

      expect(created.version?.variants.sort()).toEqual(['image_generic', 'seedance']);
      const copied = instructionTextSchema.parse(
        (await client.call('GET', '/instructions/cinematographer/versions/101')).body,
      );
      expect(copied.variants).toHaveLength(2);
      expect(copied.variants.every((variant) => variant.mode === 'append')).toBe(true);
    });

    it("una versione di partenza che non c'è non salva niente", async () => {
      const text = await textOf('moderator', 1);
      const reply = await client.call('POST', '/instructions/moderator/versions', {
        text,
        basedOn: 55,
      });
      const created = createInstructionVersionResponseSchema.parse(reply.body);

      expect(created.version).toBeUndefined();
      expect(created.issues[0]?.code).toBe('instructions_version_missing');
      expect((await moderator()).versions).toHaveLength(2);
    });

    it("la scelta vale subito: la troupe legge il testo dell'utente e le altre scelte restano", async () => {
      const reply = await client.call('PUT', '/instructions/moderator/choice', { version: 101 });
      const role = roleInstructionsSchema.parse(reply.body);

      expect(role).toMatchObject({ chosen: 'moderator@101', inUse: 101, recommended: 1 });

      const loaded = await app.get<ConfigSource>(CONFIG_SOURCE).load();
      expect(loaded.settings?.roleSettings.moderator?.instructions).toBe('moderator@101');
      // La prima scelta non deve spegnere nessun servizio: «nessuna scelta» voleva dire «tutti».
      expect(loaded.settings?.enabledModelIds).toContain('claude-sonnet');

      const resolved = await resolveInstructions(app.get<InstructionsSource>(INSTRUCTIONS_SOURCE), {
        fallbackId: 'moderator',
        releaseRef: loaded.config?.roles.moderator?.instructions,
        userRef: loaded.settings?.roleSettings.moderator?.instructions,
      });
      expect(resolved.version).toBe(101);
      expect(resolved.sections.system).toContain('più gentile');
    });

    it('una nuova versione non cambia la scelta fatta', async () => {
      const text = await textOf('moderator', 1);
      const reply = await client.call('POST', '/instructions/moderator/versions', { text });

      expect(createInstructionVersionResponseSchema.parse(reply.body).version?.version).toBe(102);
      expect((await moderator()).inUse).toBe(101);
    });

    it("scegliere una versione che non c'è è 404 e non cambia niente", async () => {
      const reply = await client.call('PUT', '/instructions/moderator/choice', { version: 999 });

      expect(reply.status).toBe(404);
      expect((await moderator()).chosen).toBe('moderator@101');
    });

    it('con null si torna alla versione di prima, e la scelta sparisce', async () => {
      const reply = await client.call('PUT', '/instructions/moderator/choice', { version: null });
      const role = roleInstructionsSchema.parse(reply.body);

      expect(role.chosen).toBeUndefined();
      expect(role.inUse).toBe(1);
      const loaded = await app.get<ConfigSource>(CONFIG_SOURCE).load();
      expect(loaded.settings?.roleSettings.moderator).toBeUndefined();
    });
  });
});
