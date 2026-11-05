import { startExportBodySchema, type AssemblyView, type ExportView } from '@filmzy/contracts';
import {
  createAssemblyStore,
  createExportStore,
  type AssemblyStore,
  type ExportStore,
  type OpenedDatabase,
} from '@filmzy/db';
import { Body, Controller, Get, HttpCode, Logger, Module, Param, Post, Res } from '@nestjs/common';
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

/** Le rotte del montaggio (T5.7). Nessuna logica: decide il servizio. */
@Controller('projects/:projectId/assembly')
class AssemblyController {
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
    return this.exports.start(projectId, parseBody(startExportBodySchema, body).shortSide);
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
    const { file, name } = await this.exports.download(projectId, exportId);
    // Il permesso sui punti serve su Linux: la cartella dei dati sta in `~/.local`, e senza darebbe 404.
    response.download(file, name, { dotfiles: 'allow' }, (error) => {
      if (error === undefined) return;
      const { code } = error as NodeJS.ErrnoException;
      // Chi interrompe il download ha deciso lui: non è un errore da registrare.
      if (code !== 'ECONNABORTED') {
        this.log.warn(`Il file esportato non si è potuto inviare: ${code ?? 'unknown'}.`);
      }
      if (!response.headersSent) response.status(404).json({ code: 'not_found', retryable: false });
    });
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
