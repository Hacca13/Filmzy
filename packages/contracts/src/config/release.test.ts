import { describe, expect, it } from 'vitest';

import {
  instructionVersionSchema,
  troupeConfigSchema,
  troupeDraftSchema,
  troupeReleaseSchema,
} from './release.js';

/** La configurazione più piccola che abbia senso: una connessione, un modello, un ruolo. */
const config = {
  connections: {
    anthropic: {
      adapter: 'anthropic',
      api_key: 'env:ANTHROPIC_API_KEY',
      timeout_s: 120,
      max_concurrency: 4,
      enabled: true,
    },
  },
  models: {
    'claude-sonnet': {
      label: 'Claude Sonnet',
      kind: 'llm' as const,
      connection: 'anthropic',
      provider_model: 'claude-sonnet-5-5',
      capabilities: ['structured_output'],
      params: { max_tokens: { min: 1, max: 128000 } },
      pricing: { unit: 'per_mtok' as const, input: 2, output: 10, checked: '2026-10-21' },
      status: 'active' as const,
    },
  },
  roles: {
    moderator: {
      label: 'Moderatore',
      kind: 'llm' as const,
      model: 'claude-sonnet',
      params: { max_tokens: 500 },
      instructions: 'moderator@1',
      retries: { invalid_output: 1, technical_error: 2 },
    },
  },
  features: {
    real_people: false,
    dialogue: false,
    dubbing: false,
    music: true,
    sound_effects: true,
    preview_gate: true,
    keyframes: true,
    image_upload: true,
    retouch: true,
    moodboard: true,
    c2pa_marking: false,
  },
  limits: { max_characters: 2 },
  presets: {
    styles: [],
    cinematography: [],
    cameraMovements: [],
    characterTags: [],
    genres: [],
    tones: [],
  },
};

describe('troupeConfigSchema', () => {
  it('accetta una configurazione completa', () => {
    const parsed = troupeConfigSchema.parse(config);

    expect(Object.keys(parsed.models)).toEqual(['claude-sonnet']);
    expect(parsed.limits.max_characters).toBe(2);
  });

  it('rifiuta una sezione che manca', () => {
    expect(troupeConfigSchema.safeParse({ ...config, presets: undefined }).success).toBe(false);
  });

  it('rifiuta una voce del catalogo rovinata', () => {
    const rotta = {
      ...config,
      models: { 'claude-sonnet': { ...config.models['claude-sonnet'], kind: 'inventato' } },
    };

    expect(troupeConfigSchema.safeParse(rotta).success).toBe(false);
  });
});

describe('release e bozza (§4.5)', () => {
  it('una release porta impronta, nota e autore', () => {
    const release = troupeReleaseSchema.parse({
      id: 'rel-1',
      config,
      hash: 'abc123',
      note: 'Prezzi verificati',
      author: 'anna',
      createdAt: '2026-10-22T09:00:00.000Z',
      activatedAt: '2026-10-22T09:00:01.000Z',
    });

    expect(release.hash).toBe('abc123');
  });

  it('una release non attivata va bene: è nello storico', () => {
    const release = troupeReleaseSchema.parse({
      id: 'rel-0',
      config,
      hash: 'abc',
      createdAt: '2026-10-22T09:00:00.000Z',
    });

    expect(release.activatedAt).toBeUndefined();
  });

  it('la bozza ricorda da quale release è nata', () => {
    const draft = troupeDraftSchema.parse({
      config,
      updatedAt: '2026-10-22T09:00:00.000Z',
      fromReleaseId: 'rel-1',
    });

    expect(draft.fromReleaseId).toBe('rel-1');
  });
});

describe('instructionVersionSchema (§4.4)', () => {
  it('accetta una versione del programma e una caricata dall utente', () => {
    const base = {
      instructionsId: 'cinematographer',
      version: 1,
      body: '## system\nSei il direttore della fotografia.',
      createdAt: '2026-10-22T09:00:00.000Z',
    };

    expect(instructionVersionSchema.parse({ ...base, origin: 'bundled' }).origin).toBe('bundled');
    expect(
      instructionVersionSchema.parse({ ...base, origin: 'user', family: 'seedance' }).family,
    ).toBe('seedance');
  });

  it('rifiuta una versione zero o un corpo vuoto', () => {
    const base = {
      instructionsId: 'moderator',
      origin: 'user' as const,
      createdAt: '2026-10-22T09:00:00.000Z',
    };

    expect(instructionVersionSchema.safeParse({ ...base, version: 0, body: 'x' }).success).toBe(
      false,
    );
    expect(instructionVersionSchema.safeParse({ ...base, version: 1, body: '' }).success).toBe(
      false,
    );
  });
});
