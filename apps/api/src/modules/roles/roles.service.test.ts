import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTroupeStore, openFilmzyDatabase, type OpenedDatabase } from '@filmzy/db';
import { loadConfigFiles, type ConfigSource, type TroupeConfig } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { ConnectionsService } from '../connections/connections.service.js';
import type { InstructionsService } from '../instructions/instructions.service.js';
import { UserSettingsService } from '../troupe/user-settings.service.js';
import { RolesService } from './roles.service.js';

const CONFIG_DIR = fileURLToPath(new URL('../../../../../config', import.meta.url));

/**
 * Nessun modello del seme accetta la creatività (T1.7, D42), quindi qui se ne fa accettare una a
 * Sonnet, di proposito: è l'unico modo di provare i limiti, lo scarto cambiando servizio e il
 * ritorno al valore del programma. Il resto è il seme vero.
 */
let seed: TroupeConfig;

beforeAll(async () => {
  const { config } = await loadConfigFiles(CONFIG_DIR);
  if (config === undefined) throw new Error('il seme non si è caricato');
  seed = config;
});

let opened: OpenedDatabase;
let service: RolesService;

function config(): TroupeConfig {
  const copy = structuredClone(seed);
  const sonnet = copy.models['claude-sonnet'];
  if (sonnet === undefined) throw new Error('il seme non ha claude-sonnet');
  sonnet.params = { ...sonnet.params, temperature: { min: 0, max: 1 } };
  return copy;
}

beforeEach(async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-ruoli-'));
  opened = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

  const source: ConfigSource = {
    load: () =>
      Promise.resolve({ config: config(), origin: 'test', releaseId: 'test', issues: [] }),
  };
  service = new RolesService(
    source,
    new UserSettingsService(createTroupeStore(opened.db)),
    { isUsable: () => true } as unknown as ConnectionsService,
    { overview: () => Promise.resolve({ roles: [] }) } as unknown as InstructionsService,
  );
});

afterEach(() => {
  opened.close();
});

async function state(roleId: string) {
  const found = (await service.overview()).roles.find((role) => role.roleId === roleId);
  if (found === undefined) throw new Error(`manca il ruolo ${roleId}`);
  return found;
}

async function statusOf(action: Promise<unknown>): Promise<number | undefined> {
  try {
    await action;
  } catch (error) {
    if (error instanceof HttpException) return error.getStatus();
  }
  return undefined;
}

describe('creatività (D42)', () => {
  it('compare solo dove il servizio in uso la accetta, coi suoi limiti', async () => {
    // Il moderatore usa Haiku, che non la accetta.
    expect((await state('moderator')).temperature).toBeUndefined();

    await service.setService('moderator', 'claude-sonnet');

    expect((await state('moderator')).temperature).toEqual({ min: 0, max: 1, chosen: false });
  });

  it("si sceglie dentro i limiti e si vede come scelta dell'utente", async () => {
    await service.setService('moderator', 'claude-sonnet');
    const result = await service.setTemperature('moderator', 0.7);

    const moderator = result.overview.roles.find((role) => role.roleId === 'moderator');
    expect(moderator?.temperature).toEqual({ value: 0.7, min: 0, max: 1, chosen: true });
    expect(result.discarded).toEqual([]);
  });

  it('fuori dai limiti è rifiutata, e non cambia niente', async () => {
    await service.setService('moderator', 'claude-sonnet');

    expect(await statusOf(service.setTemperature('moderator', 1.5))).toBe(400);
    expect((await state('moderator')).temperature?.chosen).toBe(false);
  });

  it('con null si torna al valore del programma', async () => {
    await service.setService('moderator', 'claude-sonnet');
    await service.setTemperature('moderator', 0.4);

    const result = await service.setTemperature('moderator', null);

    expect(result.overview.roles.find((role) => role.roleId === 'moderator')?.temperature).toEqual({
      min: 0,
      max: 1,
      chosen: false,
    });
  });

  it('cambiando servizio, la creatività che il nuovo non accetta si scarta e lo dice', async () => {
    await service.setService('moderator', 'claude-sonnet');
    await service.setTemperature('moderator', 0.7);

    const result = await service.setService('moderator', 'claude-haiku');

    expect(result.discarded).toEqual(['temperature']);
    const moderator = result.overview.roles.find((role) => role.roleId === 'moderator');
    expect(moderator?.temperature).toBeUndefined();
    expect(moderator?.chosenModelId).toBe('claude-haiku');

    // E tornando a Sonnet non riappare da sola: era stata scartata davvero.
    await service.setService('moderator', 'claude-sonnet');
    expect((await state('moderator')).temperature?.chosen).toBe(false);
  });

  it('tornando al servizio della release si scarta quella che la release non accetta', async () => {
    await service.setService('moderator', 'claude-sonnet');
    await service.setTemperature('moderator', 0.7);

    // La release usa Haiku, che non la accetta.
    const result = await service.setService('moderator', null);

    expect(result.discarded).toEqual(['temperature']);
  });

  it('cambiando servizio senza creatività scelta non scarta niente', async () => {
    const result = await service.setService('moderator', 'claude-sonnet');

    expect(result.discarded).toEqual([]);
  });

  it('un ruolo senza servizio (spento) non ne ha una da regolare', async () => {
    expect(await statusOf(service.setTemperature('composer', 0.5))).toBe(409);
  });
});
