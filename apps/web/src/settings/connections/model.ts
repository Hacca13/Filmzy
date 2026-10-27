import {
  modelGroupForKind,
  type ConnectionsOverview,
  type ModelGroup,
  type ProviderState,
  type ServiceState,
} from '@filmzy/contracts';

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

export interface MergedProvider {
  /** Il fornitore con i servizi di **tutti** i gruppi in cui compare, senza doppioni. */
  provider: ProviderState;
  /** I gruppi in cui compare, e se in ognuno c'è già un fornitore «di solito». */
  groups: { group: ModelGroup; hasDefault: boolean }[];
}

/**
 * I fornitori accesi, ognuno una volta sola: fal compare in «Immagini» e in «Video», ma per chi lo
 * collega la prima volta è un fornitore solo, con una chiave sola (procedura del primo avvio).
 */
export function mergedProviders(overview: ConnectionsOverview): MergedProvider[] {
  const byId = new Map<string, MergedProvider>();

  for (const group of overview.groups) {
    for (const provider of group.providers) {
      if (!provider.enabled) continue;

      const entry = { group: group.group, hasDefault: group.defaultConnectionId !== undefined };
      const known = byId.get(provider.connectionId);
      if (known === undefined) {
        byId.set(provider.connectionId, { provider, groups: [entry] });
        continue;
      }

      const seen = new Set(known.provider.services.map((service) => service.modelId));
      known.provider = {
        ...known.provider,
        services: [
          ...known.provider.services,
          ...provider.services.filter((service) => !seen.has(service.modelId)),
        ],
      };
      known.groups.push(entry);
    }
  }
  return [...byId.values()];
}

/** C'è almeno un fornitore collegato davvero: acceso, con la chiave e un servizio attivato. */
export function hasLinkedProvider(overview: ConnectionsOverview): boolean {
  return overview.groups.some((group) =>
    group.providers.some(
      (provider) =>
        provider.enabled &&
        (!provider.keyRequired || provider.key?.present === true) &&
        provider.services.some((service) => service.enabled && service.usable),
    ),
  );
}

/** I gruppi in cui compare un servizio: il suo tipo, e «Lettura immagini» se sa leggerle. */
export function serviceGroups(service: ServiceState): ModelGroup[] {
  return service.vision
    ? [modelGroupForKind(service.kind), 'vision']
    : [modelGroupForKind(service.kind)];
}
