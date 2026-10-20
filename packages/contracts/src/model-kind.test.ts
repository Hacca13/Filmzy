import { describe, expect, it } from 'vitest';

import { MODEL_KINDS, modelGroupForKind, modelGroupSchema, modelKindSchema } from './model-kind.js';

describe('modelKindSchema', () => {
  it.each(MODEL_KINDS)('accetta %j', (kind) => {
    expect(modelKindSchema.parse(kind)).toBe(kind);
  });

  it('rifiuta un tipo inventato', () => {
    expect(modelKindSchema.safeParse('audio').success).toBe(false);
  });
});

describe('modelGroupSchema', () => {
  it('accetta i sei gruppi delle impostazioni', () => {
    expect(modelGroupSchema.parse('vision')).toBe('vision');
  });

  it('rifiuta un gruppo inventato', () => {
    expect(modelGroupSchema.safeParse('sfx').success).toBe(false);
  });
});

describe('modelGroupForKind', () => {
  it('mette musica ed effetti nello stesso gruppo', () => {
    expect(modelGroupForKind('music')).toBe('audio');
    expect(modelGroupForKind('sfx')).toBe('audio');
  });

  it.each([
    ['llm', 'text'],
    ['image', 'image'],
    ['video', 'video'],
    ['voice', 'voice'],
  ] as const)('%s -> %s', (kind, group) => {
    expect(modelGroupForKind(kind)).toBe(group);
  });
});
