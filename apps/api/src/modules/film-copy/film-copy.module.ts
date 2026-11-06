import type { Project } from '@filmzy/contracts';
import { Controller, Get, Logger, Module, Param, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { pipeline } from 'node:stream/promises';

import { ProjectsModule } from '../projects/projects.module.js';
import { FilmCopyService } from './film-copy.service.js';

/** Le rotte della copia di un film (T6.3). Nessuna logica: decide il servizio. */
@Controller('projects')
class FilmCopyController {
  private readonly log = new Logger('Copia del film');

  constructor(private readonly copies: FilmCopyService) {}

  /** «Salva una copia del film»: il browser, o il programma installato, chiede dove metterla. */
  @Get(':projectId/copy')
  async download(@Param('projectId') projectId: string, @Res() response: Response): Promise<void> {
    const { stream, name } = await this.copies.exportFilm(projectId);
    response.attachment(name);
    response.type('application/zip');
    try {
      await pipeline(stream, response);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      // Chi interrompe il download ha deciso lui: non è un errore da registrare.
      if (code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        this.log.warn(`La copia non si è potuta inviare: ${code ?? 'unknown'}.`);
      }
    }
  }

  /** «Apri un film salvato»: la copia arriva così com'è, senza essere letta tutta in memoria. */
  @Post('import')
  importFilm(@Req() request: Request, @Query('replace') replace: unknown): Promise<Project> {
    return this.copies.importFilm(request, { replace: replace === '1' });
  }
}

@Module({
  imports: [ProjectsModule],
  controllers: [FilmCopyController],
  providers: [FilmCopyService],
})
export class FilmCopyModule {}
