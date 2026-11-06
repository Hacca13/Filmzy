/**
 * Quello che la finestra mostra mentre il server si accende, prima che l'interfaccia ci sia: gli stessi colori
 * della schermata di caricamento (T6.1), così non lampeggia niente di bianco.
 */
export function loadingPage(): string {
  const html = `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'" />
    <title>Filmzy</title>
    <style>
      html, body { height: 100%; margin: 0; background: #111211; color: #f5f1e8; }
      body { display: grid; place-items: center; font: 16px system-ui, sans-serif; }
      p { opacity: 0.8; }
    </style>
  </head>
  <body>
    <p>Sto preparando Filmzy…</p>
  </body>
</html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
