import type { MoodboardView } from '@filmzy/contracts';
import { saveMoodboardPartBodySchema } from '@filmzy/contracts';
import { Body, Controller, Get, Module, Param, Put } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { MoodboardService } from './moodboard.service.js';
import { MoodboardStoreModule } from './moodboard-store.module.js';

/** Le rotte del moodboard (T4.10, D37). Nessuna logica: decide il servizio. */
@Controller('projects/:projectId/moodboard')
class MoodboardController {
  constructor(private readonly moodboard: MoodboardService) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<MoodboardView> {
    return this.moodboard.view(projectId);
  }

  /** Palette e consigli del film o di una scena, scritti a mano. */
  @Put()
  save(@Param('projectId') projectId: string, @Body() body: unknown): Promise<MoodboardView> {
    return this.moodboard.savePart(projectId, parseBody(saveMoodboardPartBodySchema, body));
  }
}

@Module({
  imports: [ProjectsModule, ScreenplayModule, MoodboardStoreModule],
  controllers: [MoodboardController],
  providers: [MoodboardService],
  exports: [MoodboardService],
})
export class MoodboardModule {}
