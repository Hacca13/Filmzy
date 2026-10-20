import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  connectionSchema,
  environmentFileSchema,
  roleConfigEntrySchema,
  type EnvironmentFile,
} from '@filmzy/contracts';
import type { z } from 'zod';

import type { ConfigIssue } from './issues.js';
import { parseConfigFile, type TroupeConfig } from './load-files.js';

/**
 * Gli ambienti della configurazione (architettura §4.5): un adattamento che sta **sopra** le
 * scelte dell'utente, così `TROUPE_ENV=offline` usa sempre il fornitore finto, qualunque servizio
 * l'utente abbia attivato.
 */
export const CONFIG_ENVIRONMENTS = ['development', 'offline', 'test'] as const;

export type ConfigEnvironment = (typeof CONFIG_ENVIRONMENTS)[number];

function isConfigEnvironment(value: string): value is ConfigEnvironment {
  return (CONFIG_ENVIRONMENTS as readonly string[]).includes(value);
}

/**
 * Legge `TROUPE_ENV`. Senza la variabile non c'è nessun adattamento (vale il seme o la release);
 * un valore che non esiste è un errore subito, perché altrimenti si lavorerebbe con una
 * configurazione diversa da quella che si crede.
 */
export function configEnvironmentFromEnv(
  env: Record<string, string | undefined> = process.env,
): ConfigEnvironment | undefined {
  const value = env.TROUPE_ENV?.trim();
  if (value === undefined || value === '') return undefined;
  if (!isConfigEnvironment(value)) {
    throw new Error(
      `TROUPE_ENV non valido: "${value}". Valori ammessi: ${CONFIG_ENVIRONMENTS.join(', ')}.`,
    );
  }
  return value;
}

/** Legge `config/ai/environments/<env>.yaml`. Un ambiente senza file non è un errore. */
export async function loadEnvironmentOverlay(
  configDir: string,
  environment: ConfigEnvironment,
): Promise<{ overlay?: EnvironmentFile; issues: ConfigIssue[] }> {
  const file = path.join('ai', 'environments', `${environment}.yaml`);
  let raw: string;
  try {
    raw = await readFile(path.join(configDir, file), 'utf8');
  } catch {
    return { issues: [] };
  }

  // Un file di soli commenti è una sovrapposizione vuota, non un file rotto.
  if (raw.replaceAll(/^\s*#.*$/gm, '').trim() === '') return { overlay: {}, issues: [] };

  const parsed = parseConfigFile(environmentFileSchema, file, raw, 'connections');
  return { overlay: parsed.data, issues: parsed.issues };
}

/**
 * Applica la sovrapposizione sopra la configurazione (architettura §4.5): la fusione è profonda,
 * le liste si sostituiscono e la chiave `"*"` vale per tutte le voci della sezione. Il risultato
 * si rivalida con lo schema della voce, così una sovrapposizione che rompe una voce si vede qui e
 * non più tardi, durante una chiamata.
 */
export function applyEnvironmentOverlay(
  config: TroupeConfig,
  overlay: EnvironmentFile,
): { config: TroupeConfig; issues: ConfigIssue[] } {
  const issues: ConfigIssue[] = [];

  const connections = applySection(
    config.connections,
    overlay.connections,
    connectionSchema,
    'connections',
    issues,
  );
  const roles = applySection(config.roles, overlay.roles, roleConfigEntrySchema, 'roles', issues);

  return { config: { ...config, connections, roles }, issues };
}

function applySection<Entry>(
  entries: Record<string, Entry | undefined>,
  patches: Record<string, unknown> | undefined,
  schema: z.ZodType<Entry>,
  section: 'connections' | 'roles',
  issues: ConfigIssue[],
): Record<string, Entry> {
  const merged: Record<string, Entry> = {};
  for (const [key, entry] of Object.entries(entries)) {
    if (entry !== undefined) merged[key] = entry;
  }
  if (patches === undefined) return merged;

  const what = section === 'roles' ? 'il ruolo' : 'la connessione';

  for (const [key, patch] of Object.entries(patches)) {
    if (key !== '*' && merged[key] === undefined) {
      issues.push({
        severity: 'error',
        code: 'environment_unknown_key',
        message: `L'ambiente cambia ${what} "${key}", che non esiste nella configurazione.`,
        section,
        key,
      });
      continue;
    }

    for (const target of key === '*' ? Object.keys(merged) : [key]) {
      const base = merged[target];
      if (base === undefined) continue;

      const result = schema.safeParse(deepMerge(base, patch));
      if (result.success) {
        merged[target] = result.data;
        continue;
      }
      issues.push(
        ...result.error.issues.map((issue) => ({
          severity: 'error' as const,
          code: 'environment_invalid_result',
          message: `L'ambiente rende non valida la voce "${target}" di ${section}: ${issue.path.join('.')} — ${issue.message}.`,
          section,
          key: target,
          field: issue.path.length > 0 ? issue.path.join('.') : undefined,
        })),
      );
    }
  }

  return merged;
}

/** Fusione profonda: gli oggetti si fondono, le liste e i valori si sostituiscono (§4.5). */
function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    result[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
