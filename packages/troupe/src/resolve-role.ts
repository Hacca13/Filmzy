import {
  modelGroupForKind,
  type Connection,
  type ModelEntry,
  type RoleConfigEntry,
  type RoleId,
  type UserSettings,
} from '@filmzy/contracts';

import type { TroupeConfig } from './config/load-files.js';
import { ineligibilityReasons } from './eligibility.js';
import { ProviderError } from './provider-error.js';

export interface ResolvedRole {
  roleId: string;
  role: RoleConfigEntry;
  modelId: string;
  model: ModelEntry;
  connectionId: string;
  connection: Connection;
  /** I parametri del ruolo con le regolazioni dell'utente già applicate (D38). */
  params: Record<string, string | number | boolean>;
  /** Il riferimento alle istruzioni della release, se il ruolo ne cita uno. */
  releaseInstructions?: string;
  /** La versione scelta dall'utente in «Chi fa cosa», se l'ha scelta (D38). */
  userInstructions?: string;
  retries: { invalid_output: number; technical_error: number };
}

/**
 * Dal nome di un ruolo alla sua configurazione effettiva, con le precedenze di architettura §4.5:
 * la release, poi le scelte dell'utente (modello, creatività, versione delle istruzioni: D38).
 * L'adattamento d'ambiente è già stato applicato alla configurazione prima di arrivare qui.
 *
 * Se il ruolo è spento o nessun servizio è idoneo si ferma **senza chiamare nessuno**, con il
 * codice che l'interfaccia sa spiegare (§4.8, §4.10). Non si passa mai a un altro servizio da
 * soli (D36).
 */
export function resolveRole(
  config: TroupeConfig,
  roleId: string,
  settings?: UserSettings,
): ResolvedRole {
  const role = config.roles[roleId];
  if (role === undefined) {
    throw new ProviderError('config_invalid', false, `Il ruolo "${roleId}" non è configurato.`, {
      role: roleId,
    });
  }
  if (role.enabled === false) {
    throw new ProviderError('role_disabled', false, `Il ruolo "${roleId}" è spento.`, {
      role: roleId,
    });
  }

  const roleSettings = settings?.roleSettings[roleId as RoleId];
  const params = {
    ...role.params,
    ...(roleSettings?.params?.temperature === undefined
      ? {}
      : { temperature: roleSettings.params.temperature }),
  };

  const chosen = pickModel({ config, roleId, role: { ...role, params }, roleSettings, settings });

  return {
    roleId,
    role,
    modelId: chosen.modelId,
    model: chosen.model,
    connectionId: chosen.model.connection,
    connection: chosen.connection,
    params,
    releaseInstructions: role.instructions,
    userInstructions: roleSettings?.instructions,
    retries: {
      invalid_output: role.retries?.invalid_output ?? 0,
      technical_error: role.retries?.technical_error ?? 0,
    },
  };
}

interface PickModelInput {
  config: TroupeConfig;
  roleId: string;
  role: RoleConfigEntry;
  roleSettings: { modelId?: string } | undefined;
  settings: UserSettings | undefined;
}

/**
 * Il servizio che lavorerà: quello regolato dall'utente per il ruolo; poi il predefinito che
 * l'utente ha scelto per il gruppo (come fa il router, §4.8 punto 2: se è idoneo passa in testa,
 * altrimenti si guarda il resto); poi quello della release. Se il ruolo ha più candidati si
 * prende il primo idoneo — l'ordinamento per politica (`cheap`, `balanced`, `quality`) è compito
 * del router, che arriva dopo.
 */
function pickModel(input: PickModelInput): {
  modelId: string;
  model: ModelEntry;
  connection: Connection;
} {
  const { config, roleId, role, roleSettings, settings } = input;
  const declared = role.model !== undefined ? [role.model] : (role.routing?.candidates ?? []);
  const groupDefault = settings?.defaultModels[modelGroupForKind(role.kind)];
  const candidates =
    roleSettings?.modelId !== undefined
      ? [roleSettings.modelId]
      : groupDefault === undefined
        ? declared
        : [groupDefault, ...declared.filter((id) => id !== groupDefault)];

  if (candidates.length === 0) {
    throw new ProviderError(
      'config_invalid',
      false,
      `Il ruolo "${roleId}" non ha nessun servizio: né "model" né "routing".`,
      { role: roleId, field: 'model' },
    );
  }

  const rejected: string[] = [];
  for (const modelId of candidates) {
    const model = config.models[modelId];
    const connection = model === undefined ? undefined : config.connections[model.connection];
    const reasons = ineligibilityReasons({
      role,
      modelId,
      model,
      connection,
      enabledModelIds: settings?.enabledModelIds,
    });

    if (reasons.length === 0 && model !== undefined && connection !== undefined) {
      return { modelId, model, connection };
    }
    rejected.push(`"${modelId}" ${reasons.join(', ')}`);
  }

  throw new ProviderError(
    'no_eligible_model',
    false,
    `Nessun servizio può servire il ruolo "${roleId}": ${rejected.join('; ')}.`,
    { role: roleId },
  );
}
