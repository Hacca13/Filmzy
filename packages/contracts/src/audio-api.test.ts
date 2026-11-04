import { describe, expect, it } from 'vitest';

import {
  audioClipSchema,
  audioOverviewSchema,
  audioTrackSchema,
  createAudioClipBodySchema,
  uploadAudioQuerySchema,
} from './audio-api.js';

const clip = {
  id: 'c-1',
  trackId: 't-1',
  kind: 'music',
  sceneId: 'scene-1',
  startS: 0,
  durationS: 20,
  volume: 1,
  fadeInS: 0,
  fadeOutS: 0,
  description: 'Un piano che accompagna la partenza.',
  source: 'generated',
  variants: [],
};

describe('le tracce audio', () => {
  it('una traccia ha un tipo, il muto e un volume fra 0 e 1', () => {
    const track = { id: 't-1', kind: 'music', muted: false, volume: 1 };

    expect(audioTrackSchema.parse(track)).toEqual(track);
    expect(audioTrackSchema.safeParse({ ...track, volume: 1.5 }).success).toBe(false);
    expect(audioTrackSchema.safeParse({ ...track, kind: 'voce' }).success).toBe(false);
  });

  it('una clip senza varianti è una clip valida: si è appena creata', () => {
    expect(audioOverviewSchema.parse({ tracks: [], clips: [clip] }).clips).toHaveLength(1);
  });

  it('una variante caricata non ha un servizio', () => {
    const uploaded = {
      ...clip,
      source: 'uploaded',
      chosenVariantId: 'v-1',
      variants: [
        { id: 'v-1', status: 'succeeded', assetId: 'a-1', createdAt: '2026-11-04T10:00:00.000Z' },
      ],
    };

    expect(audioClipSchema.parse(uploaded).variants[0]?.modelId).toBeUndefined();
  });
});

describe('createAudioClipBodySchema', () => {
  const body = { kind: 'music', sceneId: 'scene-1', durationS: 20, description: 'Un piano.' };

  it('la musica sta sulla scena, e un effetto su un’inquadratura', () => {
    expect(createAudioClipBodySchema.safeParse(body).success).toBe(true);
    expect(
      createAudioClipBodySchema.safeParse({ ...body, kind: 'sfx', shotId: 's-1', startS: 1 })
        .success,
    ).toBe(true);
    expect(createAudioClipBodySchema.safeParse({ ...body, kind: 'sfx' }).success).toBe(false);
    expect(createAudioClipBodySchema.safeParse({ ...body, shotId: 's-1' }).success).toBe(false);
  });

  it('rifiuta una durata che non c’è, una descrizione vuota e i campi in più', () => {
    expect(createAudioClipBodySchema.safeParse({ ...body, durationS: 0 }).success).toBe(false);
    expect(createAudioClipBodySchema.safeParse({ ...body, description: '   ' }).success).toBe(
      false,
    );
    expect(createAudioClipBodySchema.safeParse({ ...body, assetId: 'a-1' }).success).toBe(false);
  });

  it('non si crea così una clip di dialoghi: quelle si caricano', () => {
    expect(createAudioClipBodySchema.safeParse({ ...body, kind: 'dialogue' }).success).toBe(false);
  });
});

describe('uploadAudioQuerySchema', () => {
  const query = { kind: 'dialogue', sceneId: 'scene-1', description: 'Una voce fuori campo.' };

  it('un dialogo può stare sulla scena o su un’inquadratura; il secondo arriva come testo', () => {
    expect(uploadAudioQuerySchema.safeParse(query).success).toBe(true);
    expect(uploadAudioQuerySchema.parse({ ...query, shotId: 's-1', startS: '1.5' }).startS).toBe(
      1.5,
    );
  });

  it('la musica sta sulla scena, un effetto su un’inquadratura, e l’audio dei take non si carica', () => {
    expect(
      uploadAudioQuerySchema.safeParse({ ...query, kind: 'music', shotId: 's-1' }).success,
    ).toBe(false);
    expect(uploadAudioQuerySchema.safeParse({ ...query, kind: 'sfx' }).success).toBe(false);
    expect(uploadAudioQuerySchema.safeParse({ ...query, kind: 'native' }).success).toBe(false);
  });
});
