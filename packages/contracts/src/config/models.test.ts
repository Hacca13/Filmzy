import { describe, expect, it } from 'vitest';

import { isoDaySchema, modelEntrySchema, modelsFileSchema, paramSpecSchema } from './models.js';

describe('paramSpecSchema', () => {
  it('tiene distinti un elenco di valori e un intervallo', () => {
    const values = paramSpecSchema.parse({ values: ['1k', '2k'] });
    expect(values).toEqual({ values: ['1k', '2k'] });

    const range = paramSpecSchema.parse({ min: 0, max: 1 });
    expect(range).toEqual({ min: 0, max: 1 });
  });

  it('non lascia passare un campo inventato in un intervallo', () => {
    expect(paramSpecSchema.safeParse({ min: 0, step: 0.1 }).success).toBe(false);
  });
});

describe('isoDaySchema', () => {
  it('accetta la data come la scrive il seme', () => {
    expect(isoDaySchema.parse('2026-10-19')).toBe('2026-10-19');
  });

  it('accetta anche un Date, perché alcuni parser YAML lo producono', () => {
    expect(isoDaySchema.parse(new Date('2026-10-19T00:00:00.000Z'))).toBe('2026-10-19');
  });

  it('rifiuta una data con l\'ora o scritta all\'italiana', () => {
    expect(isoDaySchema.safeParse('2026-10-19T10:00:00Z').success).toBe(false);
    expect(isoDaySchema.safeParse('19/10/2026').success).toBe(false);
  });
});

describe('modelEntrySchema', () => {
  it('accetta un LLM con i tier di prezzo di claude-haiku', () => {
    const entry = {
      label: 'Claude Haiku',
      kind: 'llm' as const,
      connection: 'anthropic',
      provider_model: 'claude-haiku-5-5',
      capabilities: ['structured_output', 'vision'],
      params: {
        temperature: { min: 0, max: 1 },
        max_tokens: { min: 1, max: 128000 },
      },
      pricing: {
        unit: 'per_mtok' as const,
        input: 0.1,
        output: 0.5,
        tiers: [{ above_prompt_tokens: 100000, input: 0.5, output: 2.5 }],
        checked: '2026-10-19',
      },
      status: 'active' as const,
    };
    expect(modelEntrySchema.parse(entry).kind).toBe('llm');
  });

  it('accetta un\'immagine con i parametri a valori (nano-banana-2)', () => {
    const entry = {
      label: 'Nano Banana 2',
      kind: 'image' as const,
      connection: 'fal',
      provider_model: 'fal-ai/nano-banana-2',
      family: 'image_generic',
      capabilities: { max_reference_images: 4, image_edit: true, mask_edit: 'unknown' as const },
      params: {
        resolution: { values: ['1k', '2k', '4k'] },
        aspect_ratio: { values: ['1:1', '3:4', '4:3', '16:9', '9:16'] },
        variants: { min: 1, max: 4 },
      },
      request_fields: { prompt: 'prompt', references: 'image_urls', variants: 'num_images' },
      pricing: { unit: 'per_image' as const, value: 0.08, note: 'a 1K', checked: '2026-10-13' },
      status: 'testing' as const,
    };
    expect(modelEntrySchema.parse(entry).kind).toBe('image');
  });

  it('accetta un video con input_modes e volti reali verificati (seedance-2)', () => {
    const entry = {
      label: 'Seedance 2',
      kind: 'video' as const,
      connection: 'fal',
      provider_model: '<Seedance 2.0 reference-to-video su fal: id da verificare>',
      family: 'seedance',
      capabilities: {
        durations_s: { min: 4, max: 15 },
        input_modes: ['references'] as const,
        max_reference_images: 12,
        max_characters: 2,
        native_audio: true,
        real_faces: 'verified_assets' as const,
        minors: false,
      },
      params: {
        resolution: { values: ['480p', '720p', '1080p'] },
        aspect_ratio: { values: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'] },
        audio: { values: [true, false] },
      },
      pricing: { unit: 'per_second' as const, value: 0.15, note: 'stima', checked: '2026-10-13' },
      quality: {},
      status: 'testing' as const,
    };
    expect(modelEntrySchema.parse(entry).kind).toBe('video');
  });

  it('accetta musica senza params (music-elevenlabs)', () => {
    const entry = {
      label: 'ElevenLabs Music',
      kind: 'music' as const,
      connection: 'elevenlabs',
      provider_model: '<ElevenLabs Music: id da verificare>',
      family: 'elevenlabs_music',
      capabilities: { commercial_use: true },
      pricing: { unit: 'per_second' as const, value: 0.003, note: 'circa 0,18 $ al minuto', checked: '2026-10-13' },
      status: 'testing' as const,
    };
    expect(modelEntrySchema.parse(entry).kind).toBe('music');
  });

  it('rifiuta un id segnaposto con status active (architettura §4.6 punto 7)', () => {
    const entry = {
      label: 'X',
      kind: 'image' as const,
      connection: 'fal',
      provider_model: '<da verificare>',
      capabilities: { max_reference_images: 1, image_edit: 'unknown' as const, mask_edit: 'unknown' as const },
      pricing: { unit: 'per_image' as const, value: 0.1, checked: '2026-10-13' },
      status: 'active' as const,
    };
    expect(modelEntrySchema.safeParse(entry).success).toBe(false);
  });

  it('rifiuta un kind inventato', () => {
    expect(
      modelEntrySchema.safeParse({
        label: 'X',
        kind: 'avatar',
        connection: 'fal',
        provider_model: 'x',
        capabilities: [],
        pricing: { unit: 'per_second', value: 1, checked: '2026-10-13' },
        status: 'active',
      }).success,
    ).toBe(false);
  });
});

describe('modelsFileSchema', () => {
  it('accetta il catalogo con più voci', () => {
    const file = {
      version: 1 as const,
      models: {
        'claude-sonnet': {
          label: 'Claude Sonnet',
          kind: 'llm' as const,
          connection: 'anthropic',
          provider_model: 'claude-sonnet-5-5',
          capabilities: ['structured_output', 'vision'],
          pricing: { unit: 'per_mtok' as const, input: 2, output: 10, checked: '2026-10-19' },
          status: 'active' as const,
        },
      },
    };
    expect(modelsFileSchema.parse(file).models['claude-sonnet']?.label).toBe('Claude Sonnet');
  });
});
