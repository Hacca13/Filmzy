/** Vero se l'errore dice che il file non esiste (e non, per esempio, che non si può leggere). */
function isFileMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

/**
 * Carica le variabili da un file `.env`, se c'è. Serve in sviluppo; le variabili già impostate
 * nell'ambiente (per esempio quelle della CI) hanno la precedenza sul file.
 * Un file assente non è un errore: il file `.env` è facoltativo.
 */
export function loadEnvFileIfPresent(fileUrl: URL): void {
  try {
    process.loadEnvFile(fileUrl);
  } catch (error) {
    if (!isFileMissing(error)) {
      throw error;
    }
  }
}
