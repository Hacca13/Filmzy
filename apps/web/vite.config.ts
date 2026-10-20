import { LOCAL_API_HOST, readApiPort } from '@filmzy/contracts';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // In sviluppo l'interfaccia chiama `/api/...` sulla propria porta e Vite inoltra al server
    // locale: così il browser vede una sola origine e non serve abilitare CORS.
    proxy: {
      '/api': `http://${LOCAL_API_HOST}:${String(readApiPort(process.env))}`,
    },
  },
});
