import { Module } from '@nestjs/common';

import { CastModule } from '../cast/cast.module.js';
import { LocationsModule } from '../locations/locations.module.js';
import { MoodboardStoreModule } from '../moodboard/moodboard-store.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { BibleService } from './bible.service.js';

/** La Bibbia del film, assemblata dalle tabelle: la usano i compiti che la passano ai ruoli. */
@Module({
  imports: [ProjectsModule, CastModule, LocationsModule, MoodboardStoreModule],
  providers: [BibleService],
  exports: [BibleService],
})
export class BibleModule {}
