import type {
  Character,
  CastingInput,
  CastingSuggestion,
  CharacterTag,
  Project,
  ProjectChoice,
  Screenplay,
} from '@filmzy/contracts';
import type { TroupeConfig } from '@filmzy/troupe';

import { domainError } from '../../http/domain-error.js';

type CastingConfig = Pick<TroupeConfig, 'presets'>;

/** I ruoli che si possono dare a un personaggio: i tag attivi dei preset (D22). */
export function enabledTags(config: CastingConfig): CharacterTag[] {
  return config.presets.characterTags.filter((tag) => tag.enabled);
}

export function tagChoices(config: CastingConfig): ProjectChoice[] {
  return enabledTags(config).map(({ id, label, description }) => ({ id, label, description }));
}

/**
 * Una proposta ancora sul tavolo, vista dal casting come un personaggio del cast: così, quando si
 * chiede «Cambia», non ne propone una uguale a quelle che l'utente sta guardando (non ci sono
 * doppioni). Non ha ancora una scheda.
 */
export function suggestionAsCharacter(suggestion: CastingSuggestion, index: number): Character {
  return {
    id: suggestion.proposalId ?? `proposta-${String(index + 1)}`,
    name: suggestion.name,
    tag: suggestion.tag,
    role: suggestion.role,
    description: suggestion.description,
    ...(suggestion.profile === undefined ? {} : { profile: suggestion.profile }),
    appearance: suggestion.appearance,
    sheet: [],
    ...(suggestion.proposalId === undefined ? {} : { proposalId: suggestion.proposalId }),
  };
}

export interface CastingInputArgs {
  project: Project;
  config: CastingConfig;
  /** L'ultima bozza della storia, da cui il casting parte; `null` se non c'è ancora. */
  screenplay: Screenplay | null;
  /** I personaggi già nel cast, più le proposte ancora sul tavolo. */
  cast: Character[];
  count: number;
}

/**
 * Cosa si dice al direttore del casting (architettura §5.3): il cast attuale è **sempre** nell'input,
 * così non propone doppioni. Genere e tono mancano dai preset solo se qualcuno li ha tolti dopo la
 * creazione del film: basta l'id (lo legge il modello, non l'utente); lo stile serve intero.
 */
export function castingInput(args: CastingInputArgs): CastingInput {
  const { project, config } = args;
  const style = config.presets.styles.find((candidate) => candidate.id === project.style);
  if (style === undefined)
    throw domainError(422, 'config_invalid', { details: { field: 'style' } });

  return {
    mode: 'initial',
    idea: project.idea,
    genre: config.presets.genres.find((genre) => genre.id === project.genre) ?? {
      id: project.genre,
      label: project.genre,
    },
    tone: config.presets.tones.find((tone) => tone.id === project.tone) ?? {
      id: project.tone,
      label: project.tone,
    },
    style,
    screenplay: args.screenplay,
    cast: args.cast,
    scene: null,
    count: args.count,
    tags: enabledTags(config),
    language: project.language,
  };
}

const nameKey = (name: string): string => name.trim().toLocaleLowerCase('it-IT');

/**
 * Le proposte del casting ripulite prima di mostrarle. Il casting è un modello: può dare di più o
 * di meno di quanto chiesto, ripetere un nome o scegliere un tag che non c'è. Qui si tiene solo ciò
 * che si può usare: personaggi nuovi (riusare un personaggio esistente ha senso durante le scene),
 * con un tag dei preset, senza doppioni fra loro né con il cast, e **non più di quante richieste**.
 */
export function usableSuggestions(
  suggestions: readonly CastingSuggestion[],
  options: { count: number; taken: readonly Character[]; tags: readonly CharacterTag[] },
): CastingSuggestion[] {
  const seen = new Set(options.taken.map((character) => nameKey(character.name)));
  const allowedTags = new Set(options.tags.map((tag) => tag.id));
  const usable: CastingSuggestion[] = [];

  for (const suggestion of suggestions) {
    const key = nameKey(suggestion.name);
    if (suggestion.action !== 'new' || !allowedTags.has(suggestion.tag) || seen.has(key)) continue;
    seen.add(key);
    usable.push(suggestion);
  }
  return usable.slice(0, options.count);
}
