import type { ImageProblem, ModerationRejection } from '@filmzy/contracts';

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
  spend_cap_reached:
    'Questa operazione supera un limite di spesa che hai scelto. Puoi cambiarlo in «Spese e tetti».',
  media_failed:
    'Non riesco a leggere questo video. Prova con un altro momento, o genera il video di nuovo.',
  image_rejected:
    'Non posso usare questa foto. Prova con la foto di un luogo o di un oggetto, senza persone né marchi.',
};

/**
 * Il «no» del moderatore a un testo (T3.3): il motivo e, se c'è, come riformularlo. Sono frasi che
 * il moderatore scrive già in parole semplici e nella lingua del film, quindi si mostrano così.
 */
function describeModeration({ reason, suggestion }: ModerationRejection): string {
  const hint = suggestion === undefined ? '' : ` Suggerimento: ${suggestion}`;
  return `Questo testo non si può usare. ${reason}${hint}`;
}

/** La frase per un codice del dominio, se c'è (ad esempio il motivo per cui un'immagine è fallita). */
export function describeCode(code: string | undefined): string | undefined {
  return code === undefined ? undefined : BY_SERVER_CODE[code];
}

/** Le richieste sbagliate che hanno una frase propria, per campo (T3.8, T3.9). */
const BY_INVALID_FIELD: Record<string, string> = {
  // Il cast o i luoghi sono cambiati dopo l'ultimo controllo del riepilogo.
  answers:
    'Le differenze fra la bozza e le tue scelte sono cambiate. Ho aggiornato il riepilogo: controlla le risposte e riprova.',
  locations: 'Aggiungi almeno un luogo al film prima di pensare le inquadrature.',
  // Lo storyboard (T4.1): il piano è cambiato dopo, oppure un tentativo sta ancora lavorando.
  plan: 'Dopo aver pensato le inquadrature è cambiato qualcosa. Rifalle, poi crea lo storyboard.',
  storyboard: 'Lo storyboard di questa inquadratura è già in lavorazione. Aspetta che finisca.',
  // Il video (T4.3): un take sta ancora lavorando.
  takes: 'Un video di questa inquadratura è già in lavorazione. Aspetta che finisca.',
  // Le immagini dell'inquadratura (T4.2).
  images:
    'Questa combinazione di immagini non va: un solo primo e un solo ultimo fotogramma, e poche immagini di ispirazione.',
  assetId: 'Questa immagine non è tra quelle di questa inquadratura. Aggiorna la pagina e riprova.',
  firstFrame: "Imposta prima il primo fotogramma: l'ultimo si ricava da quello.",
  takeId: 'Questo video non c’è più o non è riuscito. Aggiorna la pagina e riprova.',
  atS: 'Questo momento è oltre la fine del video. Scegline uno prima.',
  file: 'Questo file non è una foto che posso usare. Vanno bene PNG, JPEG o WebP, fino a 12 MB.',
  locationId: 'Il luogo di questa foto non c’è più. Aggiorna la pagina e riprova.',
  feature: 'Questa funzione è spenta nelle impostazioni.',
  // Il moodboard (T4.10).
  moodboard: 'Le immagini del moodboard sono già in lavorazione. Aspetta che finiscano.',
  screenplay: 'Scrivi prima la storia: il moodboard parte da lì.',
  // Il controllo della storia (T5.2).
  shots:
    'Non c’è ancora niente da controllare: pensa le inquadrature di almeno una scena (o rifai quelle da rifare).',
  check: 'Il controllo della storia è già in corso. Aspetta che finisca.',
  mask: 'Dipingi prima la zona da ritoccare.',
  sceneId: 'Questa scena non c’è più nella storia. Aggiorna la pagina e riprova.',
  image: 'Questa immagine non si può ritoccare qui. Aggiorna la pagina e riprova.',
  unchecked:
    'Questa foto è stata caricata senza controllo e non si può ritoccare. Riaccendi il controllo delle foto in Prudenza e caricala di nuovo.',
  instruction:
    'Il campo di testo serve per «Sostituisci» e «Cambia colore», non per «Togli». Controlla cosa hai scritto.',
};

/** Perché una foto si rifiuta, una frase per ogni motivo (D19): il server dice quali, qui si dicono in parole semplici. */
const IMAGE_PROBLEM_TEXT: Record<ImageProblem, string> = {
  people: 'ci sono delle persone (i personaggi li crea Filmzy: tu carichi luoghi e oggetti)',
  brand: 'si vede un marchio o un logo',
  known_character: 'c’è un personaggio noto o protetto',
  minor: 'c’è un minore',
  explicit: 'il contenuto non è adatto',
  other: 'c’è qualcosa che non si può usare',
};

/** «Non posso usare questa foto: ci sono delle persone e si vede un marchio. Prova con…» */
export function describeImageProblems(problems: readonly ImageProblem[]): string {
  const reasons = problems.map((problem) => IMAGE_PROBLEM_TEXT[problem]);
  const list =
    reasons.length <= 1
      ? (reasons[0] ?? '')
      : `${reasons.slice(0, -1).join(', ')} e ${reasons[reasons.length - 1] ?? ''}`;
  return `Non posso usare questa foto: ${list}. Prova con la foto di un luogo o di un oggetto, senza persone né marchi.`;
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'network_error') {
      return 'Filmzy non risponde. Chiudi il programma e riaprilo.';
    }
    const imageProblems = error.details?.imageProblems;
    if (
      error.serverCode === 'image_rejected' &&
      imageProblems !== undefined &&
      imageProblems.length > 0
    ) {
      return describeImageProblems(imageProblems);
    }
    const moderation = error.details?.moderation;
    if (error.serverCode === 'content_rejected' && moderation !== undefined) {
      return describeModeration(moderation);
    }
    // Una richiesta sbagliata che l'utente può sistemare: la frase dice cosa manca invece di «controlla i campi».
    if (error.serverCode === 'invalid_request') {
      const field = error.details?.field;
      const specific = field === undefined ? undefined : BY_INVALID_FIELD[field];
      if (specific !== undefined) return specific;
    }
    const known = error.serverCode === undefined ? undefined : BY_SERVER_CODE[error.serverCode];
    if (known !== undefined) return known;
  }
  return 'Qualcosa è andato storto. Riprova tra un attimo.';
}
