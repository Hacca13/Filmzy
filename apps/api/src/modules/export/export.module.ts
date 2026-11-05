import { startExportBodySchema, type AssemblyView, type ExportView } from '@filmzy/contracts';
import {
  createAssemblyStore,
  createExportStore,
  type AssemblyStore,
  type ExportStore,
  type OpenedDatabase,
} from '@filmzy/db';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Module,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { parseBody } from '../../http/parse-body.js';
import { AudioStoreModule } from '../audio/audio-store.module.js';
import { BibleModule } from '../bible/bible.module.js';
import { CastModule } from '../cast/cast.module.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ShotsModule } from '../shots/shots.module.js';
import { AssemblyService } from './assembly.service.js';
import { ExportService, FolderOpener } from './export.service.js';
import { ASSEMBLY_STORE, EXPORT_STORE } from './tokens.js';

/** Manda un file come allegato: il browser, o il programma installato, chiede dove metterlo. */
function sendCopy(
  response: Response,
  log: Logger,
  { file, name }: { file: string; name: string },
): void {
  // Il permesso sui punti serve su Linux: la cartella dei dati sta in `~/.local`, e senza darebbe 404.
  response.download(file, name, { dotfiles: 'allow' }, (error) => {
    if (error === undefined) return;
    const { code } = error as NodeJS.ErrnoException;
    // Chi interrompe il download ha deciso lui: non è un errore da registrare.
    if (code !== 'ECONNABORTED') {
      log.warn(`Il film non si è potuto inviare: ${code ?? 'unknown'}.`);
    }
    if (!response.headersSent) response.status(404).json({ code: 'not_found', retryable: false });
  });
}

/** Le rotte del montaggio (T5.7). Nessuna logica: decide il servizio. */
@Controller('projects/:projectId/assembly')
class AssemblyController {
  private readonly log = new Logger('Montaggio');

  constructor(private readonly assembly: AssemblyService) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<AssemblyView> {
    return this.assembly.view(projectId);
  }

  /** «Monta il film»: lavora in coda, e non costa niente. */
  @Post()
  start(@Param('projectId') projectId: string): Promise<AssemblyView> {
    return this.assembly.start(projectId);
  }

  /** «Togli» su un film montato prima: lo decide solo l'utente (D87). */
  @Delete(':assemblyId')
  @HttpCode(204)
  remove(
    @Param('projectId') projectId: string,
    @Param('assemblyId') assemblyId: string,
  ): Promise<void> {
    return this.assembly.removeEarlier(projectId, assemblyId);
  }

  /** «Salva una copia» di un film montato prima. */
  @Get(':assemblyId/file')
  async file(
    @Param('projectId') projectId: string,
    @Param('assemblyId') assemblyId: string,
    @Res() response: Response,
  ): Promise<void> {
    sendCopy(response, this.log, await this.assembly.filmFile(projectId, assemblyId));
  }
}

/** Le rotte dell'esportazione (T5.8). Nessuna logica: decide il servizio. */
@Controller('projects/:projectId/exports')
class ExportController {
  private readonly log = new Logger('Esportazione');

  constructor(private readonly exports: ExportService) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<ExportView> {
    return this.exports.view(projectId);
  }

  /** «Esporta il film»: lavora in coda, e non costa niente. */
  @Post()
  start(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ExportView> {
    return this.exports.start(projectId, parseBody(startExportBodySchema, body));
  }

  /** «Apri la cartella». */
  @Post('folder')
  @HttpCode(204)
  openFolder(@Param('projectId') projectId: string): Promise<void> {
    return this.exports.openFolder(projectId);
  }

  /** «Salva una copia»: il browser, o il programma installato, chiede dove metterla. */
  @Get(':exportId/file')
  async file(
    @Param('projectId') projectId: string,
    @Param('exportId') exportId: string,
    @Res() response: Response,
  ): Promise<void> {
    sendCopy(response, this.log, await this.exports.download(projectId, exportId));
  }
}

@Module({
  imports: [AudioStoreModule, BibleModule, CastModule, JobsModule, ProjectsModule, ShotsModule],
  controllers: [AssemblyController, ExportController],
  providers: [
    AssemblyService,
    ExportService,
    FolderOpener,
    {
      provide: ASSEMBLY_STORE,
      useFactory: (opened: OpenedDatabase): AssemblyStore => createAssemblyStore(opened.db),
      inject: [OPENED_DATABASE],
    },
    {
      provide: EXPORT_STORE,
      useFactory: (opened: OpenedDatabase): ExportStore => createExportStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
})
export class ExportModule {}
