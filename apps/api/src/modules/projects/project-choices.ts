import {
  IDEA_MAX_LENGTH,
  PROJECT_DURATIONS_S,
  type ProjectDefaults,
  TITLE_MAX_LENGTH,
  type ProjectChoice,
  type ProjectOptions,
  type TroupePresetsData,
  type UpdateProjectBody,
} from '@filmzy/contracts';

/**
 * Le scelte del wizard «La tua idea» (T3.2), ricavate dai preset della release attiva: nel codice
 * non c'è nessun genere o stile, sono dati (regola 2). Gli stili e le fotografie spenti non si
 * offrono, e non si accettano se qualcuno li manda lo stesso.
 */

/** Quante parole dell'idea fanno il titolo provvisorio. */
const TITLE_WORDS = 5;

const FALLBACK_TITLE = 'Il mio film';

/** La durata proposta se c'è fra le scelte: un minuto, che costa il giusto per una prima prova. */
const DEFAULT_DURATION_S = 60;

/** Punteggiatura e spazi che non stanno bene in fondo a un titolo. */
const TRAILING_PUNCTUATION = /[\s.,;:!?…«»"'’‘“”-]+$/u;

type ChoiceField = 'genre' | 'tone' | 'style' | 'cinematography';

function enabledChoices(
  entries: readonly { id: string; label: string; description?: string; enabled?: boolean }[],
): ProjectChoice[] {
  return entries
    .filter((entry) => entry.enabled !== false)
    .map(({ id, label, description }) => ({
      id,
      label,
      ...(description === undefined ? {} : { description }),
    }));
}

/** La prima voce attiva, o niente se non ce ne sono: ogni scelta del wizard parte da lì. */
function firstId(choices: readonly ProjectChoice[]): string | undefined {
  return choices[0]?.id;
}

function defaultsOf(options: Omit<ProjectOptions, 'defaults'>): ProjectDefaults {
  const genre = firstId(options.genres);
  const tone = firstId(options.tones);
  const style = firstId(options.styles);
  const cinematography = firstId(options.cinematography);
  const durationS =
    options.durationsS.find((duration) => duration === DEFAULT_DURATION_S) ?? options.durationsS[0];
  return {
    ...(genre === undefined ? {} : { genre }),
    ...(tone === undefined ? {} : { tone }),
    ...(style === undefined ? {} : { style }),
    ...(cinematography === undefined ? {} : { cinematography }),
    ...(durationS === undefined ? {} : { durationS }),
  };
}

export function projectOptions(presets: TroupePresetsData): ProjectOptions {
  const options = {
    genres: enabledChoices(presets.genres),
    tones: enabledChoices(presets.tones),
    styles: enabledChoices(presets.styles),
    cinematography: enabledChoices(presets.cinematography),
    durationsS: [...PROJECT_DURATIONS_S],
    ideaMaxLength: IDEA_MAX_LENGTH,
    titleMaxLength: TITLE_MAX_LENGTH,
  };
  return { ...options, defaults: defaultsOf(options) };
}

/** Il primo campo scelto che non è fra le voci attive dei preset: serve a dire quale correggere. */
export function unknownChoice(
  presets: TroupePresetsData,
  body: UpdateProjectBody,
): ChoiceField | undefined {
  const options = projectOptions(presets);
  const fields: [ChoiceField, ProjectChoice[]][] = [
    ['genre', options.genres],
    ['tone', options.tones],
    ['style', options.styles],
    ['cinematography', options.cinematography],
  ];
  return fields.find(([field, choices]) => {
    const chosen = body[field];
    return chosen !== undefined && !choices.some((choice) => choice.id === chosen);
  })?.[0];
}

/**
 * Il titolo provvisorio di un film senza titolo: le prime parole dell'idea, con la maiuscola e
 * senza punteggiatura in fondo. Si può sempre cambiare.
 */
export function defaultTitle(idea: string): string {
  const words = idea
    .split(/\s+/)
    .filter((word) => word !== '')
    .slice(0, TITLE_WORDS)
    .join(' ')
    .replace(TRAILING_PUNCTUATION, '');
  if (words === '') return FALLBACK_TITLE;

  const title = words.charAt(0).toLocaleUpperCase('it-IT') + words.slice(1);
  return title.slice(0, TITLE_MAX_LENGTH);
}
