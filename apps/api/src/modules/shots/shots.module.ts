import {
  changeShotBodySchema,
  planSceneBodySchema,
  planSceneEstimateBodySchema,
  type PlanSceneEstimate,
  type ScenePlan,
  type ShotPlans,
  type ShotSpec,
} from '@filmzy/contracts';
import { createShotStore, type OpenedDatabase, type ShotStore } from '@filmzy/db';
import { Body, Controller, Get, Module, Param, Patch, Post, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { BibleModule } from '../bible/bible.module.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { ShotsService } from './shots.service.js';
import { SHOT_STORE } from './tokens.js';

/**
 * Le rotte delle inquadrature (T3.9). Nessuna logica: decide il servizio. Pensare le inquadrature
 * chiama un servizio a pagamento: il filtro traduce gli errori della troupe (limite di spesa,
 * chiave mancante…) in errori col loro codice.
 */
@Controller('projects/:projectId/shots')
@UseFilters(ProviderErrorFilter)
class ShotsController {
  constructor(private readonly shots: ShotsService) {}

  @Get()
  plans(@Param('projectId') projectId: string): Promise<ShotPlans> {
    return this.shots.plans(projectId);
  }

  // Prima di `:shotId`, perché «estimate» non sia preso per l'id di un'inquadratura.
  @Post('estimate')
  estimate(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
  ): Promise<PlanSceneEstimate> {
    return this.shots.estimate(projectId, parseBody(planSceneEstimateBodySchema, body).sceneNumber);
  }

  @Post()
  plan(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ScenePlan> {
    return this.shots.plan(projectId, parseBody(planSceneBodySchema, body));
  }

  @Patch(':shotId')
  change(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): Promise<ShotSpec> {
    return this.shots.changeMovement(projectId, shotId, parseBody(changeShotBodySchema, body));
  }
}

@Module({
  imports: [ProjectsModule, ScreenplayModule, BibleModule],
  controllers: [ShotsController],
  providers: [
    ShotsService,
    {
      provide: SHOT_STORE,
      useFactory: (opened: OpenedDatabase): ShotStore => createShotStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
})
export class ShotsModule {}
