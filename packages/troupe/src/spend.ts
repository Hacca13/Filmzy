import type { GenerationContext, SpendBreach } from '@filmzy/contracts';

import { ProviderError } from './provider-error.js';

/**
 * Il controllo dei limiti di spesa (D30, D36), prima di ogni chiamata a un fornitore. La troupe non
 * legge gli scontrini né le scelte dell'utente (architettura §3): chiede a chi gliel'ha passato
 * (`SpendGuard`), che li conosce.
 *
 * I limiti sono **impostazioni, non muri**: senza nessun limite acceso non si blocca niente, e
 * superato uno l'utente decide se alzarlo o proseguire (`ctx.spendConfirmed`).
 */
export interface SpendCheckInput {
  connectionId: string;
  modelId: string;
  projectId?: string;
  /** Quanto costerebbe questa chiamata, stimato: è ciò che si aggiunge a quanto già speso. */
  estimatedCostUsd: number;
}

export interface SpendGuard {
  /** Il primo limite che la chiamata supererebbe, se ce n'è uno. */
  check(input: SpendCheckInput): Promise<SpendBreach | undefined>;
}

/**
 * Se un limite verrebbe superato e l'utente non ha già detto di proseguire, ferma la chiamata con
 * `spend_cap_reached` **prima** di spendere e prima di scrivere lo scontrino (nessun fornitore è
 * stato chiamato). L'errore porta il limite, quanto già speso e la stima: servono a chiedere
 * all'utente se alzarlo o proseguire.
 */
export async function enforceSpend(
  guard: SpendGuard | undefined,
  ctx: GenerationContext,
  input: SpendCheckInput & { role: string },
): Promise<void> {
  if (guard === undefined || ctx.spendConfirmed === true) return;

  const breach = await guard.check({
    connectionId: input.connectionId,
    modelId: input.modelId,
    ...(ctx.projectId === undefined ? {} : { projectId: ctx.projectId }),
    estimatedCostUsd: input.estimatedCostUsd,
  });
  if (breach === undefined) return;

  throw new ProviderError(
    'spend_cap_reached',
    false,
    `Questa generazione costerebbe circa ${input.estimatedCostUsd.toFixed(4)} $ e supera il limite "${breach.limit}" (${breach.limitUsd.toFixed(2)} $, già speso ${breach.spentUsd.toFixed(2)} $).`,
    {
      role: input.role,
      modelId: input.modelId,
      connectionId: input.connectionId,
      spend: breach,
    },
  );
}
