import {
  createProjectBodySchema,
  updateProjectBodySchema,
  type Project,
  type ProjectOptions,
  type ProjectsList,
} from '@filmzy/contracts';
import { createProjectStore, type OpenedDatabase, type ProjectStore } from '@filmzy/db';
import { Body, Controller, Get, Module, Param, Patch, Post, UseFilters } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { ModerationModule } from '../moderation/moderation.module.js';
import { ProjectsService } from './projects.service.js';
import { PROJECT_STORE } from './tokens.js';

/**
 * Le rotte dei film (T3.2). Nessuna logica: decide il servizio. Il controllo del moderatore può
 * fallire come ogni chiamata a un servizio: il filtro lo traduce in un errore con il suo codice.
 */
@Controller('projects')
@UseFilters(ProviderErrorFilter)
class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  // Prima di `:id`, perché «options» non sia preso per l'id di un film.
  @Get('options')
  options(): Promise<ProjectOptions> {
    return this.projects.options();
  }

  @Get()
  list(): ProjectsList {
    return this.projects.list();
  }

  @Get(':id')
  get(@Param('id') id: string): Project {
    return this.projects.get(id);
  }

  @Post()
  create(@Body() body: unknown): Promise<Project> {
    return this.projects.create(parseBody(createProjectBodySchema, body));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown): Promise<Project> {
    return this.projects.update(id, parseBody(updateProjectBodySchema, body));
  }
}

@Module({
  imports: [ModerationModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: PROJECT_STORE,
      useFactory: (opened: OpenedDatabase): ProjectStore => createProjectStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [PROJECT_STORE],
})
export class ProjectsModule {}
