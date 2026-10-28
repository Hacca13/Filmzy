import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  projectsListSchema,
  type CreateProjectBody,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il moderatore davanti all'idea (T3.3), col server vero: un moderatore finto che dice sempre di
 * no (una fixture, nessuna spesa vera) e la prudenza che si accende e si spegne dalle preferenze.
 */
const SEED_CONFIG = fileURLToPath(new URL('../../../../../config', import.meta.url));

const REJECTION = {
  category: 'real_person',
  reason: 'Il testo nomina una persona famosa.',
  suggestion: 'Inventa un personaggio che le somigli.',
};

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  // Una copia della configurazione in cui il moderatore finto risponde sempre «no».
  const root = await mkdtemp(path.join(tmpdir(), 'filmzy-moderatore-'));
  const configDir = path.join(root, 'config');
  const fixturesDir = path.join(root, 'fixtures');
  cpSync(SEED_CONFIG, configDir, { recursive: true });
  mkdirSync(fixturesDir);
  writeFileSync(
    path.join(fixturesDir, 'moderator.json'),
    JSON.stringify({ data: { allowed: false, ...REJECTION } }),
  );
  writeFileSync(
    path.join(configDir, 'ai', 'environments', 'offline.yaml'),
    `connections:\n  "*":\n    adapter: fake\n    fixtures: ${JSON.stringify(fixturesDir.replaceAll('\\', '/'))}\n`,
  );

  ({ app, client } = await startApp(undefined, 'offline', configDir));
});

afterAll(async () => {
  await app.close();
});

async function setModeration(moderation: boolean) {
  const reply = await client.call('PUT', '/preferences', {
    takeAudio: false,
    checkForUpdates: true,
    moderation,
  });
  expect(reply.status).toBe(200);
}

async function validBody(): Promise<CreateProjectBody> {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  return {
    idea: 'Un film su una persona famosa',
    genre: options.defaults.genre ?? '',
    tone: options.defaults.tone ?? '',
    style: options.defaults.style ?? '',
    cinematography: options.defaults.cinematography ?? '',
    durationS: 60,
  };
}

async function count() {
  const reply = await client.call('GET', '/projects');
  return projectsListSchema.parse(reply.body).projects.length;
}

describe('il moderatore davanti all’idea', () => {
  it('un’idea respinta dà «contenuto rifiutato» col motivo e il suggerimento, e non lascia un film', async () => {
    const before = await count();

    const reply = await client.call('POST', '/projects', await validBody());
    const error = domainErrorSchema.parse(reply.body);

    expect(reply.status).toBe(422);
    expect(error.code).toBe('content_rejected');
    expect(error.details?.moderation).toEqual(REJECTION);
    expect(await count()).toBe(before);
  });

  describe('con la prudenza spenta', () => {
    it('l’idea passa senza controllo, e si può accendere di nuovo', async () => {
      await setModeration(false);
      const created = await client.call('POST', '/projects', await validBody());
      await setModeration(true);

      expect(created.status).toBe(201);
      expect(projectSchema.parse(created.body).idea).toBe('Un film su una persona famosa');
      const preferences = (await client.call('GET', '/preferences')).body;
      expect(preferences).toMatchObject({ moderation: true });
    });
  });

  describe('rivedere l’idea di un film già fatto', () => {
    async function film() {
      await setModeration(false);
      const reply = await client.call('POST', '/projects', await validBody());
      await setModeration(true);
      return projectSchema.parse(reply.body);
    }

    it('un’idea nuova respinta non cambia niente', async () => {
      const project = await film();

      const reply = await client.call('PATCH', `/projects/${project.id}`, {
        idea: 'Un’altra idea',
      });

      expect(reply.status).toBe(422);
      expect(domainErrorSchema.parse(reply.body).code).toBe('content_rejected');
      const reread = await client.call('GET', `/projects/${project.id}`);
      expect(projectSchema.parse(reread.body).idea).toBe(project.idea);
    });

    it('cambiare solo le scelte non ripassa dal moderatore: non c’è testo nuovo', async () => {
      const project = await film();
      const options = projectOptionsSchema.parse(
        (await client.call('GET', '/projects/options')).body,
      );

      const reply = await client.call('PATCH', `/projects/${project.id}`, {
        durationS: options.durationsS.find((duration) => duration !== project.durationS),
      });

      expect(reply.status).toBe(200);
    });
  });
});
