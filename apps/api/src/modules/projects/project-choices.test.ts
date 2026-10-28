import { TITLE_MAX_LENGTH, type TroupePresetsData } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { defaultTitle, projectOptions, unknownChoice } from './project-choices.js';

const presets: TroupePresetsData = {
  genres: [
    { id: 'drama', label: 'Drammatico' },
    { id: 'comedy', label: 'Commedia' },
  ],
  tones: [{ id: 'dark', label: 'Cupo' }],
  styles: [
    {
      id: 'realistic',
      label: 'Realistico',
      description: 'Ripresa dal vero',
      hint: 'photorealistic',
      enabled: true,
    },
    {
      id: 'anime',
      label: 'Anime',
      description: 'Disegnato a mano',
      hint: 'anime',
      enabled: false,
    },
  ],
  cinematography: [
    {
      id: 'noir',
      label: 'Noir',
      description: 'Ombre nette',
      camera: 'low angles',
      lighting: 'hard light',
      lens: '40mm',
      grade: 'contrast',
      enabled: true,
    },
  ],
  cameraMovements: [],
  characterTags: [],
};

describe('projectOptions', () => {
  it('offre solo le voci attive e non mostra mai le frasi in inglese dei preset', () => {
    const options = projectOptions(presets);

    expect(options.styles).toEqual([
      { id: 'realistic', label: 'Realistico', description: 'Ripresa dal vero' },
    ]);
    expect(options.genres).toEqual([
      { id: 'drama', label: 'Drammatico' },
      { id: 'comedy', label: 'Commedia' },
    ]);
    expect(JSON.stringify(options)).not.toContain('photorealistic');
    expect(JSON.stringify(options)).not.toContain('low angles');
  });
});

describe('unknownChoice', () => {
  it('non trova niente se le scelte sono tutte attive, o se non ce ne sono', () => {
    expect(
      unknownChoice(presets, {
        genre: 'drama',
        tone: 'dark',
        style: 'realistic',
        cinematography: 'noir',
      }),
    ).toBeUndefined();
    expect(unknownChoice(presets, {})).toBeUndefined();
  });

  it('dice quale campo ha una voce che non esiste o è spenta', () => {
    expect(unknownChoice(presets, { genre: 'western' })).toBe('genre');
    expect(unknownChoice(presets, { style: 'anime' })).toBe('style');
    expect(unknownChoice(presets, { cinematography: 'sogno', tone: 'dark' })).toBe(
      'cinematography',
    );
  });
});

describe('defaultTitle', () => {
  it('prende le prime parole con la maiuscola', () => {
    expect(defaultTitle('marco trova una vecchia bobina sull’ultimo treno della sera')).toBe(
      'Marco trova una vecchia bobina',
    );
  });

  it('toglie la punteggiatura in fondo e gli spazi doppi', () => {
    expect(defaultTitle('  Una   scintilla, forse.  ')).toBe('Una scintilla, forse');
    expect(defaultTitle('E se…')).toBe('E se');
  });

  it('senza parole usa un titolo qualunque e non supera la lunghezza consentita', () => {
    expect(defaultTitle('  ... ')).toBe('Il mio film');
    expect(defaultTitle('a'.repeat(500)).length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });
});
