import { ApiError } from '../api/client';

/**
 * Cosa dire all'utente quando una chiamata al server non va (regola 12 di CLAUDE.md: parole
 * semplici, mai codici). Il server manda il motivo come codice; la frase sta qui.
 */
const BY_SERVER_CODE: Record<string, string> = {
  secret_store_unavailable:
    'Le chiavi si salvano solo nel programma installato. Per ora mettile nel file .env, come spiegato nel README.',
  invalid_request: 'Qualcosa di quello che hai scritto non va. Controlla i campi e riprova.',
  not_found: 'Non trovo quello che cercavi. Chiudi il programma e riaprilo.',
  config_invalid:
    'C’è qualcosa che non va nella configurazione. Guarda i problemi segnati nella pagina.',
  secret_missing: 'Manca la chiave di questo servizio. Inseriscila nelle connessioni.',
  provider_auth_failed:
    'Il servizio non ha accettato la chiave: potrebbe essere sbagliata o scaduta.',
  provider_quota_exhausted:
    'Il credito presso il servizio è finito, o hai raggiunto il suo limite. Controlla il suo pannello.',
  provider_unavailable: 'Il servizio non risponde adesso. Riprova tra poco.',
  timeout: 'Il servizio ci ha messo troppo a rispondere. Riprova tra poco.',
  rate_limited: 'Troppe richieste al servizio. Aspetta un momento e riprova.',
  content_rejected:
    'Il servizio ha rifiutato il testo. Cambia le istruzioni: non si prova con un altro servizio per aggirarlo.',
  invalid_output: 'Il servizio ha risposto in un modo che non si capisce. Riprova.',
  no_eligible_model:
    'Nessun servizio adatto a questo lavoro. Attivane uno nelle impostazioni, oppure cambia la scelta.',
  role_disabled: 'Questo ruolo è spento. Accendilo per provarlo.',
};

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'network_error') {
      return 'Filmzy non risponde. Chiudi il programma e riaprilo.';
    }
    const known = error.serverCode === undefined ? undefined : BY_SERVER_CODE[error.serverCode];
    if (known !== undefined) return known;
  }
  return 'Qualcosa è andato storto. Riprova tra un attimo.';
}
