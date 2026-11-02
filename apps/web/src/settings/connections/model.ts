import type { ConnectionsOverview } from '@filmzy/contracts';

/** Le piccole decisioni delle pagine dei fornitori, fuori dai componenti così si provano a parte. */

/**
 * I servizi attivati di un fornitore, in **tutti** i gruppi in cui compare. Il server chiede
 * l'elenco intero dei servizi attivati del fornitore: la scheda di un gruppo ne mostra solo una
 * parte, e cambiandone uno non si devono spegnere gli altri.
 */
export function enabledServiceIds(overview: ConnectionsOverview, connectionId: string): string[] {
  const ids = overview.groups.flatMap((group) =>
    group.providers
      .filter((provider) => provider.connectionId === connectionId)
      .flatMap((provider) => provider.services.filter((service) => service.enabled))
      .map((service) => service.modelId),
  );
  return [...new Set(ids)];
}

/** L'elenco dei servizi attivati dopo aver acceso o spento `modelId`. */
export function withServiceToggled(
  current: readonly string[],
  modelId: string,
  on: boolean,
): string[] {
  const others = current.filter((id) => id !== modelId);
  return on ? [...others, modelId] : others;
}

/**
 * Un importo scritto a mano: «25», «25,5», «12.50». Vuoto vuol dire «nessun limite» (`null`);
 * qualcosa che non è un importo positivo è `undefined`, e il pulsante resta spento.
 */
export function parseUsd(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const amount = Number(trimmed.replace(',', '.'));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

/** Il numero com'è scritto nel campo del limite: virgola decimale, come si legge in italiano. */
export function usdToField(amount: number | undefined): string {
  return amount === undefined ? '' : String(amount).replace('.', ',');
}
