import { createHash } from 'node:crypto';

import type { TroupeConfig } from './load-files.js';

/**
 * JSON con le chiavi in ordine, così lo stesso contenuto dà sempre lo stesso testo: due
 * configurazioni uguali scritte in ordine diverso non devono sembrare diverse.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value !== 'object' || value === null) return value;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return Object.fromEntries(entries.map(([key, item]) => [key, normalize(item)]));
}

/** L'impronta di un contenuto di configurazione: sha256 del JSON canonico. */
export function configHash(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

/**
 * L'hash della configurazione risolta di un ruolo, che finisce nello scontrino (architettura §4.5,
 * §4.11): ruolo, modelli che possono servirlo con i loro id presso il fornitore, parametri e
 * versione delle istruzioni. Serve a ricostruire *come* è nato un risultato, quindi cambia quando
 * cambia una di queste cose e non quando cambia il resto della configurazione.
 */
export function hashRoleConfig(config: TroupeConfig, roleId: string): string | undefined {
  const role = config.roles[roleId];
  if (role === undefined) return undefined;

  const modelIds = role.model !== undefined ? [role.model] : (role.routing?.candidates ?? []);
  return configHash({
    role: roleId,
    kind: role.kind,
    params: role.params,
    instructions: role.instructions,
    output_strategy: role.output_strategy,
    routing: role.routing?.policy,
    models: modelIds.map((modelId) => ({
      modelId,
      provider_model: config.models[modelId]?.provider_model,
      connection: config.models[modelId]?.connection,
    })),
  });
}
