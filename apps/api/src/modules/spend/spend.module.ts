import type { FilmSpend, SpendOverview } from '@filmzy/contracts';
import { Controller, Get, Module, Param } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module.js';
import { SpendReport } from './spend-report.js';

/**
 * `GET /spend` (T3.1, T4.7): quanto speso nel mese per fornitore, con i limiti e i film; `GET
 * /spend/films/:projectId`: quanto è costato un film, per ruolo e per servizio. Nessuna logica: la sa
 * il resoconto.
 */
@Controller('spend')
class SpendController {
  constructor(private readonly report: SpendReport) {}

  @Get()
  overview(): Promise<SpendOverview> {
    return this.report.overview();
  }

  @Get('films/:projectId')
  film(@Param('projectId') projectId: string): Promise<FilmSpend> {
    return this.report.film(projectId);
  }
}

@Module({ imports: [ProjectsModule], controllers: [SpendController], providers: [SpendReport] })
export class SpendModule {}
