import type { Project, ProjectOptions } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  choiceLabel,
  draftOf,
  filmSubtitle,
  forgetNewFilmDraft,
  formatCostRange,
  formatDuration,
  formatLength,
  initialDraft,
  lengthForKind,
  newFilmDraft,
  noEstimateText,
  rememberNewFilmDraft,
  phaseLabel,
  toBody,
} from './model';

const options: ProjectOptions = {
  genres: [{ id: 'drama', label: 'Drammatico' }],
  tones: [{ id: 'moving', label: 'Commovente' }],
  styles: [{ id: 'realistic', label: 'Realistico' }],
  cinematography: [{ id: 'noir', label: 'Noir' }],
  kinds: [
    { id: 'spot', minS: 15, maxS: 60, stepS: 5, defaultS: 30, available: true },
    { id: 'short', minS: 60, maxS: 600, stepS: 30, defaultS: 60, available: true },
  ],
  defaults: {
    genre: 'drama',
    tone: 'moving',
    style: 'realistic',
    cinematography: 'noir',
    kind: 'short',
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
  kind: 'short',
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:05:00.000Z',
};

describe('initialDraft', () => {
  it('parte dalle voci scelte dal server, con l’idea ancora vuota', () => {
    expect(initialDraft(options)).toEqual({ idea: '', title: '', ...options.defaults });
  });

  it('senza voci da proporre quei campi restano vuoti, e il tipo di film c’è sempre', () => {
    expect(initialDraft({ ...options, defaults: { kind: 'short', durationS: 60 } })).toEqual({
      idea: '',
      title: '',
      kind: 'short',
      durationS: 60,
    });
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
      kind: 'short',
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
      defaults: {
        genre: 'drama',
        style: 'realistic',
        cinematography: 'noir',
        kind: 'short',
        durationS: 60,
      },
    });

    expect(toBody({ ...withoutTone, idea: 'x' })).toBeUndefined();
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
      kind: 'short',
      durationS: 90,
    });
  });
});

describe('la bozza di un film nuovo', () => {
  it('resta se si cambia pagina, e sparisce quando il film è creato', () => {
    const draft = { ...initialDraft(options), idea: 'Una scintilla' };

    rememberNewFilmDraft(draft);
    expect(newFilmDraft()).toEqual(draft);

    forgetNewFilmDraft();
    expect(newFilmDraft()).toBeUndefined();
  });
});

describe('tipo di film e durata', () => {
  it('la durata si scrive per intero', () => {
    expect(formatLength(15)).toBe('15 secondi');
    expect(formatLength(60)).toBe('1 minuto');
    expect(formatLength(600)).toBe('10 minuti');
    expect(formatLength(90)).toBe('1 minuto e 30 secondi');
    expect(formatLength(61)).toBe('1 minuto e 1 secondo');
  });

  it('cambiando tipo la durata resta se ci sta, altrimenti riparte', () => {
    const spot = { minS: 15, maxS: 60, defaultS: 30 };

    expect(lengthForKind(spot, 45)).toBe(45);
    expect(lengthForKind(spot, 300)).toBe(30);
    expect(lengthForKind(spot, undefined)).toBe(30);
  });

  it('il costo è una forchetta senza centesimi, e mai zero', () => {
    expect(formatCostRange(34.6, 70.2)).toBe('circa 35–70 $');
    expect(formatCostRange(0.2, 0.4)).toBe('circa 1 $');
  });

  it('se la stima non si può fare dice perché', () => {
    expect(noEstimateText('no_video_service')).toContain('servizio video');
    expect(noEstimateText('no_image_service')).toContain('immagini');
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
