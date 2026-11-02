import {
  PROJECT_DURATIONS_S,
  type CreateProjectBody,
  type Project,
  type ProjectChoice,
  type ProjectOptions,
  type ProjectPhase,
} from '@filmzy/contracts';

/**
 * Le piccole decisioni delle schermate del film (T3.2), fuori dai componenti così si provano a
 * parte. Cosa si può scegliere e cosa è valido lo dice il server; qui si dice solo come mostrarlo.
 */

/** Cosa l'utente sta scrivendo nel wizard: i campi ancora vuoti mancano. */
export interface IdeaDraft {
  idea: string;
  title: string;
  genre?: string;
  tone?: string;
  style?: string;
  cinematography?: string;
  durationS?: number;
}

/** Il wizard si apre con le voci già scelte dal server: per partire basta scrivere l'idea. */
export function initialDraft(options: ProjectOptions): IdeaDraft {
  return { idea: '', title: '', ...options.defaults };
}

/** Il wizard di un film già creato parte da quello che c'è. */
export function draftOf(project: Project): IdeaDraft {
  return {
    idea: project.idea,
    title: project.title,
    genre: project.genre,
    tone: project.tone,
    style: project.style,
    cinematography: project.cinematography,
    durationS: project.durationS,
  };
}

/**
 * Quello che si manda al server, o niente se manca qualcosa: serve a tenere spento «Continua» e
 * non a decidere cosa è valido (lo controlla il server).
 */
export function toBody(draft: IdeaDraft): CreateProjectBody | undefined {
  const idea = draft.idea.trim();
  const durationS = PROJECT_DURATIONS_S.find((duration) => duration === draft.durationS);
  if (
    idea === '' ||
    draft.genre === undefined ||
    draft.tone === undefined ||
    draft.style === undefined ||
    draft.cinematography === undefined ||
    durationS === undefined
  ) {
    return undefined;
  }
  return {
    idea,
    title: draft.title.trim(),
    genre: draft.genre,
    tone: draft.tone,
    style: draft.style,
    cinematography: draft.cinematography,
    durationS,
  };
}

/** «30 s», «1 min», «1 min 30 s»: come si dice a voce. */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${String(rest)} s`;
  return rest === 0 ? `${String(minutes)} min` : `${String(minutes)} min ${String(rest)} s`;
}

/** I nomi dei passi del film, quelli della barra del mockup (architettura §3.1). */
const PHASE_LABELS: Record<ProjectPhase, string> = {
  idea: 'La tua idea',
  draft: 'La storia',
  moodboard: 'Moodboard',
  cast: 'Personaggi',
  locations: 'Luoghi',
  review: 'Riepilogo',
  final: 'Sceneggiatura',
  shots: 'Le scene',
  sound: 'Suono',
  export: 'Montaggio',
};

export function phaseLabel(phase: ProjectPhase): string {
  return PHASE_LABELS[phase];
}

/** Il nome di una voce, se l'elenco c'è e la voce pure: mai l'id tecnico (regola 12). */
export function choiceLabel(
  choices: readonly ProjectChoice[] | undefined,
  id: string,
): string | undefined {
  return choices?.find((choice) => choice.id === id)?.label;
}

/** «Drammatico · 1 min»: la riga sotto il titolo del film. */
export function filmSubtitle(project: Project, options: ProjectOptions | undefined): string {
  return [choiceLabel(options?.genres, project.genre), formatDuration(project.durationS)]
    .filter((part): part is string => part !== undefined)
    .join(' · ');
}
