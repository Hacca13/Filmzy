import type { About } from '@filmzy/contracts';
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Injectable,
  Logger,
  Module,
  Post,
} from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { DATA_DIR } from '../database/database.module.js';
import { openFolder } from '../export/export-files.js';

/** La versione di sviluppo, se nessuno ne ha detta un'altra: il programma installato la dice sempre. */
const DEVELOPMENT_VERSION = '0.0.0-sviluppo';

/** Apre la cartella nel sistema. A parte, così i test non aprono finestre. */
@Injectable()
export class DataFolderOpener {
  open(folder: string): Promise<void> {
    return openFolder(folder);
  }
}

/** «Informazioni» e «I tuoi dati» (T6.2, D91): cosa c'è sul computer, e la cartella da aprire. */
@Injectable()
class AboutService {
  private readonly log = new Logger('Informazioni');

  constructor(
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly opener: DataFolderOpener,
  ) {}

  about(): About {
    const version = process.env.FILMZY_APP_VERSION;
    return {
      version: version === undefined || version === '' ? DEVELOPMENT_VERSION : version,
      dataDir: this.dataDir,
    };
  }

  /** La cartella viene dal programma, mai dalla richiesta (CLAUDE.md, «Sicuro»). */
  async openDataFolder(): Promise<void> {
    try {
      await this.opener.open(this.dataDir);
    } catch {
      // Il motivo non aiuta chi legge: il percorso è scritto sulla pagina, e si può aprire a mano.
      this.log.warn('La cartella dei dati non si è potuta aprire.');
      throw domainError(500, 'media_failed', { details: { field: 'folder' } });
    }
  }
}

/** Le rotte. Nessuna logica: decide il servizio. */
@Controller('about')
class AboutController {
  constructor(private readonly about: AboutService) {}

  @Get()
  read(): About {
    return this.about.about();
  }

  @Post('data-folder')
  @HttpCode(204)
  openDataFolder(): Promise<void> {
    return this.about.openDataFolder();
  }
}

@Module({
  controllers: [AboutController],
  providers: [AboutService, DataFolderOpener],
})
export class AboutModule {}
