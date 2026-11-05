import {
  type CreateProjectBody,
  type FilmEstimate,
  type FilmKind,
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
  kind?: FilmKind;
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
    kind: project.kind,
    durationS: project.durationS,
  };
}

/**
 * Quello che si manda al server, o niente se manca qualcosa: serve a tenere spento «Continua» e
 * non a decidere cosa è valido (lo controlla il server).
 */
export function toBody(draft: IdeaDraft): CreateProjectBody | undefined {
  const idea = draft.idea.trim();
  const { kind, durationS } = draft;
  if (
    idea === '' ||
    draft.genre === undefined ||
    draft.tone === undefined ||
    draft.style === undefined ||
    draft.cinematography === undefined ||
    kind === undefined ||
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
    kind,
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

const plural = (count: number, one: string, many: string): string =>
  `${String(count)} ${count === 1 ? one : many}`;

/** «30 secondi», «1 minuto», «1 minuto e 30 secondi»: la durata scritta per intero, sul cursore. */
export function formatLength(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const inMinutes = plural(minutes, 'minuto', 'minuti');
  const inSeconds = plural(rest, 'secondo', 'secondi');
  if (minutes === 0) return inSeconds;
  return rest === 0 ? inMinutes : `${inMinutes} e ${inSeconds}`;
}

/** Il nome, la riga che lo spiega e la durata di ogni tipo di film (D85). */
export const FILM_KIND_TEXTS: Record<FilmKind, { name: string; idea: string; length: string }> = {
  spot: { name: 'Spot', idea: 'Un’idea sola, in pochi secondi', length: 'Fino a 1 minuto' },
  short: { name: 'Corto', idea: 'Una storia breve e completa', length: 'Da 1 a 10 minuti' },
  medium: {
    name: 'Mediometraggio',
    idea: 'Una storia con più respiro',
    length: 'Da 10 a 60 minuti',
  },
  feature: { name: 'Lungometraggio', idea: 'Un film vero e proprio', length: 'Oltre 60 minuti' },
};

/** La durata scegliendo un altro tipo: quella di adesso se ci sta, altrimenti quella di partenza del tipo. */
export function lengthForKind(
  { minS, maxS, defaultS }: { minS: number; maxS?: number | undefined; defaultS: number },
  current: number | undefined,
): number {
  return current !== undefined && current >= minS && (maxS === undefined || current <= maxS)
    ? current
    : defaultS;
}

/** «circa 35–70 $»: è solo un'indicazione, e i centesimi darebbero una precisione che non c'è. */
export function formatCostRange(lowUsd: number, highUsd: number): string {
  const whole = (usd: number): string => String(Math.max(1, Math.round(usd)));
  const low = whole(lowUsd);
  const high = whole(highUsd);
  return low === high ? `circa ${low} $` : `circa ${low}–${high} $`;
}

const NO_ESTIMATE: Record<Extract<FilmEstimate, { available: false }>['reason'], string> = {
  no_video_service: 'Non riesco a fare la stima: non hai ancora attivato un servizio video.',
  no_image_service:
    'Non riesco a fare la stima: non hai ancora attivato un servizio per le immagini.',
};

export function noEstimateText(reason: keyof typeof NO_ESTIMATE): string {
  return NO_ESTIMATE[reason];
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
