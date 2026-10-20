import type { TroupeConfig } from './load-files.js';

export interface ForbiddenTerm {
  term: string;
  /** Perché è vietato, da mostrare nel messaggio dopo il termine: «"..." è l'id di un servizio…». */
  why: string;
}

/**
 * I termini che non devono comparire nel codice (architettura §3, CLAUDE.md regola d'oro 2): id
 * dei servizi, id presso i fornitori e indirizzi delle connessioni. L'elenco **è il catalogo
 * stesso**, così aggiungere un modello aggiorna anche il controllo, e un id segnaposto (`<...>`)
 * non ci entra, perché non è ancora un id.
 */
export function codeForbiddenTerms(config: TroupeConfig): ForbiddenTerm[] {
  const terms = new Map<string, string>();

  for (const [modelId, model] of Object.entries(config.models)) {
    terms.set(modelId, "è l'id di un servizio del catalogo");
    if (!model.provider_model.startsWith('<')) {
      terms.set(model.provider_model, `è l'id di "${modelId}" presso il fornitore`);
    }
  }

  for (const [connectionId, connection] of Object.entries(config.connections)) {
    if (connection.base_url !== undefined) {
      terms.set(connection.base_url, `è l'indirizzo della connessione "${connectionId}"`);
    }
  }

  return [...terms].map(([term, why]) => ({ term, why }));
}
