import type { Moodboard, MoodboardBrief, MoodboardPart } from '@filmzy/contracts';

/**
 * La vista di solo testo del moodboard che leggono i ruoli (T4.10, architettura §5.7, D37): palette,
 * consigli e le descrizioni delle immagini. **Le immagini non vanno da sole ai modelli di
 * generazione.** Senza niente — nessun colore, consiglio o immagine — il moodboard non c'è e i ruoli
 * lavorano come prima (`undefined`).
 */

const hasContent = (part: Pick<MoodboardPart, 'palette' | 'notes'>): boolean =>
  part.palette.length > 0 || part.notes.trim() !== '';

export function moodboardBrief(moodboard: Moodboard, sceneId?: string): MoodboardBrief | undefined {
  const scene =
    sceneId === undefined ? undefined : moodboard.scenes.find((part) => part.sceneId === sceneId);
  const filmHas = hasContent(moodboard.film) || moodboard.film.references.length > 0;
  const sceneHas = scene !== undefined && (hasContent(scene) || scene.references.length > 0);
  if (!filmHas && !sceneHas) return undefined;

  return {
    palette: moodboard.film.palette,
    notes: moodboard.film.notes,
    referenceDescriptions: [...moodboard.film.references, ...(scene?.references ?? [])].map(
      (reference) => reference.description,
    ),
    // La parte della scena porta solo i suoi colori e consigli: se è vuota, vale quella del film. Il campo
    // c'è sempre (`null` senza parte): le istruzioni lo leggono senza controllare che esista.
    scene:
      scene !== undefined && hasContent(scene)
        ? { palette: scene.palette, notes: scene.notes }
        : null,
  };
}
