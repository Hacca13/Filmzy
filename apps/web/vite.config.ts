import { fileURLToPath } from 'node:url';

import { API_PREFIX, LOCAL_API_HOST, readApiPort } from '@filmzy/contracts';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/** Radice del repository: qui sta il file `.env` che l'interfaccia condivide con il server locale. */
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  // Vite non carica il `.env` della radice dentro `process.env`, mentre il server sì. Lo leggiamo
  // noi, con la stessa precedenza del server (le variabili già nell'ambiente battono il file),
  // altrimenti con una porta personalizzata server e proxy si troverebbero su porte diverse.
  const env = { ...loadEnv(mode, repositoryRoot, 'FILMZY_'), ...process.env };

  return {
    plugins: [react()],
    server: {
      // In sviluppo l'interfaccia chiama `/api/...` sulla propria porta e Vite inoltra al server
      // locale: così il browser vede una sola origine e non serve abilitare CORS.
      proxy: {
        [`/${API_PREFIX}`]: `http://${LOCAL_API_HOST}:${String(readApiPort(env))}`,
      },
    },
  };
});
