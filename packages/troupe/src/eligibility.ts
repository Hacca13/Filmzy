import type { Connection, ModelEntry, RoleConfigEntry } from '@filmzy/contracts';

export interface ParamProblem {
  name: string;
  /** Perché non va, da mettere in coda al messaggio: «…, ma per il servizio X il massimo è 1». */
  problem: string;
}

/**
 * I parametri del ruolo che il modello non accetta (architettura §4.6 punto 3). Lo usano sia il
 * validatore della configurazione sia il router: il controllo è uno solo, così non possono dare
 * risposte diverse.
 */
export function paramProblems(
  params: Record<string, string | number | boolean> | undefined,
  model: ModelEntry,
): ParamProblem[] {
  const problems: ParamProblem[] = [];

  for (const [name, value] of Object.entries(params ?? {})) {
    const spec = model.params?.[name];
    if (spec === undefined) {
      problems.push({ name, problem: 'non lo accetta' });
      continue;
    }

    if ('values' in spec) {
      if (!spec.values.includes(value)) {
        problems.push({
          name,
          problem: `i valori ammessi sono ${spec.values.map(String).join(', ')}`,
        });
      }
      continue;
    }

    if (typeof value !== 'number') {
      problems.push({ name, problem: 'serve un numero' });
      continue;
    }
    if (spec.min !== undefined && value < spec.min) {
      problems.push({ name, problem: `il minimo è ${String(spec.min)}` });
      continue;
    }
    if (spec.max !== undefined && value > spec.max) {
      problems.push({ name, problem: `il massimo è ${String(spec.max)}` });
    }
  }

  return problems;
}

export interface EligibilityInput {
  role: RoleConfigEntry;
  modelId: string;
  model: ModelEntry | undefined;
  connection: Connection | undefined;
  /** I servizi che l'utente ha attivato. Senza impostazioni valgono tutti (§4.3). */
  enabledModelIds?: readonly string[];
}

/**
 * Perché un servizio **non** può servire questo ruolo (architettura §4.8 punto 1): motivi in
 * italiano, già pronti per il messaggio di `no_eligible_model`. Vuoto significa idoneo.
 */
export function ineligibilityReasons(input: EligibilityInput): string[] {
  const { role, modelId, model, connection, enabledModelIds } = input;
  const reasons: string[] = [];

  if (model === undefined) return [`il servizio "${modelId}" non è nel catalogo`];
  if (model.kind !== role.kind) {
    reasons.push(`è di tipo ${model.kind} e il ruolo è di tipo ${role.kind}`);
  }
  if (model.status === 'retired') reasons.push('è ritirato');
  if (connection === undefined) {
    reasons.push(`la sua connessione "${model.connection}" non esiste`);
  } else if (!connection.enabled) {
    reasons.push(`la sua connessione "${model.connection}" è spenta`);
  }
  if (enabledModelIds !== undefined && !enabledModelIds.includes(modelId)) {
    reasons.push('non è tra i servizi attivati');
  }
  for (const { name, problem } of paramProblems(role.params, model)) {
    reasons.push(`il parametro "${name}" ${problem}`);
  }

  return reasons;
}
