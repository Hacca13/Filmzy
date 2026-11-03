import type { ImageCandidate, ShotImage, ShotImageChoice } from '@filmzy/contracts';

import { formatMoment } from './takes-model';

/**
 * Le piccole decisioni di «Imposta le immagini» (T4.2), fuori dai componenti così si provano a
 * parte. Cosa è permesso lo decide il server; qui si dice solo come presentarlo e come costruire la
 * nuova scelta quando l'utente cambia il ruolo di un'immagine.
 */

export type ImageUse = ShotImage['use'];

export const USE_LABELS: Record<ImageUse, string> = {
  first_frame: 'Primo fotogramma',
  last_frame: 'Ultimo fotogramma',
  reference: 'Ispirazione',
};

/** Il ruolo che un'immagine ha adesso nell'inquadratura, se ne ha uno. */
export function useOf(images: readonly ShotImage[], assetId: string): ImageUse | undefined {
  return images.find((image) => image.assetId === assetId)?.use;
}

/**
 * La scelta dopo che l'utente ha cambiato il ruolo di un'immagine (`undefined` = non la uso più):
 * l'immagine perde il ruolo di prima, e il primo o l'ultimo fotogramma sono uno solo, quindi chi li
 * aveva li lascia. Le altre scelte restano com'erano. Se la nuova scelta è troppo grande, il
 * server la rifiuta con un messaggio.
 */
export function reassign(
  images: readonly ShotImage[],
  assetId: string,
  use: ImageUse | undefined,
): ShotImageChoice[] {
  const kept = images.flatMap((image) =>
    image.assetId === undefined ||
    image.assetId === assetId ||
    (use !== undefined && use !== 'reference' && image.use === use)
      ? []
      : [{ use: image.use, assetId: image.assetId }],
  );
  return use === undefined ? kept : [...kept, { use, assetId }];
}

/** Le immagini da offrire, una volta sola anche se due tentativi hanno dato lo stesso file. */
export function uniqueCandidates(candidates: readonly ImageCandidate[]): ImageCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.assetId)) return false;
    seen.add(candidate.assetId);
    return true;
  });
}

/** Da dove viene un'immagine, quando non è nata dallo storyboard: «Dal video · 1,5 s». */
export function candidateCaption(candidate: ImageCandidate): string | undefined {
  return candidate.mode === 'take_frame' && candidate.atS !== undefined
    ? `Dal video · ${formatMoment(candidate.atS)}`
    : undefined;
}

/** Se nessun servizio video attivato accetta le immagini scelte, lo si dice subito (D20): senza spendere. */
export function videoNotice(videoServices: number): string | undefined {
  return videoServices === 0
    ? 'Nessun servizio video attivato accetta questa combinazione di immagini. Cambia le immagini, oppure attiva un altro servizio nelle impostazioni: non passo da solo a un altro modo.'
    : undefined;
}

/** Il primo fotogramma serve per fare l'ultimo: senza, la sezione dell'ultimo fotogramma non si offre. */
export function hasFirstFrame(images: readonly ShotImage[]): boolean {
  return images.some((image) => image.use === 'first_frame');
}
