import {
  changeShotBodySchema,
  chooseStoryboardBodySchema,
  chooseTakeBodySchema,
  planSceneBodySchema,
  planSceneEstimateBodySchema,
  setFlagIgnoredBodySchema,
  setShotImagesBodySchema,
  startSheetBodySchema,
  takeFrameBodySchema,
  type PlanSceneEstimate,
  type ScenePlan,
  type SheetOptions,
  type ShotImages,
  type ShotPlans,
  type ShotSpec,
  type ShotStoryboard,
  type ShotTakes,
} from '@filmzy/contracts';
import {
  createShotStore,
  createTakeStore,
  type OpenedDatabase,
  type ShotStore,
  type TakeStore,
} from '@filmzy/db';
import { Body, Controller, Get, Module, Param, Patch, Post, Put, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { BibleModule } from '../bible/bible.module.js';
import { CastModule } from '../cast/cast.module.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { ShotImagesService } from './shot-images.service.js';
import { ShotsService } from './shots.service.js';
import { StoryboardService } from './storyboard.service.js';
import { TakesService } from './takes.service.js';
import { LocationsModule } from '../locations/locations.module.js';
import { MoodboardStoreModule } from '../moodboard/moodboard-store.module.js';
import { ScriptCheckStoreModule } from '../script-check/script-check-store.module.js';
import { UploadStoreModule } from '../uploads/upload-store.module.js';
import { SHOT_STORE, TAKE_STORE } from './tokens.js';

/**
 * Le rotte delle inquadrature (T3.9) e del loro storyboard (T4.1). Nessuna logica: decide il
 * servizio. Pensare le inquadrature e disegnarle chiamano servizi a pagamento: il filtro traduce
 * gli errori della troupe (limite di spesa, chiave mancante…) in errori col loro codice.
 */
@Controller('projects/:projectId/shots')
@UseFilters(ProviderErrorFilter)
class ShotsController {
  constructor(
    private readonly shots: ShotsService,
    private readonly storyboards: StoryboardService,
    private readonly shotImages: ShotImagesService,
    private readonly takes: TakesService,
  ) {}

  @Get()
  plans(@Param('projectId') projectId: string): Promise<ShotPlans> {
    return this.shots.plans(projectId);
  }

  /** «Ignora» un giallo o lo rimette (T5.3). */
  @Put('flags')
  setFlagIgnored(@Param('projectId') projectId: string, @Body() body: unknown): Promise<ShotPlans> {
    return this.shots.setFlagIgnored(projectId, parseBody(setFlagIgnoredBodySchema, body));
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

  @Get(':shotId/storyboard')
  storyboard(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
  ): ShotStoryboard {
    return this.storyboards.storyboard(projectId, shotId, 'storyboard');
  }

  @Get(':shotId/storyboard/options')
  storyboardOptions(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
  ): Promise<SheetOptions> {
    return this.storyboards.options(projectId, shotId, 'storyboard');
  }

  @Post(':shotId/storyboard')
  startStoryboard(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): Promise<ShotStoryboard> {
    return this.storyboards.start(
      projectId,
      shotId,
      'storyboard',
      parseBody(startSheetBodySchema, body ?? {}),
    );
  }

  @Put(':shotId/storyboard/choice')
  chooseStoryboard(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): ShotStoryboard {
    return this.storyboards.choose(
      projectId,
      shotId,
      'storyboard',
      parseBody(chooseStoryboardBodySchema, body).assetId,
    );
  }

  // L'ultimo fotogramma (T4.2) è lo stesso lavoro dello storyboard, in un altro modo.
  @Get(':shotId/end-frame')
  endFrame(@Param('projectId') projectId: string, @Param('shotId') shotId: string): ShotStoryboard {
    return this.storyboards.storyboard(projectId, shotId, 'end_frame');
  }

  @Get(':shotId/end-frame/options')
  endFrameOptions(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
  ): Promise<SheetOptions> {
    return this.storyboards.options(projectId, shotId, 'end_frame');
  }

  @Post(':shotId/end-frame')
  startEndFrame(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): Promise<ShotStoryboard> {
    return this.storyboards.start(
      projectId,
      shotId,
      'end_frame',
      parseBody(startSheetBodySchema, body ?? {}),
    );
  }

  /** «Scegli questa»: la variante diventa l'ultimo fotogramma impostato. */
  @Put(':shotId/end-frame/choice')
  chooseEndFrame(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): ShotStoryboard {
    return this.storyboards.choose(
      projectId,
      shotId,
      'end_frame',
      parseBody(chooseStoryboardBodySchema, body).assetId,
    );
  }

  @Get(':shotId/takes')
  takeList(@Param('projectId') projectId: string, @Param('shotId') shotId: string): ShotTakes {
    return this.takes.list(projectId, shotId);
  }

  /** «Tieni questo take»: la card fa vedere quello (prima di `:takeId`, perché «choice» non sia un id). */
  @Put(':shotId/takes/choice')
  chooseTake(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): ShotTakes {
    return this.takes.choose(projectId, shotId, parseBody(chooseTakeBodySchema, body).takeId);
  }

  /** «Usa questo fotogramma come punto di partenza»: diventa il primo fotogramma dell'inquadratura. */
  @Post(':shotId/takes/:takeId/frame')
  useFrame(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Param('takeId') takeId: string,
    @Body() body: unknown,
  ): Promise<ShotImages> {
    return this.shotImages.useTakeFrame(
      projectId,
      shotId,
      takeId,
      parseBody(takeFrameBodySchema, body).atS,
    );
  }

  @Get(':shotId/takes/options')
  takeOptions(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
  ): Promise<SheetOptions> {
    return this.takes.options(projectId, shotId);
  }

  /** «Genera»: mette in coda un take video. Costa: il filtro traduce gli errori della troupe. */
  @Post(':shotId/takes')
  startTake(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): Promise<ShotTakes> {
    return this.takes.start(projectId, shotId, parseBody(startSheetBodySchema, body ?? {}));
  }

  @Get(':shotId/images')
  images(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
  ): Promise<ShotImages> {
    return this.shotImages.get(projectId, shotId);
  }

  @Put(':shotId/images')
  setImages(
    @Param('projectId') projectId: string,
    @Param('shotId') shotId: string,
    @Body() body: unknown,
  ): Promise<ShotImages> {
    return this.shotImages.set(projectId, shotId, parseBody(setShotImagesBodySchema, body));
  }
}

@Module({
  imports: [
    ProjectsModule,
    ScreenplayModule,
    BibleModule,
    CastModule,
    JobsModule,
    LocationsModule,
    MoodboardStoreModule,
    ScriptCheckStoreModule,
    UploadStoreModule,
  ],
  controllers: [ShotsController],
  exports: [ShotsService],
  providers: [
    ShotsService,
    StoryboardService,
    ShotImagesService,
    TakesService,
    {
      provide: TAKE_STORE,
      useFactory: (opened: OpenedDatabase): TakeStore => createTakeStore(opened.db),
      inject: [OPENED_DATABASE],
    },
    {
      provide: SHOT_STORE,
      useFactory: (opened: OpenedDatabase): ShotStore => createShotStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
})
export class ShotsModule {}
