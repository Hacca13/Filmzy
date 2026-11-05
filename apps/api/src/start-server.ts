import { API_PREFIX, type HealthResponse, type StartupBlock } from '@filmzy/contracts';
import { DatabaseError } from '@filmzy/db';
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Logger,
  Module,
  Post,
  type DynamicModule,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import path from 'node:path';

import { createApp, listenAndStart } from './create-app.js';
import { domainError } from './http/domain-error.js';
import { openFolder } from './modules/export/export-files.js';
import { rejectNonLocalAccess } from './security/local-access.js';

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
 * dire altro che «non riesce a partire», e i film sono al sicuro. Resta acceso solo per dire perché, finché
 * l'utente chiede di riprovare. Ogni altro errore (per esempio la porta occupata) ferma il programma.
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

interface DataFailure {
  block: StartupBlock;
  /** La cartella da aprire: quella della copia di sicurezza, che è anche quella dei dati. */
  folder: string | undefined;
}

/** Un errore che l'utente può capire e su cui può fare qualcosa. Un'installazione rotta non lo è. */
function dataFailureOf(error: unknown): DataFailure | undefined {
  if (!(error instanceof DatabaseError)) return undefined;
  if (error.code !== 'database_too_new' && error.code !== 'migration_failed') return undefined;
  const { backupFile, file } = error.details ?? {};
  const known = backupFile ?? file;
  return {
    block: { reason: error.code, ...(backupFile === undefined ? {} : { backupFile }) },
    folder: known === undefined ? undefined : path.dirname(known),
  };
}

interface BlockedState extends DataFailure {
  retrying: boolean;
  retry: () => void;
  opener: (folder: string) => Promise<void>;
}

const BLOCKED_STATE = Symbol('BLOCKED_STATE');

/** Il server ridotto: dice cosa non va, riprova se glielo si chiede, apre la cartella. Nient'altro. */
@Controller()
class BlockedController {
  constructor(@Inject(BLOCKED_STATE) private readonly state: BlockedState) {}

  @Get('health')
  health(): HealthResponse {
    // Mentre si spegne per riprovare non deve dire «bloccato»: l'interfaccia crederebbe che sia già fallito.
    if (this.state.retrying) throw new HttpException('', 503);
    return { status: 'blocked', block: this.state.block };
  }

  @Post('startup/retry')
  @HttpCode(202)
  retry(): void {
    this.state.retry();
  }

  @Post('startup/folder')
  @HttpCode(204)
  async folder(): Promise<void> {
    const { folder, opener } = this.state;
    if (folder === undefined) throw domainError(404, 'not_found');
    try {
      await opener(folder);
    } catch {
      // Il motivo non aiuta chi legge: il percorso è scritto sulla schermata, e si può aprire a mano.
      log.warn('La cartella della copia non si è potuta aprire.');
      throw domainError(500, 'media_failed', { details: { field: 'folder' } });
    }
  }
}

@Module({})
class BlockedModule {
  static register(state: BlockedState): DynamicModule {
    return {
      module: BlockedModule,
      controllers: [BlockedController],
      providers: [{ provide: BLOCKED_STATE, useValue: state }],
    };
  }
}

/** Finisce quando l'utente chiede di riprovare, con la porta di nuovo libera per il programma vero. */
async function serveUntilRetry(
  failure: DataFailure,
  where: Required<Pick<StartServerOptions, 'port' | 'host' | 'opener'>> & {
    appOptions: AppOptions;
  },
): Promise<void> {
  const { port, host, opener, appOptions } = where;
  const state: BlockedState = {
    ...failure,
    opener,
    retrying: false,
    retry: () => undefined,
  };
  const retried = new Promise<void>((resolve) => {
    state.retry = () => {
      state.retrying = true;
      resolve();
    };
  });

  const app = await NestFactory.create<NestExpressApplication>(BlockedModule.register(state), {
    ...(appOptions.logger === undefined ? {} : { logger: appOptions.logger }),
    abortOnError: false,
  });
  app.disable('x-powered-by');
  app.use(rejectNonLocalAccess);
  app.setGlobalPrefix(API_PREFIX);
  await app.listen(port, host);

  await retried;
  await app.close();
}
