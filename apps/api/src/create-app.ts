import { API_PREFIX } from '@filmzy/contracts';
import type { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { rejectNonLocalAccess } from './security/local-access.js';

/**
 * Crea il server con tutte le impostazioni comuni. Lo usano sia l'avvio vero (`main.ts`) sia i
 * test, così quello che si prova è la stessa configurazione che gira davvero.
 * Non mette il server in ascolto: lo fa chi chiama.
 */
export async function createApp(
  options: Pick<NestApplicationOptions, 'logger'> = {},
): Promise<NestExpressApplication> {
  // `abortOnError: false`: di default Nest, se l'avvio fallisce, interrompe il processo di colpo.
  // Così invece l'errore arriva a chi chiama, che può mostrare un messaggio comprensibile.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...options,
    abortOnError: false,
  });

  // Non dichiarare quale framework c'è dietro: un'informazione in meno per chi cerca falle.
  app.disable('x-powered-by');
  app.use(rejectNonLocalAccess);
  app.setGlobalPrefix(API_PREFIX);
  // Chiude il server in modo ordinato quando il programma viene fermato (Ctrl+C o chiusura).
  app.enableShutdownHooks();

  return app;
}
