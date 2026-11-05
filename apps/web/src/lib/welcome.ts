/**
 * «Salta per ora» della procedura di benvenuto: si ricorda sul computer (non va a nessuno, D29). Il
 * browser può rifiutare l'archivio (finestra privata, dati bloccati): allora vale finché il programma
 * resta aperto, altrimenti «Salta» riporterebbe qui per sempre. Al prossimo avvio la procedura si ripropone.
 */
const KEY = 'filmzy.benvenuto.saltato';

let skippedNow = false;

export function isWelcomeSkipped(): boolean {
  if (skippedNow) return true;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Archivio non disponibile: come se non l'avesse mai saltata.
    return false;
  }
}

export function skipWelcome(): void {
  skippedNow = true;
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // Non si riesce a ricordarlo: la procedura si ripresenterà al prossimo avvio, e non è un guaio.
  }
}
