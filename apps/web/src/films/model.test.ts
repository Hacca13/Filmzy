import type { Project, ProjectOptions } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  choiceLabel,
  draftOf,
  filmSubtitle,
  formatDuration,
  initialDraft,
  phaseLabel,
  toBody,
} from './model';

const options: ProjectOptions = {
  genres: [{ id: 'drama', label: 'Drammatico' }],
  tones: [{ id: 'moving', label: 'Commovente' }],
  styles: [{ id: 'realistic', label: 'Realistico' }],
  cinematography: [{ id: 'noir', label: 'Noir' }],
  durationsS: [30, 60],
  defaults: {
    genre: 'drama',
    tone: 'moving',
    style: 'realistic',
    cinematography: 'noir',
    durationS: 60,
  },
  ideaMaxLength: 2000,
  titleMaxLength: 80,
};

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'noir',
  language: 'it',
  durationS: 90,
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:05:00.000Z',
};

describe('initialDraft', () => {
  it('parte dalle voci scelte dal server, con l’idea ancora vuota', () => {
    expect(initialDraft(options)).toEqual({ idea: '', title: '', ...options.defaults });
  });

  it('senza voci da proporre i campi restano vuoti', () => {
    expect(initialDraft({ ...options, defaults: {} })).toEqual({ idea: '', title: '' });
  });
});

describe('toBody', () => {
  it('per partire basta scrivere l’idea', () => {
    expect(toBody({ ...initialDraft(options), idea: '  Una scintilla  ' })).toEqual({
      idea: 'Una scintilla',
      title: '',
      genre: 'drama',
      tone: 'moving',
      style: 'realistic',
      cinematography: 'noir',
      durationS: 60,
    });
  });

  it('senza idea, o con l’idea di soli spazi, non si può continuare', () => {
    expect(toBody(initialDraft(options))).toBeUndefined();
    expect(toBody({ ...initialDraft(options), idea: '   ' })).toBeUndefined();
  });

  it('manca una scelta: non si può continuare', () => {
    const withoutTone = initialDraft({
      ...options,
      defaults: { genre: 'drama', style: 'realistic', cinematography: 'noir', durationS: 60 },
    });

    expect(toBody({ ...withoutTone, idea: 'x' })).toBeUndefined();
  });

  it('una durata fuori elenco non si manda', () => {
    expect(toBody({ ...initialDraft(options), idea: 'x', durationS: 45 })).toBeUndefined();
  });

  it('un titolo svuotato si manda vuoto: il server propone quello dell’idea', () => {
    expect(toBody({ ...draftOf(film), title: '   ' })?.title).toBe('');
  });
});

describe('draftOf', () => {
  it('riprende il film com’è', () => {
    expect(draftOf(film)).toEqual({
      idea: film.idea,
      title: film.title,
      genre: 'drama',
      tone: 'moving',
      style: 'realistic',
      cinematography: 'noir',
      durationS: 90,
    });
  });
});

describe('formatDuration', () => {
  it.each([
    [30, '30 s'],
    [60, '1 min'],
    [90, '1 min 30 s'],
    [180, '3 min'],
  ])('%i secondi si dicono «%s»', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});

describe('i nomi dei passi', () => {
  it('sono quelli del mockup, in italiano semplice', () => {
    expect(phaseLabel('idea')).toBe('La tua idea');
    expect(phaseLabel('draft')).toBe('La storia');
    expect(phaseLabel('shots')).toBe('Le scene');
  });
});

describe('choiceLabel e filmSubtitle', () => {
  it('danno il nome della voce, mai il suo id', () => {
    expect(choiceLabel(options.genres, 'drama')).toBe('Drammatico');
    expect(choiceLabel(options.genres, 'western')).toBeUndefined();
    expect(choiceLabel(undefined, 'drama')).toBeUndefined();
  });

  it('la riga sotto il titolo è «genere · durata»', () => {
    expect(filmSubtitle(film, options)).toBe('Drammatico · 1 min 30 s');
  });

  it('senza l’elenco delle scelte resta la durata, senza nomi tecnici', () => {
    expect(filmSubtitle(film, undefined)).toBe('1 min 30 s');
  });
});
