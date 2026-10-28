import {
  addCharacterBodySchema,
  castEstimateBodySchema,
  suggestCastBodySchema,
  updateCharacterBodySchema,
  type Cast,
  type CastEstimate,
  type CastSuggestions,
  type Character,
} from '@filmzy/contracts';
import {
  createCharacterStore,
  createSheetStore,
  type CharacterStore,
  type OpenedDatabase,
  type SheetStore,
} from '@filmzy/db';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Module,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { ModerationModule } from '../moderation/moderation.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { CastService } from './cast.service.js';
import { CHARACTER_STORE, SHEET_STORE } from './tokens.js';

/**
 * Le rotte del cast (T3.5). Nessuna logica: decide il servizio. Chiedere le proposte chiama un
 * servizio a pagamento: il filtro traduce gli errori della troupe in errori col loro codice.
 */
@Controller('projects/:projectId/cast')
@UseFilters(ProviderErrorFilter)
class CastController {
  constructor(private readonly cast: CastService) {}

  @Get()
  get(@Param('projectId') projectId: string): Promise<Cast> {
    return this.cast.cast(projectId);
  }

  @Post('estimate')
  estimate(@Param('projectId') projectId: string, @Body() body: unknown): Promise<CastEstimate> {
    return this.cast.estimate(projectId, parseBody(castEstimateBodySchema, body).count);
  }

  @Post('suggestions')
  suggest(@Param('projectId') projectId: string, @Body() body: unknown): Promise<CastSuggestions> {
    return this.cast.suggest(projectId, parseBody(suggestCastBodySchema, body));
  }

  @Post('characters')
  add(@Param('projectId') projectId: string, @Body() body: unknown): Promise<Character> {
    return this.cast.add(projectId, parseBody(addCharacterBodySchema, body));
  }

  @Patch('characters/:characterId')
  update(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
    @Body() body: unknown,
  ): Promise<Character> {
    return this.cast.update(projectId, characterId, parseBody(updateCharacterBodySchema, body));
  }

  @Delete('characters/:characterId')
  @HttpCode(204)
  remove(@Param('projectId') projectId: string, @Param('characterId') characterId: string): void {
    this.cast.remove(projectId, characterId);
  }
}

@Module({
  imports: [ProjectsModule, ScreenplayModule, ModerationModule],
  controllers: [CastController],
  providers: [
    CastService,
    {
      provide: CHARACTER_STORE,
      useFactory: (opened: OpenedDatabase): CharacterStore => createCharacterStore(opened.db),
      inject: [OPENED_DATABASE],
    },
    {
      provide: SHEET_STORE,
      useFactory: (opened: OpenedDatabase): SheetStore => createSheetStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [CHARACTER_STORE, SHEET_STORE],
})
export class CastModule {}
