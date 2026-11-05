import { DatabaseError } from '@filmzy/db';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import path from 'node:path';

import { applyCommonSetup, createApp, listenAndStart } from './create-app.js';
import { openFolder } from './modules/export/export-files.js';
import { BlockedModule, type DataFailure } from './modules/startup/blocked.module.js';

type AppOptions = NonNullable<Parameters<typeof createApp>[0]>;

export interface StartServerOptions {
  port: number;
  host: string;
  appOptions?: AppOptions;
  /** Apre una cartella nel sistema. A parte, così i test non aprono finestre. */
  opener?: (folder: string) => Promise<void>;
}

const log = new Logger('Avvio');

/**
 * Accende il programma (architettura §6.2). Se i dati non si aprono non si spegne: l'interfaccia non saprebbe
 * dire altro che «non riesce a partire». Resta acceso solo per dire perché, finché l'utente chiede di
 * riprovare. Ogni altro errore (per esempio la porta occupata) ferma il programma.
 */
export async function startServer(options: StartServerOptions): Promise<NestExpressApplication> {
  const { port, host, appOptions = {}, opener = openFolder } = options;
  for (;;) {
    try {
      const app = await createApp(appOptions);
      await listenAndStart(app, port, host);
      return app;
    } catch (error) {
      const failure = dataFailureOf(error);
      if (failure === undefined) throw error;
      log.warn(`I dati non si aprono: ${failure.block.reason}.`);
      await serveUntilRetry(failure, { port, host, opener, appOptions });
    }
  }
}

/** Un errore che l'utente può capire e su cui può fare qualcosa. Un'installazione rotta non lo è. */
function dataFailureOf(error: unknown): DataFailure | undefined {
  if (!(error instanceof DatabaseError) || error.code === 'config_invalid') return undefined;
  const { backupFile, file } = error.details ?? {};
  const known = backupFile ?? file;
  return {
    block: {
      reason: error.code,
      ...(backupFile === undefined ? {} : { backupFile }),
      ...(file === undefined ? {} : { file }),
    },
    folder: known === undefined ? undefined : path.dirname(known),
  };
}

/** Finisce quando l'utente chiede di riprovare, con la porta di nuovo libera per il programma vero. */
async function serveUntilRetry(
  failure: DataFailure,
  where: Required<Pick<StartServerOptions, 'port' | 'host' | 'opener'>> & {
    appOptions: AppOptions;
  },
): Promise<void> {
  const { port, host, opener, appOptions } = where;
  let onRetry = (): void => undefined;
  const retried = new Promise<void>((resolve) => {
    onRetry = resolve;
  });

  const app = await NestFactory.create<NestExpressApplication>(
    BlockedModule.register({
      ...failure,
      opener,
      onRetry: () => {
        onRetry();
      },
    }),
    {
      ...(appOptions.logger === undefined ? {} : { logger: appOptions.logger }),
      abortOnError: false,
    },
  );
  applyCommonSetup(app);
  await app.listen(port, host);

  await retried;
  await app.close();
}
