import type { AssemblyView } from '@filmzy/contracts';
import { createAssemblyStore, type AssemblyStore, type OpenedDatabase } from '@filmzy/db';
import { Controller, Get, Module, Param, Post } from '@nestjs/common';

import { AudioStoreModule } from '../audio/audio-store.module.js';
import { BibleModule } from '../bible/bible.module.js';
import { CastModule } from '../cast/cast.module.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ShotsModule } from '../shots/shots.module.js';
import { AssemblyService } from './assembly.service.js';
import { ASSEMBLY_STORE } from './tokens.js';

/** Le rotte del montaggio (T5.7). Nessuna logica: decide il servizio. */
@Controller('projects/:projectId/assembly')
class AssemblyController {
  constructor(private readonly assembly: AssemblyService) {}

  @Get()
  view(@Param('projectId') projectId: string): Promise<AssemblyView> {
    return this.assembly.view(projectId);
  }

  /** «Monta il film»: lavora in coda, e non costa niente. */
  @Post()
  start(@Param('projectId') projectId: string): Promise<AssemblyView> {
    return this.assembly.start(projectId);
  }
}

@Module({
  imports: [AudioStoreModule, BibleModule, CastModule, JobsModule, ProjectsModule, ShotsModule],
  controllers: [AssemblyController],
  providers: [
    AssemblyService,
    {
      provide: ASSEMBLY_STORE,
      useFactory: (opened: OpenedDatabase): AssemblyStore => createAssemblyStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
})
export class ExportModule {}
