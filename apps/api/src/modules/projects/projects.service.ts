import type {
  CreateProjectBody,
  Project,
  ProjectOptions,
  ProjectsList,
  TroupePresetsData,
  UpdateProjectBody,
} from '@filmzy/contracts';
import type { ProjectStore } from '@filmzy/db';
import type { ConfigSource } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';
import { defaultTitle, projectOptions, unknownChoice } from './project-choices.js';
import { PROJECT_STORE } from './tokens.js';

/** La lingua dei film: l'interfaccia e le storie sono in italiano, per ora. */
const DEFAULT_LANGUAGE = 'it';

/**
 * I film (T3.2, architettura §3.1). Il wizard crea il film con l'idea già scelta e quindi lo mette
 * alla fase successiva, la bozza della storia; l'idea si può rivedere in qualsiasi fase senza
 * spostarla. Le fasi dopo si muovono con i compiti che le fanno (T3.4 in poi).
 */
@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_STORE) private readonly store: ProjectStore,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
  ) {}

  async options(): Promise<ProjectOptions> {
    return projectOptions(await this.presets());
  }

  async create(body: CreateProjectBody): Promise<Project> {
    this.assertChoicesExist(await this.presets(), body);
    return this.store.create({
      title: body.title === undefined || body.title === '' ? defaultTitle(body.idea) : body.title,
      idea: body.idea,
      genre: body.genre,
      tone: body.tone,
      style: body.style,
      cinematography: body.cinematography,
      language: DEFAULT_LANGUAGE,
      durationS: body.durationS,
      phase: 'draft',
    });
  }

  list(): ProjectsList {
    return { projects: this.store.list() };
  }

  get(id: string): Project {
    const project = this.store.get(id);
    if (project === undefined) throw domainError(404, 'not_found', { details: { field: 'id' } });
    return project;
  }

  async update(id: string, body: UpdateProjectBody): Promise<Project> {
    const current = this.get(id);
    this.assertChoicesExist(await this.presets(), body);

    // Un titolo svuotato torna a quello proposto dall'idea (quella nuova, se cambia insieme).
    const { title, ...rest } = body;
    const changes = {
      ...rest,
      ...(title === undefined
        ? {}
        : { title: title === '' ? defaultTitle(body.idea ?? current.idea) : title }),
    };
    const updated = this.store.update(id, changes);
    if (updated === undefined) throw domainError(404, 'not_found', { details: { field: 'id' } });
    return updated;
  }

  private assertChoicesExist(presets: TroupePresetsData, body: UpdateProjectBody): void {
    const field = unknownChoice(presets, body);
    if (field !== undefined) throw domainError(400, 'invalid_request', { details: { field } });
  }

  private async presets(): Promise<TroupePresetsData> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config.presets;
  }
}
