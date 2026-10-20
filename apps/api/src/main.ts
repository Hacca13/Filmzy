import { LOCAL_API_HOST, readApiPort } from '@filmzy/contracts';
import { Logger } from '@nestjs/common';

import { loadEnvFileIfPresent } from './config/load-env-file.js';
import { createApp } from './create-app.js';

// Solo per lo sviluppo: il file `.env` sta nella radice del repository, tre livelli sopra `dist/`.
loadEnvFileIfPresent(new URL('../../../.env', import.meta.url));

const logger = new Logger('Filmzy');

async function bootstrap(): Promise<void> {
  const port = readApiPort(process.env);
  const app = await createApp();
  await app.listen(port, LOCAL_API_HOST);
  logger.log(`Server locale pronto su http://${LOCAL_API_HOST}:${String(port)}`);
}

bootstrap().catch((error: unknown) => {
  // Mostra il motivo (per esempio una porta non valida) e termina con un codice di errore.
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
