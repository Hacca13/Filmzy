import { describe, expect, it } from 'vitest';

import {
  MODEL_KINDS,
  modelGroupForKind,
  modelGroupForRole,
  modelGroupSchema,
  modelKindSchema,
} from './model-kind.js';

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

describe('modelGroupForRole (D38)', () => {
  it('un ruolo di testo che chiede di leggere le immagini sta in «Lettura immagini»', () => {
    expect(modelGroupForRole({ kind: 'llm', requires: ['vision'] })).toBe('vision');
  });

  it('senza `requires` vale il gruppo del tipo, come prima', () => {
    expect(modelGroupForRole({ kind: 'llm' })).toBe('text');
    expect(modelGroupForRole({ kind: 'llm', requires: [] })).toBe('text');
    expect(modelGroupForRole({ kind: 'image' })).toBe('image');
    expect(modelGroupForRole({ kind: 'sfx', requires: undefined })).toBe('audio');
  });

  it('`requires` non cambia il gruppo di un ruolo che non è di testo', () => {
    expect(modelGroupForRole({ kind: 'image', requires: ['vision'] })).toBe('image');
  });
});
