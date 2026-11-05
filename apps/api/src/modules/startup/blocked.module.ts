import type { HealthResponse, StartupBlock } from '@filmzy/contracts';
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Injectable,
  Logger,
  Module,
  Post,
  type DynamicModule,
} from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';

/** Cosa sa il server ridotto: perché i dati non si aprono, e dove stanno. */
export interface DataFailure {
  block: StartupBlock;
  /** La cartella da aprire: quella della copia di sicurezza, che è anche quella dei dati. */
  folder: string | undefined;
}

export interface BlockedOptions extends DataFailure {
  /** Chiede di riprovare: chi ha acceso il server lo spegne e riparte. */
  onRetry: () => void;
  /** Apre una cartella nel sistema. A parte, così i test non aprono finestre. */
  opener: (folder: string) => Promise<void>;
}

const BLOCKED_OPTIONS = Symbol('BLOCKED_OPTIONS');

@Injectable()
class BlockedService {
  private readonly log = new Logger('Avvio');
  private retrying = false;

  constructor(@Inject(BLOCKED_OPTIONS) private readonly options: BlockedOptions) {}

  health(): HealthResponse {
    // Mentre si spegne per riprovare non deve dire «bloccato»: l'interfaccia crederebbe che sia già fallito.
    if (this.retrying) throw new HttpException('', 503);
    return { status: 'blocked', block: this.options.block };
  }

  retry(): void {
    this.retrying = true;
    this.options.onRetry();
  }

  async openFolder(): Promise<void> {
    const { folder, opener } = this.options;
    if (folder === undefined) throw domainError(404, 'not_found');
    try {
      await opener(folder);
    } catch {
      // Il motivo non aiuta chi legge: il percorso è scritto sulla schermata, e si può aprire a mano.
      this.log.warn('La cartella dei dati non si è potuta aprire.');
      throw domainError(500, 'media_failed', { details: { field: 'folder' } });
    }
  }
}

/** Le rotte del server ridotto: dice cosa non va, riprova se glielo si chiede, apre la cartella. */
@Controller()
class BlockedController {
  constructor(private readonly blocked: BlockedService) {}

  @Get('health')
  health(): HealthResponse {
    return this.blocked.health();
  }

  @Post('startup/retry')
  @HttpCode(204)
  retry(): void {
    this.blocked.retry();
  }

  @Post('startup/folder')
  @HttpCode(204)
  folder(): Promise<void> {
    return this.blocked.openFolder();
  }
}

@Module({})
export class BlockedModule {
  static register(options: BlockedOptions): DynamicModule {
    return {
      module: BlockedModule,
      controllers: [BlockedController],
      providers: [BlockedService, { provide: BLOCKED_OPTIONS, useValue: options }],
    };
  }
}
