import {
  editFinalBodySchema,
  writeFinalBodySchema,
  type DraftReview,
  type ScreenplayEstimate,
  type ScreenplayVersion,
  type ScreenplayVersions,
} from '@filmzy/contracts';
import { Body, Controller, Get, Module, Param, Post, Put, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { CastModule } from '../cast/cast.module.js';
import { LocationsModule } from '../locations/locations.module.js';
import { ModerationModule } from '../moderation/moderation.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { FinalScreenplayService } from './final-screenplay.service.js';

/**
 * Le rotte del riepilogo e della stesura ufficiale (T3.8). Nessuna logica: decide il servizio.
 * Scrivere la stesura chiama un servizio a pagamento: il filtro traduce gli errori della troupe
 * (limite di spesa, chiave mancante…) in errori col loro codice.
 */
@Controller('projects/:projectId')
@UseFilters(ProviderErrorFilter)
class FinalScreenplayController {
  constructor(
    private readonly finalScreenplay: FinalScreenplayService,
    private readonly screenplays: ScreenplayService,
  ) {}

  @Get('review')
  review(@Param('projectId') projectId: string): DraftReview {
    return this.finalScreenplay.review(projectId);
  }

  @Get('screenplay/final')
  latest(@Param('projectId') projectId: string): ScreenplayVersion {
    return this.screenplays.latest(projectId, 'final');
  }

  @Get('screenplay/final/versions')
  versions(@Param('projectId') projectId: string): ScreenplayVersions {
    return this.screenplays.versions(projectId, 'final');
  }

  @Get('screenplay/final/versions/:versionId')
  version(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ): ScreenplayVersion {
    return this.screenplays.version(projectId, versionId, 'final');
  }

  @Post('screenplay/final/estimate')
  estimate(@Param('projectId') projectId: string): Promise<ScreenplayEstimate> {
    return this.finalScreenplay.estimate(projectId);
  }

  @Post('screenplay/final')
  write(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ScreenplayVersion> {
    return this.finalScreenplay.write(projectId, parseBody(writeFinalBodySchema, body));
  }

  @Put('screenplay/final')
  edit(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ScreenplayVersion> {
    return this.finalScreenplay.edit(projectId, parseBody(editFinalBodySchema, body));
  }
}

@Module({
  imports: [ProjectsModule, ModerationModule, ScreenplayModule, CastModule, LocationsModule],
  controllers: [FinalScreenplayController],
  providers: [FinalScreenplayService],
})
export class FinalScreenplayModule {}
