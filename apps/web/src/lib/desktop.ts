/**
 * L'interfaccia gira dentro Filmzy per computer (T6.4), non in un browser qualunque: lì la finestra si può
 * chiudere da un pulsante. Nel browser di sviluppo `window.close()` non farebbe niente, e il pulsante non c'è.
 */
export function isDesktopApp(userAgent: string = navigator.userAgent): boolean {
  return userAgent.includes('Electron/');
}

export function closeDesktopApp(): void {
  window.close();
}
