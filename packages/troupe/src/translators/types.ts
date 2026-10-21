import type { ModelEntry, RoleId } from '@filmzy/contracts';

import type { MediaInput, MediaRequest } from '../adapters/types.js';

/**
 * Quello che un traduttore riceve: il prompt visivo scritto dal direttore della fotografia, le
 * immagini che entrano e i parametri già risolti del ruolo (architettura §4.7).
 */
export interface TranslateInput {
  role: RoleId;
  /** La voce del catalogo che lavorerà: serve allo scontrino, che dice chi ha fatto il lavoro. */
  modelId: string;
  /** Il prompt in inglese, con i personaggi indicati da segnaposto `[[char:id]]`. */
  prompt: string;
  negativePrompt?: string;
  /** Le immagini, nell'ordine in cui vanno citate: è l'ordine che il prompt presume. */
  inputs: MediaInput[];
  /** I personaggi citati dal prompt, in ordine: il primo è `[[char:…]]` numero 1. */
  characterIds: string[];
  durationS?: number;
  params: Record<string, string | number | boolean>;
  /** Vero se la richiesta porta il volto di una persona reale (D4): lo controlla `check`. */
  realFaces?: boolean;
  /** Vero se in scena c'è un minore: alcuni servizi lo vietano. */
  minors?: boolean;
  idempotencyKey: string;
}

export interface TranslateIssue {
  /** Perché questo servizio non va bene per questa richiesta, in italiano. */
  reason: string;
  /** Il campo o la capacità che non torna, per l'interfaccia. */
  field?: string;
}

/**
 * Un traduttore per **famiglia** di modelli, non per modello (architettura §4.7): sostituisce i
 * segnaposto dei personaggi con la sintassi della famiglia, mette le immagini nei campi giusti,
 * porta durata, formato e risoluzione ai valori ammessi e costruisce il corpo della richiesta.
 */
export interface Translator {
  family: string;
  /** Cosa impedisce a questo servizio di servire la richiesta. Vuoto significa che va bene. */
  check(input: TranslateInput, model: ModelEntry): TranslateIssue[];
  build(input: TranslateInput, model: ModelEntry): MediaRequest;
}
