import { describe, expect, it } from 'vitest';

import { roleConfigEntrySchema, rolesConfigFileSchema } from './roles.js';

describe('roleConfigEntrySchema', () => {
  it('accetta un ruolo con model (moderator)', () => {
    const entry = {
      label: 'Moderatore',
      kind: 'llm' as const,
      model: 'claude-haiku',
      params: { temperature: 0, max_tokens: 500 },
      instructions: 'moderator@1',
      output_strategy: 'auto' as const,
      retries: { invalid_output: 1, technical_error: 2 },
    };
    expect(roleConfigEntrySchema.parse(entry).model).toBe('claude-haiku');
  });

  it('accetta un ruolo con routing e prompt_from (camera_operator)', () => {
    const entry = {
      label: 'Operatore di ripresa',
      kind: 'video' as const,
      routing: { policy: 'balanced' as const, candidates: ['kling-o3-standard', 'seedance-2'] },
      prompt_from: 'cinematographer' as const,
      params: { resolution: '720p', aspect_ratio: '16:9', audio: false },
      retries: { technical_error: 2 },
    };
    expect(roleConfigEntrySchema.parse(entry).routing?.policy).toBe('balanced');
  });

  it('accetta un ruolo spento senza model né routing (sfx_artist)', () => {
    const entry = {
      label: 'Rumorista',
      kind: 'sfx' as const,
      instructions: 'sfx_artist@1',
      retries: { technical_error: 2 },
      enabled: false,
    };
    expect(roleConfigEntrySchema.parse(entry).enabled).toBe(false);
  });

  it('rifiuta un ruolo attivo senza model né routing', () => {
    expect(
      roleConfigEntrySchema.safeParse({ label: 'X', kind: 'sfx', retries: { technical_error: 2 } })
        .success,
    ).toBe(false);
  });

  it('rifiuta un ruolo con model e routing insieme', () => {
    expect(
      roleConfigEntrySchema.safeParse({
        label: 'X',
        kind: 'video',
        model: 'kling-o3-standard',
        routing: { policy: 'cheap', candidates: ['kling-o3-standard'] },
      }).success,
    ).toBe(false);
  });

  it('rifiuta un campo sconosciuto', () => {
    expect(
      roleConfigEntrySchema.safeParse({
        label: 'X',
        kind: 'llm',
        model: 'claude-haiku',
        temperature: 0,
      }).success,
    ).toBe(false);
  });
});

describe('rolesConfigFileSchema', () => {
  it('accetta un file che non ha ancora tutti i 17 ruoli dell\'MVP', () => {
    const file = {
      version: 1 as const,
      roles: {
        moderator: {
          label: 'Moderatore',
          kind: 'llm' as const,
          model: 'claude-haiku',
          instructions: 'moderator@1',
        },
      },
    };
    expect(rolesConfigFileSchema.parse(file).roles.moderator?.label).toBe('Moderatore');
  });
});
