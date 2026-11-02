import type {
  Character,
  DraftReview,
  EditFinalBody,
  Location,
  ScreenplayEstimate,
  ScreenplayVersion,
  WriteFinalBody,
} from '@filmzy/contracts';
import type { CharacterStore, LocationStore, ScreenplayStore } from '@filmzy/db';
import type { ConfigSource, Troupe, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { CHARACTER_STORE } from '../cast/tokens.js';
import { LOCATION_STORE } from '../locations/tokens.js';
import { ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { screenwriterInput } from '../screenplay/screenwriter-input.js';
import { SCREENPLAY_STORE } from '../screenplay/tokens.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import {
  assertFinalIsConsistent,
  changedText,
  isSameScreenplay,
  settleFinal,
} from './final-rules.js';
import { acceptedFromAnswers, compareDraftWithChoices } from './review.js';

/**
 * Il riepilogo e la stesura ufficiale (T3.8, architettura §3.1, D18). Il confronto fra la bozza e le
 * scelte lo fa il codice; poi lo sceneggiatore scrive la stesura ufficiale con **solo** il cast e i
 * luoghi scelti, più gli elementi della bozza che l'utente ha deciso di tenere. La stesura si può
 * correggere come testo: ogni salvataggio è una versione nuova e le precedenti restano.
 *
 * Scrivere costa: passa dai limiti di spesa come ogni chiamata (`spendConfirmed`). Il testo che
 * l'utente corregge a mano passa dal moderatore, perché poi andrà ai servizi che si pagano.
 */
@Injectable()
export class FinalScreenplayService {
  constructor(
    @Inject(SCREENPLAY_STORE) private readonly store: ScreenplayStore,
    @Inject(CHARACTER_STORE) private readonly characters: CharacterStore,
    @Inject(LOCATION_STORE) private readonly locations: LocationStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly screenplays: ScreenplayService,
    private readonly projects: ProjectsService,
    private readonly moderation: ModerationService,
  ) {}

  /** La bozza (l'ultima versione) confrontata con cast e luoghi scelti. */
  review(projectId: string): DraftReview {
    this.projects.get(projectId);
    const draft = this.screenplays.latest(projectId, 'draft');
    return {
      draftVersionId: draft.id,
      differences: compareDraftWithChoices(
        draft.screenplay,
        this.characters.list(projectId),
        this.locations.list(projectId),
      ),
    };
  }

  /** Quanto costerebbe la stesura, prima di chiederla (D30). */
  async estimate(projectId: string): Promise<ScreenplayEstimate> {
    const project = this.projects.get(projectId);
    const draft = this.screenplays.latest(projectId, 'draft');
    const config = await this.config();

    const estimate = await this.troupe.estimate(
      'screenwriter',
      screenwriterInput({
        project,
        config,
        mode: 'final',
        draft: draft.screenplay,
        request: null,
        chosen: forTheModel(this.characters.list(projectId), this.locations.list(projectId), []),
      }),
    );
    return { estimate };
  }

  /** «Scrivi la sceneggiatura finale»: una versione nuova, anche se ce n'erano già. */
  async write(projectId: string, body: WriteFinalBody): Promise<ScreenplayVersion> {
    const project = this.projects.get(projectId);
    const draft = this.screenplays.latest(projectId, 'draft');
    const characters = this.characters.list(projectId);
    const locations = this.locations.list(projectId);
    // Le risposte si controllano prima di spendere: una risposta mancante o vecchia ferma tutto.
    const accepted = acceptedFromAnswers(
      compareDraftWithChoices(draft.screenplay, characters, locations),
      body.answers,
    );
    const config = await this.config();

    const { data, receipt } = await this.troupe.run(
      'screenwriter',
      screenwriterInput({
        project,
        config,
        mode: 'final',
        draft: draft.screenplay,
        request: null,
        chosen: forTheModel(characters, locations, accepted),
      }),
      {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      },
    );

    const version = this.store.create({
      projectId,
      stage: 'final',
      screenplay: settleFinal(data, { characters, locations }),
      generationId: receipt.id,
    });
    this.projects.reach(projectId, 'final');
    return version;
  }

  /**
   * La stesura corretta a mano: una versione nuova, senza chiamare lo sceneggiatore. Se non è
   * cambiato niente restituisce l'ultima, senza creare una versione uguale.
   */
  async edit(projectId: string, body: EditFinalBody): Promise<ScreenplayVersion> {
    const project = this.projects.get(projectId);
    const latest = this.screenplays.latest(projectId, 'final');
    const bible = {
      characters: this.characters.list(projectId),
      locations: this.locations.list(projectId),
    };
    assertFinalIsConsistent(body.screenplay, bible, latest.screenplay);
    // Si salva ripulita: un personaggio tolto dal film dopo la stesura non resta citato nelle scene.
    const next = settleFinal(body.screenplay, bible);
    if (isSameScreenplay(latest.screenplay, next)) return latest;

    const text = changedText(latest.screenplay, next);
    if (text !== '') {
      await this.moderation.assertAllowed({
        text,
        context: 'scene',
        language: project.language,
        projectId,
      });
    }
    return this.store.create({ projectId, stage: 'final', screenplay: next });
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

/**
 * Cosa vede lo sceneggiatore del cast e dei luoghi: il testo, non le immagini. Le schede e i
 * riferimenti sono file del computer dell'utente e a un servizio di testo non servono.
 */
function forTheModel(
  characters: readonly Character[],
  locations: readonly Location[],
  accepted: ReturnType<typeof acceptedFromAnswers>,
) {
  return {
    characters: characters.map((character) => ({ ...character, sheet: [] })),
    locations: locations.map((location) => ({ ...location, references: [] })),
    accepted,
  };
}
