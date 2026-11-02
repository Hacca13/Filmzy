import type {
  AddCharacterBody,
  Cast,
  CastEstimate,
  CastSuggestions,
  Character,
  SuggestCastBody,
  UpdateCharacterBody,
} from '@filmzy/contracts';
import type { CharacterStore, ScreenplayStore, SheetStore } from '@filmzy/db';
import type { ConfigSource, Troupe, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SCREENPLAY_STORE } from '../screenplay/tokens.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import {
  castingInput,
  enabledTags,
  suggestionAsCharacter,
  tagChoices,
  usableSuggestions,
} from './casting-input.js';
import { CHARACTER_STORE, SHEET_STORE } from './tokens.js';

/**
 * Il cast del film (T3.5, architettura §3.1, D18, D22): il direttore del casting propone i
 * personaggi a partire dalla bozza, e l'utente li aggiunge, cambia o scarta. Solo quelli aggiunti
 * entrano nella Bibbia. Non se ne possono avere più di `max_characters`: lo applica il backend.
 *
 * Le proposte si pagano (stima prima, limite di spesa come ogni chiamata) e non si salvano: sono
 * sul tavolo fino a che l'utente sceglie. Il testo che l'utente cambia a mano passa dal moderatore.
 */
@Injectable()
export class CastService {
  constructor(
    @Inject(CHARACTER_STORE) private readonly store: CharacterStore,
    @Inject(SHEET_STORE) private readonly sheets: SheetStore,
    @Inject(SCREENPLAY_STORE) private readonly screenplays: ScreenplayStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly projects: ProjectsService,
    private readonly moderation: ModerationService,
  ) {}

  async cast(projectId: string): Promise<Cast> {
    this.projects.get(projectId);
    const config = await this.config();
    return {
      characters: this.store.list(projectId).map((character) => this.withSheet(character)),
      maxCharacters: config.limits.max_characters,
      tags: tagChoices(config),
    };
  }

  /** Quanto costerebbe chiedere `count` proposte, senza chiamare nessuno (D30). */
  async estimate(projectId: string, count: number): Promise<CastEstimate> {
    const project = this.projects.get(projectId);
    const config = await this.config();
    this.assertRoomFor(count, this.store.list(projectId), config);

    const estimate = await this.troupe.estimate(
      'casting',
      castingInput({
        project,
        config,
        screenplay: this.latestDraft(projectId),
        cast: this.store.list(projectId),
        count,
      }),
    );
    return { estimate };
  }

  /** Le proposte del casting: quante richieste al massimo, senza doppioni, dai preset dei ruoli. */
  async suggest(projectId: string, body: SuggestCastBody): Promise<CastSuggestions> {
    const project = this.projects.get(projectId);
    const config = await this.config();
    const saved = this.store.list(projectId);
    this.assertRoomFor(body.count, saved, config);

    // Il cast attuale è sempre nell'input: i personaggi scelti e le proposte ancora sul tavolo.
    const pending = (body.pending ?? []).map(suggestionAsCharacter);
    const taken = [...saved, ...pending];

    const { data } = await this.troupe.run(
      'casting',
      castingInput({
        project,
        config,
        screenplay: this.latestDraft(projectId),
        cast: taken,
        count: body.count,
      }),
      {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      },
    );
    return {
      suggestions: usableSuggestions(data.suggestions, {
        count: body.count,
        taken,
        tags: enabledTags(config),
      }),
    };
  }

  /** «Aggiungi»: la proposta diventa un personaggio del film. */
  async add(projectId: string, body: AddCharacterBody): Promise<Character> {
    this.projects.get(projectId);
    const config = await this.config();
    const { suggestion } = body;
    const saved = this.store.list(projectId);

    if (suggestion.action !== 'new') {
      throw domainError(400, 'invalid_request', { details: { field: 'suggestion.action' } });
    }
    if (!enabledTags(config).some((tag) => tag.id === suggestion.tag)) {
      throw domainError(400, 'invalid_request', { details: { field: 'suggestion.tag' } });
    }
    if (saved.length >= config.limits.max_characters) {
      throw domainError(409, 'invalid_request', { details: { field: 'cast' } });
    }
    if (saved.some((character) => sameName(character.name, suggestion.name))) {
      throw domainError(409, 'invalid_request', { details: { field: 'suggestion.name' } });
    }

    const character = this.store.create(projectId, {
      name: suggestion.name,
      tag: suggestion.tag,
      role: suggestion.role,
      description: suggestion.description,
      ...(suggestion.profile === undefined ? {} : { profile: suggestion.profile }),
      appearance: suggestion.appearance,
      ...(suggestion.proposalId === undefined ? {} : { proposalId: suggestion.proposalId }),
    });
    this.projects.reach(projectId, 'cast');
    return character;
  }

  /** Rivede il tag e i dettagli di un personaggio; il testo cambiato passa dal moderatore (T3.3). */
  async update(
    projectId: string,
    characterId: string,
    body: UpdateCharacterBody,
  ): Promise<Character> {
    const project = this.projects.get(projectId);
    const character = this.characterOf(projectId, characterId);
    const config = await this.config();

    if (body.tag !== undefined && !enabledTags(config).some((tag) => tag.id === body.tag)) {
      throw domainError(400, 'invalid_request', { details: { field: 'tag' } });
    }
    if (body.name !== undefined && this.takenByAnother(projectId, characterId, body.name)) {
      throw domainError(409, 'invalid_request', { details: { field: 'name' } });
    }

    const text = changedText(character, body);
    if (text !== '') {
      await this.moderation.assertAllowed({
        text,
        context: 'character',
        language: project.language,
        projectId,
      });
    }

    const updated = this.store.update(characterId, body);
    if (updated === undefined) throw domainError(404, 'not_found', { details: { field: 'id' } });
    return this.withSheet(updated);
  }

  /** «Scarta» un personaggio già aggiunto. */
  remove(projectId: string, characterId: string): void {
    this.projects.get(projectId);
    this.characterOf(projectId, characterId);
    this.store.remove(characterId);
    this.sheets.removeFor(characterId);
  }

  /**
   * I riferimenti del personaggio sono le tre immagini della scheda **bloccata** (T3.6): senza
   * volto bloccato la scheda è ancora vuota.
   */
  private withSheet(character: Character): Character {
    return {
      ...character,
      sheet: this.sheets.lockedAssetIds(character.id).map((assetId) => ({ assetId })),
    };
  }

  /** Il personaggio deve essere di quel film: l'id di un altro film non vale. */
  private characterOf(projectId: string, characterId: string): Character {
    const character = this.store.list(projectId).find((candidate) => candidate.id === characterId);
    if (character === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'id' } });
    }
    return character;
  }

  private takenByAnother(projectId: string, characterId: string, name: string): boolean {
    return this.store
      .list(projectId)
      .some((candidate) => candidate.id !== characterId && sameName(candidate.name, name));
  }

  /** Le proposte non possono superare i posti ancora liberi nel cast. */
  private assertRoomFor(count: number, saved: readonly Character[], config: TroupeConfig): void {
    if (count > config.limits.max_characters - saved.length) {
      throw domainError(400, 'invalid_request', { details: { field: 'count' } });
    }
  }

  private latestDraft(projectId: string) {
    return this.screenplays.latest(projectId, 'draft')?.screenplay ?? null;
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

const sameName = (a: string, b: string): boolean =>
  a.trim().toLocaleLowerCase('it-IT') === b.trim().toLocaleLowerCase('it-IT');

/**
 * Il testo che l'utente ha cambiato a mano in questa richiesta, da controllare: solo i campi che
 * cambiano davvero, così non si ripaga un testo già controllato.
 */
function changedText(current: Character, body: UpdateCharacterBody): string {
  const fresh = [
    body.name !== current.name ? body.name : undefined,
    body.role !== current.role ? body.role : undefined,
    body.description !== current.description ? body.description : undefined,
    body.profile?.personality !== current.profile?.personality
      ? body.profile?.personality
      : undefined,
    body.profile?.behavior !== current.profile?.behavior ? body.profile?.behavior : undefined,
    body.profile?.goal !== current.profile?.goal ? body.profile?.goal : undefined,
  ];
  return fresh.filter((text) => text !== undefined && text !== '').join('\n');
}
