import { describe, expect, it } from 'vitest';

import {
  instructionHeaderSchema,
  instructionsManifestSchema,
} from './instructions.js';

describe('instructionHeaderSchema', () => {
  it('accetta l\'intestazione del direttore della fotografia', () => {
    const header = {
      id: 'cinematographer',
      version: 1,
      description: 'Trasforma un\'inquadratura nel prompt per il modello di destinazione.',
      variables: ['shot', 'characters', 'location', 'style', 'cinematography', 'movement', 'target'],
      changelog: ['1 (2026-10-19): prima versione'],
    };
    expect(instructionHeaderSchema.parse(header).id).toBe('cinematographer');
  });

  it('accetta una variante append per famiglia (seedance)', () => {
    const header = {
      id: 'cinematographer',
      version: 1,
      variant: 'seedance',
      mode: 'append' as const,
      description: 'Regole aggiuntive per la famiglia Seedance.',
      variables: ['shot'],
      changelog: ['1 (2026-10-19): prima versione'],
    };
    expect(instructionHeaderSchema.parse(header).mode).toBe('append');
  });

  it('accetta un template immagine (character_designer)', () => {
    const header = {
      id: 'character_designer',
      version: 1,
      kind: 'image_prompt' as const,
      description: 'Prompt delle immagini della scheda personaggio.',
      variables: ['character', 'style', 'angle'],
      changelog: ['1 (2026-10-19): prima versione'],
    };
    expect(instructionHeaderSchema.parse(header).kind).toBe('image_prompt');
  });

  it('rifiuta un kind inventato', () => {
    expect(
      instructionHeaderSchema.safeParse({
        id: 'x',
        version: 1,
        kind: 'video_prompt',
        description: 'x',
        variables: [],
        changelog: [],
      }).success,
    ).toBe(false);
  });
});

describe('instructionsManifestSchema', () => {
  it('accetta un manifesto con due versioni', () => {
    const manifest = {
      id: 'screenwriter',
      recommended: 2,
      versions: [
        { version: 1, file: 'v1.md' },
        { version: 2, file: 'v2.md' },
      ],
    };
    expect(instructionsManifestSchema.parse(manifest).recommended).toBe(2);
  });

  it('rifiuta una versione consigliata che non esiste tra le versioni', () => {
    const manifest = {
      id: 'screenwriter',
      recommended: 3,
      versions: [{ version: 1, file: 'v1.md' }],
    };
    expect(instructionsManifestSchema.safeParse(manifest).success).toBe(false);
  });
});
