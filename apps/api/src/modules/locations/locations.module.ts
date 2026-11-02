import {
  addLocationBodySchema,
  chooseLocationImageBodySchema,
  startSheetBodySchema,
  type Location,
  type LocationImages,
  type Locations,
  type SheetOptions,
} from '@filmzy/contracts';
import { createLocationStore, type LocationStore, type OpenedDatabase } from '@filmzy/db';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Module,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { CastModule } from '../cast/cast.module.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ScreenplayModule } from '../screenplay/screenplay.module.js';
import { LocationsService } from './locations.service.js';
import { LOCATION_STORE } from './tokens.js';

/**
 * Le rotte dei luoghi (T3.7). Nessuna logica: decide il servizio. Chiedere le immagini costa: il
 * filtro traduce gli errori della troupe (limite di spesa, nessun servizio adatto…) in errori col
 * loro codice.
 */
@Controller('projects/:projectId/locations')
@UseFilters(ProviderErrorFilter)
class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get()
  list(@Param('projectId') projectId: string): Locations {
    return this.locations.list(projectId);
  }

  @Post()
  add(@Param('projectId') projectId: string, @Body() body: unknown): Location {
    return this.locations.add(projectId, parseBody(addLocationBodySchema, body));
  }

  @Delete(':locationId')
  @HttpCode(204)
  remove(@Param('projectId') projectId: string, @Param('locationId') locationId: string): void {
    this.locations.remove(projectId, locationId);
  }

  @Get(':locationId/images')
  images(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
  ): LocationImages {
    return this.locations.images(projectId, locationId);
  }

  @Get(':locationId/images/options')
  options(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
  ): Promise<SheetOptions> {
    return this.locations.options(projectId, locationId);
  }

  @Post(':locationId/images')
  start(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
    @Body() body: unknown,
  ): Promise<LocationImages> {
    return this.locations.start(projectId, locationId, parseBody(startSheetBodySchema, body ?? {}));
  }

  @Put(':locationId/images/choice')
  choose(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
    @Body() body: unknown,
  ): LocationImages {
    return this.locations.choose(
      projectId,
      locationId,
      parseBody(chooseLocationImageBodySchema, body).assetId,
    );
  }
}

@Module({
  imports: [CastModule, JobsModule, ProjectsModule, ScreenplayModule],
  controllers: [LocationsController],
  providers: [
    LocationsService,
    {
      provide: LOCATION_STORE,
      useFactory: (opened: OpenedDatabase): LocationStore => createLocationStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [LOCATION_STORE],
})
export class LocationsModule {}
