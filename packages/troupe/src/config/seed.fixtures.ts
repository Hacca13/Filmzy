import { fileURLToPath } from 'node:url';

import type { Connection, ModelEntry, RoleConfigEntry } from '@filmzy/contracts';

import { loadConfigFiles, type TroupeConfig } from './load-files.js';

/** La cartella `config/` del repository: i file di seme veri, non una copia. */
export const SEED_CONFIG_DIR = fileURLToPath(new URL('../../../../config', import.meta.url));

export async function loadSeedConfig(): Promise<TroupeConfig> {
  const { config, issues } = await loadConfigFiles(SEED_CONFIG_DIR);
  if (config === undefined) {
    throw new Error(`i file di seme non si sono caricati: ${issues.map((i) => i.message).join(' ')}`);
  }
  return config;
}

export function roleOf(config: TroupeConfig, roleId: string): RoleConfigEntry {
  const role = config.roles[roleId];
  if (role === undefined) throw new Error(`il seme non ha il ruolo "${roleId}"`);
  return role;
}

export function modelOf(config: TroupeConfig, modelId: string): ModelEntry {
  const model = config.models[modelId];
  if (model === undefined) throw new Error(`il seme non ha il servizio "${modelId}"`);
  return model;
}

export function connectionOf(config: TroupeConfig, connectionId: string): Connection {
  const connection = config.connections[connectionId];
  if (connection === undefined) throw new Error(`il seme non ha la connessione "${connectionId}"`);
  return connection;
}
