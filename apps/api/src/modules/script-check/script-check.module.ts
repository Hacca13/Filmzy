import {
  runScriptCheckBodySchema,
  type ScriptCheckEstimate,
  type ScriptCheckView,
} from '@filmzy/contracts';
import { Body, Controller, Get, Module, Param, Post, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { ShotsModule } from '../shots/shots.module.js';
import { ScriptCheckStoreModule } from './script-check-store.module.js';
import { ScriptCheckService } from './script-check.service.js';

/**
 * Le rotte del controllo della storia (T5.2). Nessuna logica: decide il servizio. Il controllo chiama un
 * modello a pagamento: il filtro traduce gli errori della troupe (limite di spesa, chiave mancante…) in
 * errori col loro codice.
 */
@Controller('projects/:projectId/script-check')
@UseFilters(ProviderErrorFilter)
class ScriptCheckController {
  constructor(private readonly check: ScriptCheckService) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<ScriptCheckView> {
    return this.check.view(projectId);
  }

  @Get('estimate')
  estimate(@Param('projectId') projectId: string): Promise<ScriptCheckEstimate> {
    return this.check.estimate(projectId);
  }

  @Post()
  run(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ScriptCheckView> {
    return this.check.run(projectId, parseBody(runScriptCheckBodySchema, body ?? {}));
  }
}

@Module({
  imports: [ProjectsModule, ScreenplayModule, ShotsModule, ScriptCheckStoreModule],
  controllers: [ScriptCheckController],
  providers: [ScriptCheckService],
})
export class ScriptCheckModule {}
