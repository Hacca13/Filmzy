import {
  API_PREFIX,
  AUDIO_UPLOAD_CONTENT_TYPES,
  AUDIO_UPLOAD_MAX_BYTES,
  UPLOAD_CONTENT_TYPES,
  UPLOAD_MAX_BYTES,
} from '@filmzy/contracts';
import type { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { JobRunner } from './modules/jobs/job-runner.service.js';

import { AppModule, type AppModuleOptions } from './app.module.js';
import { rejectNonLocalAccess } from './security/local-access.js';

/**
 * Crea il server con tutte le impostazioni comuni. Lo usano sia l'avvio vero (`main.ts`) sia i
 * test, così quello che si prova è la stessa configurazione che gira davvero.
 * Non mette il server in ascolto: lo fa chi chiama.
 */
/**
 * Apre la porta e solo dopo fa partire la coda. L'ordine conta: se un altro Filmzy è già aperto la porta è
 * presa e ci si ferma qui, prima di chiudere come interrotti i lavori che lui sta facendo (D84).
 */
export async function listenAndStart(
  app: NestExpressApplication,
  port: number,
  host: string,
): Promise<void> {
  await app.listen(port, host);
  await app.get(JobRunner, { strict: false }).start();
}

export async function createApp(
  options: Pick<NestApplicationOptions, 'logger'> & AppModuleOptions = {},
): Promise<NestExpressApplication> {
  const { logger, ...moduleOptions } = options;

  // `abortOnError: false`: di default Nest, se l'avvio fallisce, interrompe il processo di colpo.
  // Così invece l'errore arriva a chi chiama, che può mostrare un messaggio comprensibile.
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(moduleOptions), {
    ...(logger === undefined ? {} : { logger }),
    abortOnError: false,
    // Il limite di Nest (100 kb) è troppo stretto per la configurazione intera, che le impostazioni
    // avanzate salvano in una volta. Il server ascolta solo in locale (D35): qui non c'è nessuno
    // da cui difendersi con un limite piccolo.
    bodyParser: false,
  });
  app.useBodyParser('json', { limit: '5mb' });
  // Le foto caricate (T4.8) arrivano come file, non come JSON. Il limite del parser sta sopra quello del
  // servizio, che risponde con un errore del dominio invece di quello grezzo del parser.
  app.useBodyParser('raw', { type: [...UPLOAD_CONTENT_TYPES], limit: UPLOAD_MAX_BYTES * 2 });
  app.useBodyParser('raw', {
    type: [...AUDIO_UPLOAD_CONTENT_TYPES],
    limit: AUDIO_UPLOAD_MAX_BYTES * 2,
  });

  // Non dichiarare quale framework c'è dietro: un'informazione in meno per chi cerca falle.
  app.disable('x-powered-by');
  app.use(rejectNonLocalAccess);
  app.setGlobalPrefix(API_PREFIX);
  // Chiude il server in modo ordinato quando il programma viene fermato (Ctrl+C o chiusura).
  app.enableShutdownHooks();

  return app;
}
