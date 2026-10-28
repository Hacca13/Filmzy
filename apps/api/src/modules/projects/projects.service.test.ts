import type { Project, TroupePresetsData } from '@filmzy/contracts';
import type { ProjectStore } from '@filmzy/db';
import type { ConfigSource, LoadedConfig } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type { ModerationRequest, ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from './projects.service.js';

const presets: TroupePresetsData = {
  genres: [{ id: 'drama', label: 'Drammatico' }],
  tones: [{ id: 'dark', label: 'Cupo' }],
  styles: [
    { id: 'realistic', label: 'Realistico', description: 'Dal vero', hint: 'x', enabled: true },
  ],
  cinematography: [
    {
      id: 'noir',
      label: 'Noir',
      description: 'Ombre',
      camera: 'x',
      lighting: 'x',
      lens: 'x',
      grade: 'x',
      enabled: true,
    },
  ],
  cameraMovements: [],
  characterTags: [],
};

const body = {
  idea: 'Una scintilla',
  genre: 'drama',
  tone: 'dark',
  style: 'realistic',
  cinematography: 'noir',
  durationS: 60,
} as const;

const film: Project = {
  id: 'film-1',
  title: 'Prima',
  idea: 'Un’idea già controllata',
  genre: 'drama',
  tone: 'dark',
  style: 'realistic',
  cinematography: 'noir',
  language: 'it',
  durationS: 60,
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:00:00.000Z',
};

async function failure(call: () => Promise<unknown>): Promise<HttpException> {
  try {
    await call();
  } catch (error) {
    if (error instanceof HttpException) return error;
    throw error;
  }
  throw new Error('doveva fallire');
}

/** Un moderatore finto: ricorda cosa gli hanno chiesto e respinge se glielo si dice. */
function fakeModeration(rejects = false) {
  const requests: ModerationRequest[] = [];
  const moderation = {
    assertAllowed: (request: ModerationRequest) => {
      requests.push(request);
      return rejects
        ? Promise.reject(new HttpException({ code: 'content_rejected', retryable: false }, 422))
        : Promise.resolve();
    },
  } as unknown as ModerationService;
  return { requests, moderation };
}

/** Un archivio che ricorda cosa è stato salvato. */
function fakeStore() {
  const saved: string[] = [];
  const store: ProjectStore = {
    create: (input) => {
      saved.push(`create:${input.idea}`);
      return { ...film, ...input };
    },
    get: (id) => (id === film.id ? film : undefined),
    list: () => [],
    update: (id, changes) => {
      saved.push(`update:${id}`);
      return { ...film, ...changes };
    },
  };
  return { saved, store };
}

const withPresets: ConfigSource = {
  // Basta la parte che il servizio legge: i preset.
  load: () =>
    Promise.resolve({
      config: { presets },
      origin: 'prova',
      releaseId: 'prova',
      issues: [],
    } as unknown as LoadedConfig),
};

/** Senza una configurazione attiva le scelte non si conoscono: niente film, e si può riprovare. */
describe('ProjectsService senza configurazione', () => {
  const noConfig: ConfigSource = {
    load: () => Promise.resolve({ origin: 'prova', releaseId: 'nessuna', issues: [] }),
  };
  const { store, saved } = fakeStore();
  const service = new ProjectsService(store, noConfig, fakeModeration().moderation);

  it('le scelte del wizard rispondono «configurazione non valida», da riprovare', async () => {
    const error = await failure(() => service.options());

    expect(error.getStatus()).toBe(503);
    expect(error.getResponse()).toMatchObject({ code: 'config_invalid', retryable: true });
  });

  it('creare un film non salva niente', async () => {
    const error = await failure(() => service.create(body));

    expect(error.getStatus()).toBe(503);
    expect(saved).toEqual([]);
  });
});

describe('ProjectsService e il moderatore (T3.3)', () => {
  it('l’idea e il titolo si controllano prima di salvare, come testo dell’idea', async () => {
    const { requests, moderation } = fakeModeration();
    const { saved, store } = fakeStore();
    const service = new ProjectsService(store, withPresets, moderation);

    await service.create({ ...body, title: 'Il mio titolo' });

    expect(requests).toEqual([
      { text: 'Il mio titolo\nUna scintilla', context: 'idea', language: 'it' },
    ]);
    expect(saved).toEqual(['create:Una scintilla']);
  });

  it('un testo respinto non lascia niente: il film non si salva', async () => {
    const { moderation } = fakeModeration(true);
    const { saved, store } = fakeStore();
    const service = new ProjectsService(store, withPresets, moderation);

    const error = await failure(() => service.create(body));

    expect(error.getStatus()).toBe(422);
    expect(saved).toEqual([]);
  });

  it('una scelta che non esiste si ferma prima del moderatore: non si paga per niente', async () => {
    const { requests, moderation } = fakeModeration();
    const service = new ProjectsService(fakeStore().store, withPresets, moderation);

    const error = await failure(() => service.create({ ...body, genre: 'western' }));

    expect(error.getStatus()).toBe(400);
    expect(requests).toEqual([]);
  });

  it('rivedere l’idea la controlla, per quel film; respinta, non si cambia niente', async () => {
    const accepted = fakeModeration();
    const store = fakeStore();
    await new ProjectsService(store.store, withPresets, accepted.moderation).update(film.id, {
      idea: 'Una nuova idea',
    });

    expect(accepted.requests).toEqual([
      { text: 'Una nuova idea', context: 'idea', language: 'it', projectId: film.id },
    ]);
    expect(store.saved).toEqual(['update:film-1']);

    const refused = fakeStore();
    const error = await failure(() =>
      new ProjectsService(refused.store, withPresets, fakeModeration(true).moderation).update(
        film.id,
        { idea: 'Una nuova idea' },
      ),
    );
    expect(error.getStatus()).toBe(422);
    expect(refused.saved).toEqual([]);
  });

  it('cambiare solo le scelte, o svuotare il titolo, non spende un controllo: non c’è testo nuovo', async () => {
    const { requests, moderation } = fakeModeration();
    const service = new ProjectsService(fakeStore().store, withPresets, moderation);

    await service.update(film.id, { tone: 'dark', durationS: 90 });
    await service.update(film.id, { title: '' });

    expect(requests).toEqual([]);
  });

  it('un titolo nuovo si controlla da solo', async () => {
    const { requests, moderation } = fakeModeration();
    const service = new ProjectsService(fakeStore().store, withPresets, moderation);

    await service.update(film.id, { title: 'Nuovo titolo' });

    expect(requests.map((request) => request.text)).toEqual(['Nuovo titolo']);
  });
});
