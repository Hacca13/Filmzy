import { MAX_PALETTE_COLORS, type Color, type Moodboard } from '@filmzy/contracts';

/**
 * Le piccole decisioni del moodboard (T4.10, D37), fuori dai componenti così si provano a parte. Cosa
 * è valido lo decide il server; qui si dice solo come costruire e cambiare la palette in modifica.
 */

/** Il colore che parte quando se ne aggiunge uno: un ambra caldo, da cambiare subito. */
export const NEW_COLOR_HEX = '#c2813a';

/** La palette e i consigli di una parte, quelli che si modificano a mano. */
export interface PartText {
  palette: readonly Color[];
  notes: string;
}

/** La parte del film (senza `sceneId`) o di una scena; una scena senza parte sua è vuota (vale quella del film). */
export function partOf(moodboard: Moodboard, sceneId: string | undefined): PartText {
  const part =
    sceneId === undefined
      ? moodboard.film
      : moodboard.scenes.find((scene) => scene.sceneId === sceneId);
  return { palette: part?.palette ?? [], notes: part?.notes ?? '' };
}

export const canAddColor = (palette: readonly Color[]): boolean =>
  palette.length < MAX_PALETTE_COLORS;

export function addColor(palette: readonly Color[]): Color[] {
  return canAddColor(palette) ? [...palette, { hex: NEW_COLOR_HEX }] : [...palette];
}

/** Cambia il colore (e/o il nome) in una posizione; un nome vuoto toglie il nome. */
export function changeColor(
  palette: readonly Color[],
  index: number,
  change: { hex?: string; name?: string },
): Color[] {
  return palette.map((color, position) => {
    if (position !== index) return color;
    const name = change.name === undefined ? color.name : change.name.trim();
    return {
      hex: change.hex ?? color.hex,
      ...(name === undefined || name === '' ? {} : { name }),
      ...(color.use === undefined ? {} : { use: color.use }),
    };
  });
}

export const removeColor = (palette: readonly Color[], index: number): Color[] =>
  palette.filter((_color, position) => position !== index);

/** Le due parti dicono la stessa cosa: serve a spegnere «Salva» finché non c'è niente di nuovo. */
export function samePart(a: PartText, b: PartText): boolean {
  return (
    a.notes.trim() === b.notes.trim() &&
    a.palette.length === b.palette.length &&
    a.palette.every(
      (color, index) =>
        color.hex.toLowerCase() === b.palette.at(index)?.hex.toLowerCase() &&
        (color.name ?? '') === (b.palette.at(index)?.name ?? ''),
    )
  );
}
