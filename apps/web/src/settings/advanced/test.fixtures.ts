import type { TroupeConfigData } from '@filmzy/contracts';

/** La configurazione più piccola che lo schema accetta: qui conta il giro, non il contenuto. */
export const sampleConfig: TroupeConfigData = {
  connections: {
    fake: { adapter: 'fake', api_key: 'none', timeout_s: 60, max_concurrency: 1, enabled: true },
    fal: {
      adapter: 'fal',
      api_key: 'secret:FAL_KEY',
      timeout_s: 120,
      max_concurrency: 2,
      enabled: false,
    },
  },
  models: {
    finto: {
      label: 'Finto',
      kind: 'llm',
      connection: 'fake',
      provider_model: 'finto-1',
      capabilities: ['structured_output'],
      pricing: { unit: 'per_mtok', input: 1, output: 2, checked: '2026-10-22' },
      status: 'active',
    },
    clip: {
      label: 'Clip',
      kind: 'music',
      connection: 'fake',
      provider_model: 'clip-1',
      capabilities: {},
      pricing: { unit: 'per_second', value: 0.3, checked: '2026-10-22' },
      status: 'testing',
    },
  },
  roles: {
    moderator: { label: 'Moderatore', kind: 'llm', model: 'finto', instructions: 'moderator@1' },
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
    styles: [{ id: 'realistico', label: 'Realistico', description: 'd', hint: 'h', enabled: true }],
    cinematography: [],
    cameraMovements: [],
    characterTags: [],
    genres: [{ id: 'dramma', label: 'Drammatico' }],
    tones: [],
  },
};
