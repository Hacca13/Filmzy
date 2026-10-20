import { describe, expect, it } from 'vitest';

import { promptTargetSchema, roleMoodboardFieldSchema, visualPromptSchema } from './shared.js';

describe('visualPromptSchema', () => {
  it('accetta un prompt con negative prompt', () => {
    expect(
      visualPromptSchema.parse({
        prompt: 'a woman walks across a square',
        negativePrompt: 'text, logos',
      }).negativePrompt,
    ).toBe('text, logos');
  });

  it('rifiuta un prompt vuoto', () => {
    expect(visualPromptSchema.safeParse({ prompt: '' }).success).toBe(false);
  });
});

describe('promptTargetSchema', () => {
  it('accetta una destinazione video con primo e ultimo fotogramma (D20)', () => {
    const target = {
      family: 'kling',
      kind: 'video' as const,
      maxPromptChars: 900,
      frame: 'start' as const,
      inputs: ['first_frame', 'last_frame'] as const,
    };
    expect(promptTargetSchema.parse(target)).toEqual(target);
  });

  it('rifiuta un ingresso non ammesso', () => {
    expect(
      promptTargetSchema.safeParse({
        family: 'kling',
        kind: 'video',
        maxPromptChars: 900,
        frame: 'clip',
        inputs: ['middle_frame'],
      }).success,
    ).toBe(false);
  });
});

describe('roleMoodboardFieldSchema', () => {
  it('accetta null quando il progetto non ha un moodboard (§4.4)', () => {
    expect(roleMoodboardFieldSchema.parse(null)).toBeNull();
  });

  it("accetta la vista di solo testo quando il moodboard c'è", () => {
    const brief = { palette: [], notes: 'Luce calda', referenceDescriptions: [] };
    expect(roleMoodboardFieldSchema.parse(brief)).toEqual(brief);
  });
});
