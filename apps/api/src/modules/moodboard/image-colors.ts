import type { Color } from '@filmzy/contracts';
import { MediaError, dominantColors } from '@filmzy/media';
import type { Logger } from '@nestjs/common';

/** Quanti colori dominanti si calcolano di ogni immagine. */
const COLORS_PER_IMAGE = 4;

/**
 * I colori dominanti di un'immagine del moodboard, calcolati dal codice (esatti e gratis, D37): il
 * primo regge l'immagine, gli altri la accompagnano. Se l'immagine non si legge si va avanti senza
 * colori: è già arrivata (e magari pagata) e i colori si possono rifare.
 */
export async function imageColors(file: string, log: Logger): Promise<Color[]> {
  try {
    const hexes = await dominantColors({ input: file, count: COLORS_PER_IMAGE });
    return hexes.map((hex, index) => ({ hex, use: index === 0 ? 'dominante' : 'accento' }));
  } catch (error) {
    if (error instanceof MediaError) {
      log.warn(`Colori dell'immagine non letti: ${error.code}.`);
      return [];
    }
    throw error;
  }
}
