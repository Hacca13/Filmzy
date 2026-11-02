import {
  lockSheetBodySchema,
  startSheetBodySchema,
  type CharacterSheet,
  type SheetOptions,
} from '@filmzy/contracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  Module,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { CastModule } from '../cast/cast.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { SheetService } from './sheet.service.js';

/**
 * Le rotte della scheda di un personaggio (T3.6). Nessuna logica: decide il servizio. Chiedere una
 * scheda costa: il filtro traduce gli errori della troupe (limite di spesa, nessun servizio adatto…)
 * in errori col loro codice.
 */
@Controller('projects/:projectId/cast/characters/:characterId/sheet')
@UseFilters(ProviderErrorFilter)
class SheetController {
  constructor(private readonly sheets: SheetService) {}

  @Get()
  get(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
  ): CharacterSheet {
    return this.sheets.get(projectId, characterId);
  }

  @Get('options')
  options(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
  ): Promise<SheetOptions> {
    return this.sheets.options(projectId, characterId);
  }

  @Post()
  start(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
    @Body() body: unknown,
  ): Promise<CharacterSheet> {
    return this.sheets.start(projectId, characterId, parseBody(startSheetBodySchema, body ?? {}));
  }

  @Put('lock')
  lock(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
    @Body() body: unknown,
  ): CharacterSheet {
    return this.sheets.lock(projectId, characterId, parseBody(lockSheetBodySchema, body).attempt);
  }

  @Delete('lock')
  unlock(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
  ): CharacterSheet {
    return this.sheets.unlock(projectId, characterId);
  }
}

@Module({
  imports: [CastModule, JobsModule, ProjectsModule],
  controllers: [SheetController],
  providers: [SheetService],
})
export class SheetsModule {}
