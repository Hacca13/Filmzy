import type {
  ReviewAnswer,
  ReviewDecision,
  ReviewDifference,
  Screenplay,
  ScreenplayVersionSummary,
} from '@filmzy/contracts';

/**
 * Le piccole decisioni del riepilogo e della stesura ufficiale (T3.8), fuori dai componenti così
 * si provano a parte. Quali sono le differenze e cosa si può rispondere lo dice il server; qui si
 * dice solo come mostrarlo.
 */

/** La frase che spiega una differenza, in parole semplici (D18). */
export function describeDifference(difference: ReviewDifference): string {
  const person = difference.kind === 'character';
  if (difference.reason === 'not_chosen') {
    return person
      ? `Nella bozza c’è ${difference.name}, ma non l’hai scelto tra i personaggi.`
      : `Nella bozza c’è il luogo «${difference.name}», ma non l’hai aggiunto ai luoghi.`;
  }
  return person
    ? `Hai scelto ${difference.name}, ma la bozza non lo nomina: la sceneggiatura finale lo inserirà nella storia.`
    : `Hai aggiunto il luogo «${difference.name}», ma la bozza non lo nomina: la sceneggiatura finale lo inserirà nella storia.`;
}

/** Le differenze su cui l'utente deve rispondere prima di scrivere. */
const toDecide = (differences: readonly ReviewDifference[]) =>
  differences.filter((difference) => difference.choices.length > 0);

/** Si può scrivere quando ogni differenza su cui si decide ha la sua risposta. */
export function canWrite(
  differences: readonly ReviewDifference[],
  answers: Readonly<Record<string, ReviewDecision>>,
): boolean {
  return toDecide(differences).every((difference) => answers[difference.key] !== undefined);
}

/** Le risposte da mandare: solo quelle a differenze che ci sono ancora (il cast può essere cambiato). */
export function answersFor(
  differences: readonly ReviewDifference[],
  answers: Readonly<Record<string, ReviewDecision>>,
): ReviewAnswer[] {
  return toDecide(differences).flatMap((difference) => {
    const decision = answers[difference.key];
    return decision === undefined ? [] : [{ key: difference.key, decision }];
  });
}

/** Cosa ha prodotto una versione della stesura: lo sceneggiatore o l'utente a mano. */
export function finalVersionNote(version: ScreenplayVersionSummary): string {
  return version.generationId === undefined ? 'Corretta a mano' : 'Scritta dallo sceneggiatore';
}

/** I testi che l'utente può correggere: titolo, trama e, per ogni scena, intestazione, momento e riassunto. */
export interface FinalEdits {
  title: string;
  logline: string;
  scenes: { heading: string; timeOfDay: string; summary: string }[];
}

export function editsOf(screenplay: Screenplay): FinalEdits {
  return {
    title: screenplay.title,
    logline: screenplay.logline,
    scenes: screenplay.scenes.map(({ heading, timeOfDay, summary }) => ({
      heading,
      timeOfDay,
      summary,
    })),
  };
}

/** La stesura con i testi corretti (senza spazi ai bordi): il resto, personaggi e luoghi compresi, non si tocca. */
export function applyEdits(screenplay: Screenplay, edits: FinalEdits): Screenplay {
  return {
    ...screenplay,
    title: edits.title.trim(),
    logline: edits.logline.trim(),
    scenes: screenplay.scenes.map((scene, index) => {
      const edit = edits.scenes[index];
      return edit === undefined
        ? scene
        : {
            ...scene,
            heading: edit.heading.trim(),
            timeOfDay: edit.timeOfDay.trim(),
            summary: edit.summary.trim(),
          };
    }),
  };
}

/** Si può salvare se qualcosa è cambiato e nessun testo è rimasto vuoto. */
export function canSave(screenplay: Screenplay, edits: FinalEdits): boolean {
  const texts = [edits.title, edits.logline, ...edits.scenes.flatMap((s) => Object.values(s))];
  if (texts.some((text) => text.trim() === '')) return false;
  return JSON.stringify(applyEdits(screenplay, edits)) !== JSON.stringify(screenplay);
}
