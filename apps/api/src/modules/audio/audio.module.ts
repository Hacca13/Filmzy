import {
  chooseAudioVariantBodySchema,
  createAudioClipBodySchema,
  startSheetBodySchema,
  suggestSoundsBodySchema,
  uploadAudioQuerySchema,
  type AudioClip,
  type AudioOverview,
  type SheetOptions,
  type SoundSuggestions,
  type SoundSuggestionsEstimate,
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
import { ModerationModule } from '../moderation/moderation.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { ShotsModule } from '../shots/shots.module.js';
import { AudioStoreModule } from './audio-store.module.js';
import { AudioService } from './audio.service.js';

/** Le rotte delle tracce audio (T5.5). Nessuna logica: decide il servizio; il filtro traduce gli errori della troupe. */
@Controller('projects/:projectId/audio')
@UseFilters(ProviderErrorFilter)
class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get()
  overview(@Param('projectId') projectId: string): AudioOverview {
    return this.audio.overview(projectId);
  }

  @Get('suggestions/estimate')
  estimateSuggestions(@Param('projectId') projectId: string): Promise<SoundSuggestionsEstimate> {
    return this.audio.estimateSuggestions(projectId);
  }

  /** «Suggerisci i suoni»: proposte da accettare o scartare, che non si salvano. */
  @Post('suggestions')
  suggest(@Param('projectId') projectId: string, @Body() body: unknown): Promise<SoundSuggestions> {
    return this.audio.suggest(projectId, parseBody(suggestSoundsBodySchema, body ?? {}));
  }

  @Post('clips')
  createClip(@Param('projectId') projectId: string, @Body() body: unknown): Promise<AudioClip> {
    return this.audio.createClip(projectId, parseBody(createAudioClipBodySchema, body));
  }

  /** Un file dell'utente: il file è il corpo della richiesta, e non va mai a un fornitore AI (D27). */
  @Post('uploads')
  upload(
    @Param('projectId') projectId: string,
    @Query() query: unknown,
    @Body() body: unknown,
  ): Promise<AudioClip> {
    return this.audio.upload(projectId, parseBody(uploadAudioQuerySchema, query), body);
  }

  @Delete('clips/:clipId')
  removeClip(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
  ): AudioOverview {
    return this.audio.removeClip(projectId, clipId);
  }

  @Get('clips/:clipId/options')
  options(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
  ): Promise<SheetOptions> {
    return this.audio.options(projectId, clipId);
  }

  @Post('clips/:clipId/variants')
  start(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
    @Body() body: unknown,
  ): Promise<AudioClip> {
    return this.audio.start(projectId, clipId, parseBody(startSheetBodySchema, body ?? {}));
  }

  @Put('clips/:clipId/variant')
  chooseVariant(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
    @Body() body: unknown,
  ): AudioClip {
    return this.audio.chooseVariant(
      projectId,
      clipId,
      parseBody(chooseAudioVariantBodySchema, body),
    );
  }
}

@Module({
  imports: [
    AudioStoreModule,
    CastModule,
    JobsModule,
    ModerationModule,
    ProjectsModule,
    ScreenplayModule,
    ShotsModule,
  ],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
