import { describe, expect, it } from 'vitest';

import { instructionsRefSchema, roleSettingsSchema, userSettingsSchema } from './settings.js';

describe('instructionsRefSchema', () => {
  it('accetta id@versione', () => {
    expect(instructionsRefSchema.parse('screenwriter@2')).toBe('screenwriter@2');
  });

  it('rifiuta un riferimento senza versione', () => {
    expect(instructionsRefSchema.safeParse('screenwriter').success).toBe(false);
  });
});

describe('roleSettingsSchema', () => {
  it('accetta una regolazione completa', () => {
    const settings = {
      modelId: 'claude-sonnet',
      params: { temperature: 0.6 },
      instructions: 'screenwriter@2',
    };
    expect(roleSettingsSchema.parse(settings)).toEqual(settings);
  });

  it('accetta una regolazione vuota: senza preimpostati', () => {
    expect(roleSettingsSchema.parse({})).toEqual({});
  });
});

describe('userSettingsSchema', () => {
  it("accetta le scelte dell'utente senza nessun limite di spesa acceso (D36)", () => {
    const settings = {
      enabledModelIds: ['claude-sonnet', 'kling-o3-standard'],
      defaultModels: { text: 'claude-sonnet', video: 'kling-o3-standard' },
      defaultModelByConnection: { anthropic: 'claude-sonnet', fal: 'kling-o3-standard' },
      spendCaps: {},
      roleSettings: { screenwriter: { modelId: 'claude-sonnet' } },
    };
    expect(userSettingsSchema.parse(settings).spendCaps).toEqual({});
  });

  it('rifiuta un gruppo inventato in defaultModels', () => {
    expect(
      userSettingsSchema.safeParse({
        enabledModelIds: [],
        defaultModels: { narration: 'claude-sonnet' },
        defaultModelByConnection: {},
        spendCaps: {},
        roleSettings: {},
      }).success,
    ).toBe(false);
  });

  it('rifiuta un ruolo inventato in roleSettings', () => {
    expect(
      userSettingsSchema.safeParse({
        enabledModelIds: [],
        defaultModels: {},
        defaultModelByConnection: {},
        spendCaps: {},
        roleSettings: { director: { modelId: 'claude-sonnet' } },
      }).success,
    ).toBe(false);
  });
});
