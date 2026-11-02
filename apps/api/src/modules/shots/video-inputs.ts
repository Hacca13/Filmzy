import {
  VIDEO_PROMPT_MAX_CHARS,
  type PromptTarget,
  type ShotImage,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';
import type { MediaRunner } from '@filmzy/troupe';

import { identityStandIns, standInImage, storyboardReferences } from './storyboard-input.js';
import type { StoryboardReferences } from './storyboard-input.js';

/** La richiesta a un servizio di immagini o video, senza il servizio: lo sceglie chi la manda (D36). */
export type MediaRequest = Parameters<MediaRunner['submit']>[1];

/**
 * Quali immagini riceve il video di un'inquadratura (T4.2, T4.3), fuori dai servizi così la regola
 * sta in un posto solo: la usano la scelta dei servizi che accettano la combinazione e il lavoro che
 * gira davvero.
 *
 * Le immagini impostate dall'utente entrano col loro ruolo. Se ha fissato il primo o l'ultimo
 * fotogramma, personaggi e luogo sono già nell'immagine; altrimenti il video riceve il volto bloccato
 * e il set come riferimenti, insieme all'ispirazione.
 */
export interface VideoImages {
  chosen: { use: ShotImage['use']; assetId: string }[];
  identity: StoryboardReferences | undefined;
}

export function videoImages(spec: ShotSpec, bible: StoryBible): VideoImages {
  const chosen = spec.images.flatMap((image) =>
    image.assetId === undefined ? [] : [{ use: image.use, assetId: image.assetId }],
  );
  const framed = chosen.some((image) => image.use !== 'reference');
  return { chosen, identity: framed ? undefined : storyboardReferences(spec, bible) };
}

/** La destinazione del prompt di un video: una clip, con gli ingressi che davvero riceve (D20). */
export function videoTarget(images: VideoImages): Omit<PromptTarget, 'family'> {
  const has = (use: ShotImage['use']) => images.chosen.some((image) => image.use === use);
  const hasIdentity =
    images.identity !== undefined &&
    (images.identity.characters.length > 0 || images.identity.locationAssetId !== undefined);
  return {
    kind: 'video',
    maxPromptChars: VIDEO_PROMPT_MAX_CHARS,
    frame: 'clip',
    inputs: [
      ...(has('reference') || hasIdentity ? (['references'] as const) : []),
      ...(has('first_frame') ? (['first_frame'] as const) : []),
      ...(has('last_frame') ? (['last_frame'] as const) : []),
    ],
  };
}

/**
 * La richiesta di un video con immagini finte: per scegliere i servizi che la accettano e stimare il
 * prezzo conta quante immagini ci sono e a cosa servono, non cosa contengono. Non si invia mai.
 */
export function videoStandInRequest(spec: ShotSpec, bible: StoryBible): MediaRequest {
  const images = videoImages(spec, bible);
  return {
    role: 'camera_operator',
    prompt: spec.intent.action,
    inputs: [
      ...images.chosen.map((image) => standInImage(image.use)),
      ...(images.identity === undefined ? [] : identityStandIns(images.identity)),
    ],
    characterIds: images.identity?.characters.map((entry) => entry.characterId) ?? [],
    durationS: spec.intent.durationS,
    params: {},
    idempotencyKey: `${spec.id}:video-check`,
  };
}
