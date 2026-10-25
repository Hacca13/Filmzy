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
  config_invalid: 'I valori del programma non si leggono. Reinstalla Filmzy.',
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
