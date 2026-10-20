import {
  ROLE_IO,
  type Connection,
  type ModelEntry,
  type RoleConfigEntry,
  type RoleId,
} from '@filmzy/contracts';

import type { ConfigEnvironment } from './environments.js';
import type { ConfigIssue } from './issues.js';
import type { TroupeConfig } from './load-files.js';
import { secretPresence, type SecretSources } from './secrets.js';

export interface ValidateOptions {
  /** Dove cercare le chiavi. Il validatore chiede solo se ci sono, mai quali sono (D25). */
  secrets?: SecretSources;
  /** Per la freschezza dei prezzi: iniettabile, così i test non dipendono dalla data di oggi. */
  now?: Date;
  /** In `test` le chiavi non servono (§4.6 punto 5), come con il fornitore finto. */
  environment?: ConfigEnvironment;
}

/** Oltre questi giorni un prezzo verificato è vecchio e va ricontrollato (§4.6 punto 6). */
const PRICE_MAX_AGE_DAYS = 30;

/**
 * I controlli di architettura §4.6 su una configurazione già letta (la struttura, punto 1, l'hanno
 * già garantita gli schemi al caricamento). Le istruzioni, punto 4, le controlla
 * `validateInstructions`, perché devono leggere i file.
 *
 * Un ruolo spento non blocca niente: i suoi riferimenti si controllano comunque, perché un refuso
 * resta un refuso, ma non si pretende che il suo servizio sia utilizzabile oggi (nel seme
 * `composer` aspetta il fornitore della musica, T5.4).
 */
export function validateConfig(config: TroupeConfig, options: ValidateOptions = {}): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  for (const [roleId, role] of Object.entries(config.roles)) {
    if (role === undefined) continue;
    checkRole(roleId, role, config, issues);
  }

  checkSecrets(config, options, issues);
  checkPrices(config, options, issues);
  checkFeatures(config, issues);

  return issues;
}

/** Punti 2, 3, 7 e 9: riferimenti, parametri, stato e capacità dei modelli di un ruolo. */
function checkRole(
  roleId: string,
  role: RoleConfigEntry,
  config: TroupeConfig,
  issues: ConfigIssue[],
): void {
  const active = role.enabled !== false;
  const modelIds = role.model !== undefined ? [role.model] : (role.routing?.candidates ?? []);

  if (role.prompt_from !== undefined) checkPromptFrom(roleId, role.prompt_from, config, issues);

  for (const modelId of modelIds) {
    const model = config.models[modelId];
    if (model === undefined) {
      issues.push({
        severity: 'error',
        code: 'unknown_model',
        message: `Il ruolo "${roleId}" usa il servizio "${modelId}", che non è nel catalogo.`,
        section: 'roles',
        key: roleId,
        role: roleId,
        modelId,
        field: role.model !== undefined ? 'model' : 'routing.candidates',
      });
      continue;
    }

    if (model.kind !== role.kind) {
      issues.push({
        severity: 'error',
        code: 'model_kind_mismatch',
        message: `Il ruolo "${roleId}" è di tipo ${role.kind} ma il servizio "${modelId}" è di tipo ${model.kind}.`,
        section: 'roles',
        key: roleId,
        role: roleId,
        modelId,
        field: 'kind',
      });
    }

    checkConnection(roleId, modelId, model, config.connections[model.connection], active, issues);
    checkStatus(roleId, modelId, model, active, issues);
    checkParams(roleId, role, modelId, model, issues);
  }

  checkCapabilities(roleId, role, modelIds, config, issues);
}

/** Punto 2: `prompt_from` punta a un ruolo LLM che restituisce un prompt visivo. */
function checkPromptFrom(
  roleId: string,
  promptFrom: string,
  config: TroupeConfig,
  issues: ConfigIssue[],
): void {
  const source = config.roles[promptFrom];
  const io = ROLE_IO[promptFrom as RoleId] as (typeof ROLE_IO)[RoleId] | undefined;

  if (source === undefined || io === undefined) {
    issues.push({
      severity: 'error',
      code: 'unknown_prompt_from',
      message: `Il ruolo "${roleId}" prende il prompt da "${promptFrom}", che non è un ruolo della configurazione.`,
      section: 'roles',
      key: roleId,
      role: roleId,
      field: 'prompt_from',
    });
    return;
  }

  // Che restituisca un prompt visivo lo dice il suo schema di output, non un elenco nel codice.
  const output = 'output' in io ? io.output : undefined;
  if (io.kind !== 'llm' || output === undefined || !output.safeParse({ prompt: 'x' }).success) {
    issues.push({
      severity: 'error',
      code: 'prompt_from_not_visual',
      message: `Il ruolo "${roleId}" prende il prompt da "${promptFrom}", che non scrive un prompt visivo.`,
      section: 'roles',
      key: roleId,
      role: roleId,
      field: 'prompt_from',
    });
  }
}

/** Punto 2: ogni modello usato da un ruolo attivo sta su una connessione attiva. */
function checkConnection(
  roleId: string,
  modelId: string,
  model: ModelEntry,
  connection: Connection | undefined,
  activeRole: boolean,
  issues: ConfigIssue[],
): void {
  if (connection === undefined) {
    issues.push({
      severity: 'error',
      code: 'unknown_connection',
      message: `Il servizio "${modelId}" del ruolo "${roleId}" usa la connessione "${model.connection}", che non esiste.`,
      section: 'models',
      key: modelId,
      role: roleId,
      modelId,
      connectionId: model.connection,
      field: 'connection',
    });
    return;
  }

  if (!connection.enabled && activeRole) {
    issues.push({
      severity: 'error',
      code: 'connection_disabled',
      message: `Il ruolo "${roleId}" usa il servizio "${modelId}", la cui connessione "${model.connection}" è spenta.`,
      section: 'models',
      key: modelId,
      role: roleId,
      modelId,
      connectionId: model.connection,
      field: 'enabled',
    });
  }
}

/** Punto 7: nessun ruolo usa modelli `retired`; i `testing` avvisano. */
function checkStatus(
  roleId: string,
  modelId: string,
  model: ModelEntry,
  activeRole: boolean,
  issues: ConfigIssue[],
): void {
  if (model.status === 'retired') {
    issues.push({
      severity: 'error',
      code: 'model_retired',
      message: `Il ruolo "${roleId}" usa il servizio "${modelId}", che è ritirato.`,
      section: 'roles',
      key: roleId,
      role: roleId,
      modelId,
      field: 'status',
    });
    return;
  }

  if (model.status === 'testing' && activeRole) {
    issues.push({
      severity: 'warning',
      code: 'model_testing',
      message: `Il ruolo "${roleId}" usa il servizio "${modelId}", ancora da provare: id e prezzo vanno verificati.`,
      section: 'roles',
      key: roleId,
      role: roleId,
      modelId,
      field: 'status',
    });
  }
}

/** Punto 3: i `params` del ruolo sono accettati da *ogni* modello che può servirlo, con i limiti. */
function checkParams(
  roleId: string,
  role: RoleConfigEntry,
  modelId: string,
  model: ModelEntry,
  issues: ConfigIssue[],
): void {
  for (const [name, value] of Object.entries(role.params ?? {})) {
    const spec = model.params?.[name];
    if (spec === undefined) {
      issues.push({
        severity: 'error',
        code: 'param_not_accepted',
        message: `Il servizio "${modelId}" non accetta il parametro "${name}" del ruolo "${roleId}".`,
        section: 'roles',
        key: roleId,
        role: roleId,
        modelId,
        field: `params.${name}`,
      });
      continue;
    }

    const problem =
      'values' in spec
        ? spec.values.includes(value)
          ? undefined
          : `i valori ammessi sono ${spec.values.map(String).join(', ')}`
        : outOfRange(value, spec);

    if (problem !== undefined) {
      issues.push({
        severity: 'error',
        code: 'param_out_of_limits',
        message: `Il parametro "${name}" del ruolo "${roleId}" vale ${String(value)}, ma per il servizio "${modelId}" ${problem}.`,
        section: 'roles',
        key: roleId,
        role: roleId,
        modelId,
        field: `params.${name}`,
      });
    }
  }
}

function outOfRange(
  value: string | number | boolean,
  spec: { min?: number; max?: number },
): string | undefined {
  if (typeof value !== 'number') return 'serve un numero';
  if (spec.min !== undefined && value < spec.min) return `il minimo è ${String(spec.min)}`;
  if (spec.max !== undefined && value > spec.max) return `il massimo è ${String(spec.max)}`;
  return undefined;
}

/**
 * Punto 9: un ruolo che richiede una capacità ha almeno un candidato che la dichiara vera. Oggi
 * `retoucher` e il modo `end_frame` dello storyboard chiedono `image_edit` (§4.6).
 */
function checkCapabilities(
  roleId: string,
  role: RoleConfigEntry,
  modelIds: readonly string[],
  config: TroupeConfig,
  issues: ConfigIssue[],
): void {
  if (role.enabled === false) return;
  if (roleId !== 'retoucher' && roleId !== 'storyboard_artist') return;

  const canEdit = modelIds.some((modelId) => {
    const model = config.models[modelId];
    return model?.kind === 'image' && model.capabilities.image_edit === true;
  });

  if (!canEdit) {
    issues.push({
      severity: 'error',
      code: 'missing_capability',
      message: `Il ruolo "${roleId}" ha bisogno di un servizio che modifica un'immagine data (image_edit), ma nessuno dei suoi lo dichiara.`,
      section: 'roles',
      key: roleId,
      role: roleId,
      field: 'capabilities.image_edit',
    });
  }
}

/** Punto 5: le chiavi delle connessioni attive, tranne in test e con il fornitore finto. */
function checkSecrets(
  config: TroupeConfig,
  options: ValidateOptions,
  issues: ConfigIssue[],
): void {
  if (options.environment === 'test') return;

  for (const [connectionId, connection] of Object.entries(config.connections)) {
    if (!connection.enabled || connection.adapter === 'fake') continue;

    for (const field of ['api_key', 'http_proxy'] as const) {
      const ref = connection[field];
      if (ref === undefined) continue;

      const presence = secretPresence(ref, options.secrets);
      if (presence?.satisfied === true) continue;

      const name = presence?.parsed.kind === 'none' ? undefined : presence?.parsed.name;
      issues.push({
        severity: 'error',
        code: 'secret_missing',
        message:
          presence === undefined
            ? `La connessione "${connectionId}" ha un ${field} che non è un riferimento ammesso: solo env:NOME, env:NOME?, secret:NOME o none.`
            : `La connessione "${connectionId}" è attiva ma la chiave ${name ?? ref} non c'è.`,
        section: 'connections',
        key: connectionId,
        connectionId,
        field,
      });
    }
  }
}

/** Punto 6: avviso se la verifica di un prezzo ha più di 30 giorni. */
function checkPrices(config: TroupeConfig, options: ValidateOptions, issues: ConfigIssue[]): void {
  const now = options.now ?? new Date();

  for (const [modelId, model] of Object.entries(config.models)) {
    const checked = Date.parse(`${model.pricing.checked}T00:00:00Z`);
    if (Number.isNaN(checked)) continue;

    const days = Math.floor((now.getTime() - checked) / 86_400_000);
    if (days > PRICE_MAX_AGE_DAYS) {
      issues.push({
        severity: 'warning',
        code: 'price_stale',
        message: `Il prezzo del servizio "${modelId}" è stato verificato ${String(days)} giorni fa: ricontrollalo prima di spendere.`,
        section: 'models',
        key: modelId,
        modelId,
        field: 'pricing.checked',
      });
    }
  }
}

/** Punto 8: le funzioni accese hanno i servizi che richiedono. */
function checkFeatures(config: TroupeConfig, issues: ConfigIssue[]): void {
  if (config.features.real_people) {
    for (const [roleId, role] of Object.entries(config.roles)) {
      if (role === undefined || role.kind !== 'video' || role.enabled === false) continue;

      const modelIds = role.model !== undefined ? [role.model] : (role.routing?.candidates ?? []);
      const acceptsRealFaces = modelIds.some((modelId) => {
        const model = config.models[modelId];
        return (
          model?.kind === 'video' &&
          (model.capabilities.real_faces === 'verified_assets' ||
            model.capabilities.real_faces === 'allowed')
        );
      });

      if (!acceptsRealFaces) {
        issues.push({
          severity: 'error',
          code: 'real_people_without_model',
          message: `La funzione real_people è accesa, ma il ruolo "${roleId}" non ha nessun servizio che accetta volti reali verificati.`,
          section: 'features',
          key: 'real_people',
          role: roleId,
        });
      }
    }
  }

  if (config.features.keyframes) {
    const hasFirstAndLast = Object.values(config.models).some(
      (model) =>
        model.kind === 'video' && model.capabilities.input_modes.includes('first_frame+last_frame'),
    );
    if (!hasFirstAndLast) {
      issues.push({
        severity: 'error',
        code: 'keyframes_without_model',
        message:
          'La funzione keyframes è accesa, ma nel catalogo non c\'è nessun servizio video che accetta primo e ultimo fotogramma.',
        section: 'features',
        key: 'keyframes',
      });
    }
  }
}
