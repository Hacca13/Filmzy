import type {
  AcceptedElement,
  Character,
  Location,
  Project,
  Screenplay,
  ScreenwriterInput,
} from '@filmzy/contracts';
import type { TroupeConfig } from '@filmzy/troupe';

import { domainError } from '../../http/domain-error.js';

export interface ScreenwriterInputArgs {
  project: Project;
  /** Quello che serve della configurazione attiva: i preset, i limiti e le funzioni. */
  config: Pick<TroupeConfig, 'presets' | 'limits' | 'features'>;
  mode: 'draft' | 'revise' | 'final';
  /** L'ultima versione della bozza, da cui parte una modifica o la stesura; `null` per una bozza da zero. */
  draft: Screenplay | null;
  /** La richiesta dell'utente, solo per una modifica. */
  request: string | null;
  /** Solo per la stesura ufficiale (T3.8): il cast e i luoghi scelti, e ciò che l'utente ha tenuto della bozza. */
  chosen?: { characters: Character[]; locations: Location[]; accepted: AcceptedElement[] };
}

/**
 * Cosa si dice allo sceneggiatore, dal film e dalla configurazione attiva (architettura §5.3).
 * Genere e tono mancano dai preset solo se qualcuno li ha tolti dopo la creazione del film: per
 * quelli basta l'id (lo legge il modello, non l'utente). Lo stile serve intero e senza non si può
 * scrivere, quindi manca → `config_invalid`.
 *
 * Nella bozza e nelle sue modifiche personaggi e luoghi scelti non servono: la bozza li propone, non
 * li usa. Nella stesura ufficiale (`chosen`) lo sceneggiatore riceve invece cast e luoghi scelti, e gli
 * elementi della bozza che l'utente ha deciso di tenere al riepilogo (D18).
 */
export function screenwriterInput(args: ScreenwriterInputArgs): ScreenwriterInput {
  const { project, config } = args;
  const style = config.presets.styles.find((candidate) => candidate.id === project.style);
  if (style === undefined) {
    throw domainError(422, 'config_invalid', { details: { field: 'style' } });
  }

  return {
    mode: args.mode,
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
    durationS: project.durationS,
    language: project.language,
    maxCharacters: config.limits.max_characters,
    dialogueEnabled: config.features.dialogue,
    characters: args.chosen?.characters ?? [],
    locations: args.chosen?.locations ?? [],
    draft: args.draft,
    request: args.request,
    accepted: args.chosen?.accepted ?? [],
  };
}
