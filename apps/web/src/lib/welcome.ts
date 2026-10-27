/**
 * «Salta per ora» della procedura di benvenuto: si ricorda sul computer (non va a nessuno, D29). Il
 * browser può rifiutare l'archivio (finestra privata, dati bloccati): in quel caso la procedura si
 * ripropone, che è il comportamento prudente.
 */
const KEY = 'filmzy.benvenuto.saltato';

export function isWelcomeSkipped(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Archivio non disponibile: come se non l'avesse mai saltata.
    return false;
  }
}

export function skipWelcome(): void {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // Non si riesce a ricordarlo: la procedura si ripresenterà, e non è un guaio.
  }
}
