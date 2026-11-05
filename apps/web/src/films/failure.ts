/**
 * Quando una generazione non riesce (T4.5, D36, D68): un motivo chiaro e una scelta, in parole semplici
 * e mai con un codice (regola 12). Le frasi sono quelle del disegno «Generazione · Errori»; qui si
 * decide anche cosa si può fare, **mai** passare da soli a un altro servizio: dopo un rifiuto del
 * contenuto non si offre né «Riprova» né «Cambia servizio» (non si aggira un rifiuto), negli altri casi
 * l'utente può riprovare o scegliere un altro servizio.
 */

import { JOB_INTERRUPTED } from '@filmzy/contracts';

export type FailureAction =
  /** Un altro tentativo, con il servizio che c'è adesso. */
  | { kind: 'retry' }
  /** «Cambia servizio»: l'elenco con i costi, accanto. */
  | { kind: 'change_service' }
  /** Una pagina delle impostazioni, dove si risolve (chiave, fondi, limite di spesa). */
  | { kind: 'link'; label: string; href: string };

export interface Failure {
  /** Cosa è successo: «Il servizio non risponde». */
  reason: string;
  /** Cosa si può fare: «Riprova più tardi o cambia servizio». */
  advice: string;
  actions: readonly FailureAction[];
  /** Il servizio può aver già iniziato il lavoro: meglio guardare i costi nel suo pannello. */
  mayHaveCost: boolean;
}

const CONNECTIONS = '#/impostazioni/connessioni';
const SPEND = '#/impostazioni/spese';

const retry: FailureAction = { kind: 'retry' };
const changeService: FailureAction = { kind: 'change_service' };

/** Un errore tecnico o sconosciuto: si può riprovare, anche con un altro servizio. */
const TECHNICAL: Failure = {
  reason: 'Non è riuscito',
  advice: 'Puoi riprovare, anche con un altro servizio',
  actions: [retry, changeService],
  mayHaveCost: true,
};

const BY_CODE: Record<string, Failure> = {
  // Il programma si è chiuso prima della fine: non riparte da solo, perché a decidere è chi paga (D84).
  [JOB_INTERRUPTED]: {
    reason: 'Il programma si è chiuso prima che finisse',
    advice: 'Non riparte da solo: rifallo solo se vuoi',
    actions: [retry, changeService],
    mayHaveCost: true,
  },
  provider_auth_failed: {
    reason: 'La chiave non è valida',
    advice: 'Sostituisci la chiave',
    actions: [{ kind: 'link', label: 'Sostituisci la chiave', href: CONNECTIONS }, changeService],
    mayHaveCost: false,
  },
  secret_missing: {
    reason: 'Manca la chiave di questo servizio',
    advice: 'Inseriscila nelle connessioni',
    actions: [{ kind: 'link', label: 'Inserisci la chiave', href: CONNECTIONS }, changeService],
    mayHaveCost: false,
  },
  provider_unavailable: {
    reason: 'Il servizio non risponde',
    advice: 'Riprova più tardi o cambia servizio',
    actions: [retry, changeService],
    mayHaveCost: true,
  },
  timeout: {
    reason: 'Il servizio ci ha messo troppo',
    advice: 'Riprova più tardi o cambia servizio',
    actions: [retry, changeService],
    mayHaveCost: true,
  },
  rate_limited: {
    reason: 'Troppe richieste al servizio',
    advice: 'Aspetta un momento e riprova, o cambia servizio',
    actions: [retry, changeService],
    mayHaveCost: false,
  },
  invalid_output: {
    reason: 'Il servizio ha risposto in un modo che non si capisce',
    advice: 'Riprova o cambia servizio',
    actions: [retry, changeService],
    mayHaveCost: true,
  },
  provider_quota_exhausted: {
    reason: 'I fondi presso il fornitore sono finiti',
    advice: 'Ricarica il conto o cambia servizio',
    actions: [{ kind: 'link', label: 'Apri le connessioni', href: CONNECTIONS }, changeService],
    mayHaveCost: false,
  },
  // «Riprova» passa dal controllo della spesa: se il limite è ancora superato chiede di proseguire o alzarlo.
  spend_cap_reached: {
    reason: 'Hai raggiunto il limite di spesa',
    advice: 'Alza il limite o prosegui',
    actions: [{ kind: 'link', label: 'Alza il limite', href: SPEND }, retry, changeService],
    mayHaveCost: false,
  },
  // Riprovare o cambiare servizio non cambia niente: si dice cosa va sistemato e dove.
  role_disabled: {
    reason: 'Questo ruolo è spento',
    advice: 'Accendilo in «Chi fa cosa»',
    actions: [{ kind: 'link', label: 'Apri «Chi fa cosa»', href: '#/impostazioni/chi-fa-cosa' }],
    mayHaveCost: false,
  },
  config_invalid: {
    reason: 'C’è qualcosa che non va nella configurazione',
    advice: 'Guarda i problemi segnati nelle impostazioni avanzate',
    actions: [
      { kind: 'link', label: 'Apri le impostazioni avanzate', href: '#/impostazioni/avanzate' },
    ],
    mayHaveCost: false,
  },
  secret_store_unavailable: {
    reason: 'Le chiavi si salvano solo nel programma installato',
    advice: 'Per ora mettile nel file .env, come spiegato nel README',
    actions: [],
    mayHaveCost: false,
  },
  // Un'immagine che ffmpeg non sa preparare (T4.9): un altro servizio non cambia niente.
  media_failed: {
    reason: 'Non riesco a preparare l’immagine',
    advice: 'Prova con un’altra immagine o dipingi di nuovo la zona',
    actions: [],
    mayHaveCost: false,
  },
  // Per esempio un fotogramma impostato che non c'è più: un altro tentativo non lo rimette a posto.
  invalid_request: {
    reason: 'La richiesta non si può fare così',
    advice: 'Controlla le immagini impostate: se una non c’è più, cambiala',
    actions: [],
    mayHaveCost: false,
  },
  not_found: {
    reason: 'Non trovo più quello che serviva',
    advice: 'Controlla le immagini impostate e rifai l’inquadratura se serve',
    actions: [],
    mayHaveCost: false,
  },
  no_eligible_model: {
    reason: 'Nessun servizio adatto a questo lavoro',
    advice: 'Attiva un servizio nelle impostazioni, oppure cambia le immagini',
    actions: [{ kind: 'link', label: 'Apri le connessioni', href: CONNECTIONS }],
    mayHaveCost: false,
  },
};

/**
 * Un rifiuto del contenuto: né «Riprova» né «Cambia servizio». Si dice di cambiare la richiesta, e che
 * non si prova un altro servizio per aggirare il rifiuto (D36, regola 6).
 */
const REJECTED: Failure = {
  reason: 'Il servizio ha rifiutato il contenuto',
  advice: 'Cambia la richiesta: non si prova con un altro servizio per aggirare il rifiuto',
  actions: [],
  mayHaveCost: false,
};

/** Cosa dire e cosa offrire per il codice con cui è fallito un tentativo o un take. */
export function failureOf(code: string | undefined): Failure {
  if (code === 'content_rejected' || code === 'image_rejected') return REJECTED;
  return (code === undefined ? undefined : BY_CODE[code]) ?? TECHNICAL;
}

/** La frase unica del disegno: «Il servizio non risponde · Riprova più tardi o cambia servizio». */
export function failureText(code: string | undefined): string {
  const failure = failureOf(code);
  return `${failure.reason} · ${failure.advice}`;
}

/** Dove il servizio può aver già iniziato il lavoro: meglio guardare i costi nel suo pannello. */
export const COST_NOTE =
  'Se il servizio ha già iniziato il lavoro, verifica eventuali costi nel suo pannello.';
