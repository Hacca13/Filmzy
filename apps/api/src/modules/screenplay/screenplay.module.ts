import {
  reviseBodySchema,
  screenplayEstimateBodySchema,
  writeDraftBodySchema,
  type ScreenplayEstimate,
  type ScreenplayVersion,
  type ScreenplayVersions,
} from '@filmzy/contracts';
import { createScreenplayStore, type OpenedDatabase, type ScreenplayStore } from '@filmzy/db';
import { Body, Controller, Get, Module, Param, Post, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { ModerationModule } from '../moderation/moderation.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayService } from './screenplay.service.js';
import { SCREENPLAY_STORE } from './tokens.js';

/**
 * Le rotte della bozza della sceneggiatura (T3.4). Nessuna logica: decide il servizio. Scrivere
 * chiama un servizio a pagamento: il filtro traduce gli errori della troupe (limite di spesa,
 * chiave mancante…) in errori col loro codice.
 */
@Controller('projects/:projectId/screenplay')
@UseFilters(ProviderErrorFilter)
class ScreenplayController {
  constructor(private readonly screenplay: ScreenplayService) {}

  @Get()
  latest(@Param('projectId') projectId: string): ScreenplayVersion {
    return this.screenplay.latest(projectId);
  }

  @Get('versions')
  versions(@Param('projectId') projectId: string): ScreenplayVersions {
    return this.screenplay.versions(projectId);
  }

  @Get('versions/:versionId')
  version(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ): ScreenplayVersion {
    return this.screenplay.version(projectId, versionId);
  }

  @Post('estimate')
  estimate(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
  ): Promise<ScreenplayEstimate> {
    return this.screenplay.estimate(projectId, parseBody(screenplayEstimateBodySchema, body));
  }

  @Post('draft')
  writeDraft(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
  ): Promise<ScreenplayVersion> {
    return this.screenplay.writeDraft(projectId, parseBody(writeDraftBodySchema, body ?? {}));
  }

  @Post('revise')
  revise(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ScreenplayVersion> {
    return this.screenplay.revise(projectId, parseBody(reviseBodySchema, body));
  }
}

@Module({
  imports: [ProjectsModule, ModerationModule],
  controllers: [ScreenplayController],
  providers: [
    ScreenplayService,
    {
      provide: SCREENPLAY_STORE,
      useFactory: (opened: OpenedDatabase): ScreenplayStore => createScreenplayStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [SCREENPLAY_STORE],
})
export class ScreenplayModule {}
