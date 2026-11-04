import { servicePolicyFileSchema, type BlockedService, type ModelEntry } from '@filmzy/contracts';

import type { ConfigIssue } from './issues.js';
import { readConfigFile, type TroupeConfig } from './load-files.js';

const POLICY_FILE = 'ai/policy.yaml';

/**
 * I servizi vietati dai loro termini (D79). Il file si legge a ogni controllo, come le istruzioni,
 * così una release non può portarsi dietro un elenco più corto. Senza il file non si pubblica: meglio
 * fermarsi che lasciar passare un servizio vietato.
 */
export async function validateServicePolicy(
  config: TroupeConfig,
  configDir: string,
): Promise<ConfigIssue[]> {
  const { data, issues } = await readConfigFile(
    servicePolicyFileSchema,
    configDir,
    POLICY_FILE,
    'models',
  );
  if (data === undefined) return issues;

  return Object.entries(config.models).flatMap(([modelId, model]) => {
    const words = wordsOf(modelId, model, config);
    const rule = data.blocked_services.find((candidate) => isBlockedBy(candidate, model, words));
    return rule === undefined ? [] : [blockedIssue(modelId, model, rule)];
  });
}

/**
 * Le parole con cui si riconosce un servizio. Conta anche la connessione, perché lo stesso servizio può
 * arrivare da un rivenditore, e si confronta parola per parola perché «suno» sta anche dentro «nessuno».
 */
function wordsOf(modelId: string, model: ModelEntry, config: TroupeConfig): string[] {
  const connection = config.connections[model.connection];
  return [
    modelId,
    model.label,
    model.provider_model,
    model.connection,
    connection?.label,
    connection?.adapter,
    connection?.base_url,
  ]
    .filter((text) => text !== undefined)
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/);
}

function isBlockedBy(rule: BlockedService, model: ModelEntry, words: readonly string[]): boolean {
  if (rule.kinds !== undefined && !rule.kinds.includes(model.kind)) return false;
  return rule.match.some((start) =>
    words.some((word) => word.startsWith(start.toLowerCase())),
  );
}

function blockedIssue(modelId: string, model: ModelEntry, rule: BlockedService): ConfigIssue {
  return {
    severity: 'error',
    code: 'service_blocked_by_policy',
    message: `Per policy di Filmzy non si può usare «${model.label}». ${rule.reason}`,
    section: 'models',
    key: modelId,
    modelId,
  };
}
