import { UPLOAD_CONTENT_TYPES, UPLOAD_MAX_BYTES } from '@filmzy/contracts';

/**
 * Le piccole decisioni del caricamento delle foto (T4.8, D19), fuori dai componenti così si provano a
 * parte. Il controllo vero lo rifà il server: qui si evita solo di mandare un file che sicuramente
 * non va, e di far aspettare per niente.
 */

const MEGABYTE = 1024 * 1024;

/** Quello che serve di un file scelto dall'utente (un `File` del browser lo ha). */
export interface PickedFile {
  name: string;
  type: string;
  size: number;
}

/**
 * Perché un file non si manda, in parole semplici; `undefined` se può andare. Il tipo dichiarato dal
 * browser basta qui: il server guarda i primi byte.
 */
export function fileProblem(file: PickedFile): string | undefined {
  if (!(UPLOAD_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    return 'Questo file non è una foto che posso usare. Vanno bene PNG, JPEG o WebP.';
  }
  if (file.size === 0) return 'Questo file è vuoto.';
  if (file.size > UPLOAD_MAX_BYTES) {
    return `Questa foto è troppo grande: arriva fino a ${String(UPLOAD_MAX_BYTES / MEGABYTE)} MB.`;
  }
  return undefined;
}

/** Il nome della foto: quello del file senza l'estensione, tagliato alla lunghezza che il server accetta. */
export function nameOf(fileName: string): string | undefined {
  const bare = fileName.replace(/\.[^./\\]+$/, '').trim();
  return bare === '' ? undefined : bare.slice(0, 80).trim();
}

/** Cosa si dice mentre la foto viaggia: controllata dal servizio, oppure solo salvata. */
export function workingText(checking: boolean): string {
  return checking ? 'Sto controllando la foto…' : 'Sto salvando la foto…';
}

/**
 * Cosa sa l'utente prima di caricare. Con il controllo acceso una copia della foto va al servizio che
 * legge le immagini (D19): lo si dice. Spento, si dice che nessuno la guarda e dove si cambia.
 */
export function checkingHint(checking: boolean): string {
  return checking
    ? 'Una copia della foto viene inviata al servizio che legge le immagini, per controllare che non ci siano persone, marchi o personaggi noti. Se va bene, resta sul tuo computer.'
    : 'Il controllo delle foto è spento: la foto si salva senza che nessuno la guardi. Puoi riaccenderlo in Impostazioni › Prudenza.';
}
