import { API_PREFIX, LOCAL_API_HOST, readApiPort } from '@filmzy/contracts';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Il proxy serve solo al server di sviluppo: per `vite build` e per i test una porta sbagliata
  // nel `.env` non deve far fallire nulla.
  const isDevServer = command === 'serve' && mode !== 'test';

  return {
    plugins: [react()],
    server: {
      // In sviluppo l'interfaccia chiama `/api/...` sulla propria porta e Vite inoltra al server
      // locale: così il browser vede una sola origine e non serve abilitare CORS.
      // La chiave con `^` è un'espressione regolare: inoltra `/api/...` ma non `/apiary` o `/api-docs`.
      proxy: isDevServer
        ? { [`^/${API_PREFIX}/`]: `http://${LOCAL_API_HOST}:${String(readApiPort(process.env))}` }
        : undefined,
    },
  };
});
