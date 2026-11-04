import {
  servicePolicyFileSchema,
  type ModelEntry,
  type RestrictedService,
  type ServicePolicyFile,
} from '@filmzy/contracts';

import type { ConfigIssue } from './issues.js';
import { readConfigFile, type TroupeConfig } from './load-files.js';

const POLICY_FILE = 'ai/policy.yaml';

export function loadServicePolicy(
  configDir: string,
): Promise<{ data?: ServicePolicyFile; issues: ConfigIssue[] }> {
  return readConfigFile(servicePolicyFileSchema, configDir, POLICY_FILE, 'models');
}

/** La scritta di ogni servizio del catalogo che ne ha una (D79), per id del servizio. */
export function serviceTermsNotices(
  config: TroupeConfig,
  policy: ServicePolicyFile,
): Map<string, string> {
  const notices = new Map<string, string>();
  for (const [modelId, model] of Object.entries(config.models)) {
    const words = wordsOf(modelId, model, config);
    const rule = policy.restricted_services.find((candidate) =>
      isCoveredBy(candidate, model, words),
    );
    if (rule !== undefined) notices.set(modelId, rule.notice);
  }
  return notices;
}

/**
 * Avvisa di chi aggiunge a mano un servizio con termini da conoscere (D79): non ferma la pubblicazione,
 * la scelta è dell'utente. Il file si legge a ogni controllo, come le istruzioni, così una release non
 * può portarsi dietro un elenco più corto; senza il file non si pubblica, perché la scritta sparirebbe
 * senza dirlo. Un servizio spento di partenza non avvisa qui, finché nessun ruolo lo usa: la sua scritta
 * sta accanto all'interruttore.
 */
export async function validateServicePolicy(
  config: TroupeConfig,
  configDir: string,
): Promise<ConfigIssue[]> {
  const { data, issues } = await loadServicePolicy(configDir);
  if (data === undefined) return issues;

  return [...serviceTermsNotices(config, data)].flatMap(([modelId, notice]) => {
    const model = config.models[modelId];
    return model === undefined || (model.off_by_default === true && !usedByRole(modelId, config))
      ? []
      : [
          {
            severity: 'warning' as const,
            code: 'service_terms_notice',
            message: `«${model.label}»: ${notice}`,
            section: 'models' as const,
            key: modelId,
            modelId,
          },
        ];
  });
}

function usedByRole(modelId: string, config: TroupeConfig): boolean {
  return Object.values(config.roles).some(
    (role) => role?.model === modelId || role?.routing?.candidates.includes(modelId) === true,
  );
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

function isCoveredBy(
  rule: RestrictedService,
  model: ModelEntry,
  words: readonly string[],
): boolean {
  if (rule.kinds !== undefined && !rule.kinds.includes(model.kind)) return false;
  return rule.match.some((start) => words.some((word) => word.startsWith(start.toLowerCase())));
}
