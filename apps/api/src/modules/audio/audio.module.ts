import {
  chooseAudioVariantBodySchema,
  createAudioClipBodySchema,
  setTakeNativeAudioBodySchema,
  startSheetBodySchema,
  suggestSoundsBodySchema,
  updateAudioClipBodySchema,
  updateAudioTrackBodySchema,
  uploadAudioQuerySchema,
  type AudioClip,
  type AudioOverview,
  type AudioTimeline,
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
import { BibleModule } from '../bible/bible.module.js';
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

  /** La linea del tempo del film: dove cade ogni inquadratura e ogni suono (T5.6). */
  @Get('timeline')
  timeline(@Param('projectId') projectId: string): Promise<AudioTimeline> {
    return this.audio.timeline(projectId);
  }

  @Put('tracks/:trackId')
  updateTrack(
    @Param('projectId') projectId: string,
    @Param('trackId') trackId: string,
    @Body() body: unknown,
  ): AudioOverview {
    return this.audio.updateTrack(projectId, trackId, parseBody(updateAudioTrackBodySchema, body));
  }

  /** L'audio originale di un take: si accende e si spegne senza rigenerare niente (D43). */
  @Put('takes/:takeId/native')
  setNativeAudio(
    @Param('projectId') projectId: string,
    @Param('takeId') takeId: string,
    @Body() body: unknown,
  ): Promise<AudioOverview> {
    return this.audio.setNativeAudio(
      projectId,
      takeId,
      parseBody(setTakeNativeAudioBodySchema, body),
    );
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

  @Put('clips/:clipId')
  updateClip(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
    @Body() body: unknown,
  ): AudioClip {
    return this.audio.updateClip(projectId, clipId, parseBody(updateAudioClipBodySchema, body));
  }

  /** «Carica un file» su un blocco che c'è già: il file resta qui, e non va a nessun fornitore (D27). */
  @Post('clips/:clipId/uploads')
  uploadVariant(
    @Param('projectId') projectId: string,
    @Param('clipId') clipId: string,
    @Body() body: unknown,
  ): Promise<AudioClip> {
    return this.audio.uploadVariant(projectId, clipId, body);
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
    BibleModule,
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
