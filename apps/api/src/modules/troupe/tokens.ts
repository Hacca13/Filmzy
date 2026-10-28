/**
 * I nomi con cui si iniettano le cose della troupe. Stanno in un file loro perché li usano sia il
 * modulo che li crea sia i servizi che li ricevono, e un import circolare non serve a nessuno.
 */
export const TROUPE_STORE = Symbol('TROUPE_STORE');
export const CONFIG_DIR = Symbol('CONFIG_DIR');
export const TROUPE_ENVIRONMENT = Symbol('TROUPE_ENVIRONMENT');
export const CONFIG_SOURCE = Symbol('CONFIG_SOURCE');
export const TROUPE = Symbol('TROUPE');
/** La troupe che lavora sulla **bozza** (la prova, T2.5): stessa troupe, altra sorgente. */
export const DRAFT_TROUPE = Symbol('DRAFT_TROUPE');
/** Gli scontrini nel database: ogni chiamata a un fornitore ne lascia uno (regola 4). */
export const RECEIPT_STORE = Symbol('RECEIPT_STORE');
/** Il registro della spesa (T3.1): la troupe lo interroga prima di ogni chiamata, le Impostazioni lo mostrano. */
export const SPEND_LEDGER = Symbol('SPEND_LEDGER');
/**
 * Chi crea un esecutore dei lavori delle immagini e dei video (T3.6): i file dei fornitori si copiano
 * subito nella cartella del film (regola d'oro 11), quindi serve una cartella per film.
 */
export const MEDIA_RUNNER_FACTORY = Symbol('MEDIA_RUNNER_FACTORY');
