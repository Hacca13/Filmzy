import type { MoodboardView, SheetOptions } from '@filmzy/contracts';
import {
  generateMoodboardBodySchema,
  moodboardOptionsQuerySchema,
  saveMoodboardPartBodySchema,
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
  Query,
  UseFilters,
} from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { CastModule } from '../cast/cast.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { PreferencesModule } from '../preferences/preferences.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { MoodboardGenerationService } from './moodboard-generation.service.js';
import { MoodboardUploadService } from './moodboard-upload.service.js';
import { MoodboardService } from './moodboard.service.js';
import { MoodboardStoreModule } from './moodboard-store.module.js';

/** Le rotte del moodboard (T4.10, D37). Nessuna logica: decide il servizio. */
@UseFilters(ProviderErrorFilter)
@Controller('projects/:projectId/moodboard')
class MoodboardController {
  constructor(
    private readonly moodboard: MoodboardService,
    private readonly generation: MoodboardGenerationService,
    private readonly uploads: MoodboardUploadService,
  ) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<MoodboardView> {
    return this.moodboard.view(projectId);
  }

  /** I servizi per le immagini e la stima di tutto il lavoro (T4.10). */
  @Get('options')
  options(@Param('projectId') projectId: string, @Query() query: unknown): Promise<SheetOptions> {
    return this.generation.options(
      projectId,
      parseBody(moodboardOptionsQuerySchema, query).sceneId,
    );
  }

  /** «Crea il moodboard»: colori e consigli dal responsabile dell'atmosfera, immagini in coda. */
  @Post('generate')
  generate(@Param('projectId') projectId: string, @Body() body: unknown): Promise<MoodboardView> {
    return this.generation.generate(projectId, parseBody(generateMoodboardBodySchema, body ?? {}));
  }

  /** Carica un'immagine di riferimento (T4.10): il file è il corpo della richiesta (PNG, JPEG o WebP). */
  @Post('references')
  addReference(
    @Param('projectId') projectId: string,
    @Query() query: unknown,
    @Body() body: unknown,
  ): Promise<MoodboardView> {
    return this.uploads.add(projectId, parseBody(moodboardOptionsQuerySchema, query).sceneId, body);
  }

  /** Toglie un'immagine di riferimento. */
  @Delete('references/:referenceId')
  removeReference(
    @Param('projectId') projectId: string,
    @Param('referenceId') referenceId: string,
  ): Promise<MoodboardView> {
    return this.moodboard.removeReference(projectId, referenceId);
  }

  /** Palette e consigli del film o di una scena, scritti a mano. */
  @Put()
  save(@Param('projectId') projectId: string, @Body() body: unknown): Promise<MoodboardView> {
    return this.moodboard.savePart(projectId, parseBody(saveMoodboardPartBodySchema, body));
  }
}

@Module({
  imports: [
    CastModule,
    JobsModule,
    PreferencesModule,
    ProjectsModule,
    ScreenplayModule,
    MoodboardStoreModule,
  ],
  controllers: [MoodboardController],
  providers: [MoodboardService, MoodboardGenerationService, MoodboardUploadService],
  exports: [MoodboardService],
})
export class MoodboardModule {}
