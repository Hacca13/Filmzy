import type { StoryBible } from '@filmzy/contracts';
import type { CharacterStore, LocationStore, SheetStore } from '@filmzy/db';
import type { ConfigSource, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { CHARACTER_STORE, SHEET_STORE } from '../cast/tokens.js';
import { characterWithSheet } from '../cast/with-sheet.js';
import { LOCATION_STORE } from '../locations/tokens.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';

/**
 * La Bibbia del film (architettura §3, §5.1, D8): «un unico oggetto che ogni ruolo legge», messo
 * insieme dalle tabelle del database. La assemblano qui, in un posto solo, i compiti che la
 * passano ai ruoli (T3.9 in poi), così nessuno la ricompone a modo suo.
 *
 * Un personaggio ha come scheda le tre immagini del volto **bloccato** (T3.6), un luogo l'immagine
 * del set scelta (T3.7). Il moodboard non c'è finché non arriva l'opzione (T4.10).
 */
@Injectable()
export class BibleService {
  constructor(
    @Inject(CHARACTER_STORE) private readonly characters: CharacterStore,
    @Inject(SHEET_STORE) private readonly sheets: SheetStore,
    @Inject(LOCATION_STORE) private readonly locations: LocationStore,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly projects: ProjectsService,
  ) {}

  async assemble(projectId: string): Promise<StoryBible> {
    const project = this.projects.get(projectId);
    const config = await this.config();

    // Stile e fotografia servono interi: se qualcuno li ha tolti dopo la creazione del film non si
    // può scrivere niente di sensato, e lo si dice (come per lo sceneggiatore).
    const style = config.presets.styles.find((candidate) => candidate.id === project.style);
    if (style === undefined) {
      throw domainError(422, 'config_invalid', { details: { field: 'style' } });
    }
    const cinematography = config.presets.cinematography.find(
      (candidate) => candidate.id === project.cinematography,
    );
    if (cinematography === undefined) {
      throw domainError(422, 'config_invalid', { details: { field: 'cinematography' } });
    }

    return {
      project: {
        id: project.id,
        title: project.title,
        idea: project.idea,
        genre: project.genre,
        tone: project.tone,
        language: project.language,
        durationS: project.durationS,
      },
      style,
      cinematography,
      characters: this.characters
        .list(projectId)
        .map((character) => characterWithSheet(character, this.sheets)),
      locations: this.locations.list(projectId),
      limits: { maxCharacters: config.limits.max_characters },
    };
  }

  /**
   * Gli id dei personaggi e dei luoghi che il film ha adesso, senza il resto della Bibbia (e senza
   * la configurazione): basta per sapere se qualcosa di già pensato cita ancora ciò che esiste.
   */
  knownIds(projectId: string): { characters: Set<string>; locations: Set<string> } {
    this.projects.get(projectId);
    return {
      characters: new Set(this.characters.list(projectId).map((character) => character.id)),
      locations: new Set(this.locations.list(projectId).map((location) => location.id)),
    };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}
