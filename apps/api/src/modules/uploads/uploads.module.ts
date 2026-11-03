import type { UploadedImage, Uploads } from '@filmzy/contracts';
import { uploadQuerySchema } from '@filmzy/contracts';
import { Body, Controller, Get, Module, Param, Post, Query, UseFilters } from '@nestjs/common';

import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { parseBody } from '../../http/parse-body.js';
import { CastModule } from '../cast/cast.module.js';
import { LocationsModule } from '../locations/locations.module.js';
import { PreferencesModule } from '../preferences/preferences.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { UploadStoreModule } from './upload-store.module.js';
import { UploadsService } from './uploads.service.js';

/**
 * Le foto caricate da un film (T4.8, D19): `GET` le elenca, `POST` ne carica una. Il file è il corpo
 * della richiesta (PNG, JPEG o WebP), e le domande — luogo o oggetto, di quale luogo, che nome —
 * stanno nell'indirizzo. Nessuna logica qui: la sa il servizio.
 */
@UseFilters(ProviderErrorFilter)
@Controller('projects/:projectId/uploads')
class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Get()
  list(@Param('projectId') projectId: string): Promise<Uploads> {
    return this.uploads.list(projectId);
  }

  @Post()
  add(
    @Param('projectId') projectId: string,
    @Query() query: unknown,
    @Body() body: unknown,
  ): Promise<UploadedImage> {
    return this.uploads.add(projectId, parseBody(uploadQuerySchema, query), body);
  }
}

@Module({
  imports: [CastModule, LocationsModule, PreferencesModule, ProjectsModule, UploadStoreModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
