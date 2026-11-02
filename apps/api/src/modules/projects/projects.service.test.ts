import type { ProjectStore } from '@filmzy/db';
import type { ConfigSource } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ProjectsService } from './projects.service.js';

/** Senza una configurazione attiva le scelte non si conoscono: niente film, e si può riprovare. */
describe('ProjectsService senza configurazione', () => {
  const store: ProjectStore = {
    create: () => {
      throw new Error('non deve salvare');
    },
    get: () => undefined,
    list: () => [],
    update: () => undefined,
  };
  const noConfig: ConfigSource = {
    load: () => Promise.resolve({ origin: 'prova', releaseId: 'nessuna', issues: [] }),
  };
  const service = new ProjectsService(store, noConfig);

  async function failure(call: () => Promise<unknown>): Promise<HttpException> {
    try {
      await call();
    } catch (error) {
      if (error instanceof HttpException) return error;
      throw error;
    }
    throw new Error('doveva fallire');
  }

  it('le scelte del wizard rispondono «configurazione non valida», da riprovare', async () => {
    const error = await failure(() => service.options());

    expect(error.getStatus()).toBe(503);
    expect(error.getResponse()).toMatchObject({ code: 'config_invalid', retryable: true });
  });

  it('creare un film non salva niente', async () => {
    const error = await failure(() =>
      service.create({
        idea: 'Una scintilla',
        genre: 'drama',
        tone: 'dark',
        style: 'realistic',
        cinematography: 'noir',
        durationS: 60,
      }),
    );

    expect(error.getStatus()).toBe(503);
  });
});
