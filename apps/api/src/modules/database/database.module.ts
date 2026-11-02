import {
  Inject,
  Injectable,
  Logger,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import {
  createJobQueue,
  openFilmzyDatabase,
  resolveDataDir,
  type JobQueue,
  type OpenedDatabase,
} from '@filmzy/db';

/**
 * Il database locale, aperto una volta all'avvio del server (architettura §6). Apertura,
 * migrazioni e copia di sicurezza stanno in `@filmzy/db`: qui si decide solo *quando* aprirlo e si
 * chiude in modo ordinato quando il programma si ferma.
 */

export const OPENED_DATABASE = Symbol('OPENED_DATABASE');
export const JOB_QUEUE = Symbol('JOB_QUEUE');
/** La cartella dati dell'utente (§6.1): serve anche a chi scrive file accanto al database. */
export const DATA_DIR = Symbol('DATA_DIR');

export interface DatabaseModuleOptions {
  /** La cartella dati: in Electron la dà il sistema (M6), nei test è una temporanea. */
  dataDir?: string;
  appVersion?: string;
}

/** Chiude il database quando il server si ferma: i file WAL vanno chiusi bene. */
@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  private readonly log = new Logger('Database');

  constructor(@Inject(OPENED_DATABASE) private readonly opened: OpenedDatabase) {}

  onApplicationShutdown(): void {
    this.opened.close();
    this.log.log('Database chiuso.');
  }
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions = {}): DynamicModule {
    const dataDir = options.dataDir ?? resolveDataDir();

    return {
      module: DatabaseModule,
      // Globale: il database è uno solo e serve a tutti i moduli di dominio, che altrimenti
      // dovrebbero importarlo uno per uno senza nessun motivo.
      global: true,
      providers: [
        { provide: DATA_DIR, useValue: dataDir },
        {
          provide: OPENED_DATABASE,
          useFactory: async (): Promise<OpenedDatabase> => {
            const opened = await openFilmzyDatabase({
              dataDir,
              appVersion: options.appVersion ?? process.env.FILMZY_APP_VERSION ?? '0.0.0-sviluppo',
            });

            const log = new Logger('Database');
            log.log(`Dati in ${opened.file} (schema ${String(opened.schemaVersion)}).`);
            if (opened.backupFile !== undefined) {
              log.log(`Copia di sicurezza prima dell'aggiornamento: ${opened.backupFile}`);
            }
            return opened;
          },
        },
        {
          provide: JOB_QUEUE,
          useFactory: (opened: OpenedDatabase): JobQueue => createJobQueue(opened.db),
          inject: [OPENED_DATABASE],
        },
        DatabaseLifecycle,
      ],
      exports: [OPENED_DATABASE, JOB_QUEUE, DATA_DIR],
    };
  }
}
