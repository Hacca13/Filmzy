import type { Connection, ModelEntry, ModelOption, UserSettings } from '@filmzy/contracts';
import { modelGroupForKind } from '@filmzy/contracts';

import type { TroupeConfig } from './config/load-files.js';
import { mediaCostUsd } from './cost.js';
import { ineligibilityReasons } from './eligibility.js';
import { ProviderError } from './provider-error.js';
import { allowedDuration, allowedValue } from './translators/common.js';
import { translator } from './translators/index.js';
import type { TranslateInput, Translator } from './translators/types.js';

/**
 * Il router (architettura §4.8): filtra i candidati, li mette in fila secondo la politica e
 * restituisce il **principale**. Gli altri non sono riserve: se il servizio fallisce il lavoro si
 * ferma e decide l'utente (D36). A parità di richiesta, di release e di scelte dell'utente il
 * risultato è sempre lo stesso.
 */

export interface RouteInput {
  roleId: string;
  config: TroupeConfig;
  settings?: UserSettings;
  /** La richiesta, perché i limiti dipendono da essa: durata, immagini, personaggi. */
  request: Omit<TranslateInput, 'modelId'>;
  /** Il servizio che l'utente ha scelto per questa generazione (D36): è un requisito. */
  chosenModelId?: string;
}

export interface RoutedModel {
  modelId: string;
  model: ModelEntry;
  connection: Connection;
  translator: Translator;
  estimatedCostUsd: number | undefined;
}

export function route(input: RouteInput): RoutedModel {
  const { eligible, rejected } = evaluate(input);
  const chosen = eligible[0];

  if (chosen === undefined) {
    throw new ProviderError(
      'no_eligible_model',
      false,
      input.chosenModelId === undefined
        ? `Nessun servizio può fare questo lavoro per "${input.roleId}": ${rejected.join('; ')}.`
        : `Il servizio "${input.chosenModelId}" non può fare questo lavoro: ${rejected.join('; ')}.`,
      { role: input.roleId, modelId: input.chosenModelId },
    );
  }

  return chosen;
}

/**
 * L'elenco per «Cambia servizio» (architettura §4.8, D36): lo stesso filtro su **tutti** i servizi
 * attivati, con nome, costo stimato e voto delle prove. Non elenca ciò che non passa il filtro; se
 * resta vuoto, il messaggio è quello di `no_eligible_model`.
 */
export function routeOptions(input: RouteInput): ModelOption[] {
  const defaultId = defaultModelId(input);

  return evaluate({ ...input, chosenModelId: undefined, everything: true }).eligible.map(
    (candidate) => ({
      modelId: candidate.modelId,
      label: candidate.model.label,
      estimatedCostUsd: candidate.estimatedCostUsd ?? 0,
      ...(qualityOf(candidate.model) === undefined ? {} : { quality: qualityOf(candidate.model) }),
      isDefault: candidate.modelId === defaultId,
    }),
  );
}

interface EvaluateInput extends RouteInput {
  /** Per «Cambia servizio»: guarda tutti i servizi attivati, non solo i candidati del ruolo. */
  everything?: boolean;
}

function evaluate(input: EvaluateInput): { eligible: RoutedModel[]; rejected: string[] } {
  const role = input.config.roles[input.roleId];
  if (role === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `Il ruolo "${input.roleId}" non è configurato.`,
      { role: input.roleId },
    );
  }

  const enabled = enabledModelIds(input.config, input.settings);
  const eligible: RoutedModel[] = [];
  const rejected: string[] = [];

  for (const modelId of candidateIds(input, role, enabled)) {
    const model = input.config.models[modelId];
    const connection = model === undefined ? undefined : input.config.connections[model.connection];

    const reasons = ineligibilityReasons({
      role,
      modelId,
      model,
      connection,
      enabledModelIds: enabled,
    });

    if (model === undefined || connection === undefined || reasons.length > 0) {
      rejected.push(`"${modelId}" ${reasons.join(', ')}`);
      continue;
    }

    // Un servizio senza traduttore non si può usare, anche se il resto torna (§4.8).
    let family: Translator;
    try {
      family = translator(model.family);
    } catch {
      rejected.push(
        `"${modelId}" non ha un traduttore per la famiglia "${model.family ?? 'nessuna'}"`,
      );
      continue;
    }

    const issues = family.check({ ...input.request, modelId }, model);
    if (issues.length > 0) {
      rejected.push(`"${modelId}" ${issues.map((issue) => issue.reason).join(', ')}`);
      continue;
    }

    eligible.push({
      modelId,
      model,
      connection,
      translator: family,
      estimatedCostUsd: estimate(input.request, model),
    });
  }

  return {
    eligible: order(eligible, role.routing?.policy ?? 'balanced', defaultModelId(input)),
    rejected,
  };
}

/**
 * I candidati da guardare. Il servizio scelto dall'utente si verifica fra **tutti** quelli
 * attivati e del tipo giusto, non solo fra i candidati del ruolo: l'utente può scegliere anche un
 * servizio che quel ruolo non usa di solito (§4.8).
 */
function candidateIds(
  input: EvaluateInput,
  role: { kind: string; model?: string; routing?: { candidates: string[] } },
  enabled: readonly string[],
): string[] {
  if (input.chosenModelId !== undefined) return [input.chosenModelId];

  const sameKind = enabled.filter((id) => input.config.models[id]?.kind === role.kind);
  if (input.everything === true) return sameKind;

  const declared = role.model !== undefined ? [role.model] : (role.routing?.candidates ?? []);
  const preferred = defaultModelId(input);

  // Il predefinito dell'utente, se è del tipo giusto, entra tra i candidati (§4.8 punto 2).
  return preferred !== undefined && sameKind.includes(preferred) && !declared.includes(preferred)
    ? [preferred, ...declared]
    : declared;
}

/** I servizi attivati. Senza impostazioni valgono tutte le voci `active` o `testing` (§4.3). */
function enabledModelIds(config: TroupeConfig, settings: UserSettings | undefined): string[] {
  if (settings !== undefined) return [...settings.enabledModelIds];
  return Object.entries(config.models)
    .filter(([, model]) => model.status !== 'retired')
    .map(([id]) => id);
}

function defaultModelId(input: RouteInput): string | undefined {
  const role = input.config.roles[input.roleId];
  if (role === undefined || input.settings === undefined) return undefined;

  const perRole = input.settings.roleSettings[input.roleId as never] as
    { modelId?: string } | undefined;
  return perRole?.modelId ?? input.settings.defaultModels[modelGroupForKind(role.kind)];
}

/**
 * L'ordine secondo la politica (§4.8 punto 2). Il predefinito dell'utente, se è idoneo, passa in
 * testa: è la sua scelta, non una preferenza nostra. Fra pari resta l'ordine dei candidati, così
 * la stessa richiesta dà sempre lo stesso risultato.
 */
function order(
  candidates: RoutedModel[],
  policy: string,
  preferred: string | undefined,
): RoutedModel[] {
  const score = (candidate: RoutedModel): number => {
    const cost = candidate.estimatedCostUsd ?? 0;
    const quality = qualityOf(candidate.model);

    if (policy === 'cheap') return cost;
    if (policy === 'quality') return -(quality ?? 0);
    // `balanced`: a parità di voto preferisce il meno caro, e un voto alto vale più di un soldo.
    return cost - (quality ?? 0) * 0.5;
  };

  return [...candidates]
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => {
      if (a.candidate.modelId === preferred) return -1;
      if (b.candidate.modelId === preferred) return 1;
      const difference = score(a.candidate) - score(b.candidate);
      return difference !== 0 ? difference : a.index - b.index;
    })
    .map(({ candidate }) => candidate);
}

/**
 * Il voto delle prove (§4.8). Il bench lo scriverà nel catalogo in T4.0: finché non c'è, il
 * servizio non ha voto e la politica si regge sul costo. La scala è una decisione aperta (§13),
 * quindi qui si legge solo un numero sotto `overall`, senza pretendere altra forma.
 */
function qualityOf(model: ModelEntry): number | undefined {
  const overall = model.quality?.overall;
  return typeof overall === 'number' ? overall : undefined;
}

/** Il costo previsto di questa richiesta su questo servizio (architettura §4.1). */
function estimate(request: Omit<TranslateInput, 'modelId'>, model: ModelEntry): number | undefined {
  if (model.kind === 'video') {
    const seconds = allowedDuration(model, request.durationS);
    return mediaCostUsd(model.pricing, { ...(seconds === undefined ? {} : { seconds }) });
  }

  const variants = allowedValue(model, 'variants', request.params.variants);
  return mediaCostUsd(model.pricing, { images: typeof variants === 'number' ? variants : 1 });
}
