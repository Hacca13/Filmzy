import { describe, expect, it } from 'vitest';

import { IDEA_MAX_LENGTH, PROJECT_DURATIONS_S, projectSchema } from './project.js';
import {
  createProjectBodySchema,
  projectOptionsSchema,
  updateProjectBodySchema,
} from './projects-api.js';

const body = {
  idea: 'Un uomo trova una bobina sull’ultimo treno',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'handheld_warm',
  durationS: 60,
};

describe('createProjectBodySchema', () => {
  it('accetta un film senza titolo: lo propone il programma', () => {
    expect(createProjectBodySchema.parse(body)).toEqual(body);
  });

  it("toglie gli spazi attorno all'idea e rifiuta un'idea vuota", () => {
    expect(createProjectBodySchema.parse({ ...body, idea: '  una scintilla  ' }).idea).toBe(
      'una scintilla',
    );
    expect(createProjectBodySchema.safeParse({ ...body, idea: '   ' }).success).toBe(false);
  });

  it("rifiuta un'idea troppo lunga", () => {
    const tooLong = { ...body, idea: 'a'.repeat(IDEA_MAX_LENGTH + 1) };

    expect(createProjectBodySchema.safeParse(tooLong).success).toBe(false);
    expect(
      createProjectBodySchema.safeParse({ ...body, idea: 'a'.repeat(IDEA_MAX_LENGTH) }).success,
    ).toBe(true);
  });

  it.each(PROJECT_DURATIONS_S)('accetta la durata di %i secondi', (durationS) => {
    expect(createProjectBodySchema.parse({ ...body, durationS }).durationS).toBe(durationS);
  });

  it('rifiuta una durata che non è nell’elenco', () => {
    expect(createProjectBodySchema.safeParse({ ...body, durationS: 45 }).success).toBe(false);
  });

  it('rifiuta un campo che non conosce e un id di preset scritto male', () => {
    expect(createProjectBodySchema.safeParse({ ...body, phase: 'final' }).success).toBe(false);
    expect(createProjectBodySchema.safeParse({ ...body, genre: 'Drammatico' }).success).toBe(false);
  });
});

describe('updateProjectBodySchema', () => {
  it('cambia solo i campi presenti', () => {
    expect(updateProjectBodySchema.parse({ tone: 'dark' })).toEqual({ tone: 'dark' });
    expect(updateProjectBodySchema.parse({})).toEqual({});
  });

  it('un campo presente deve comunque essere valido', () => {
    expect(updateProjectBodySchema.safeParse({ idea: '' }).success).toBe(false);
  });
});

describe('projectOptionsSchema', () => {
  it('descrive cosa si può scegliere', () => {
    const options = {
      genres: [{ id: 'drama', label: 'Drammatico' }],
      tones: [{ id: 'dark', label: 'Cupo' }],
      styles: [{ id: 'realistic', label: 'Realistico', description: 'Ripresa dal vero' }],
      cinematography: [{ id: 'noir', label: 'Noir' }],
      durationsS: [30, 60],
      ideaMaxLength: IDEA_MAX_LENGTH,
      titleMaxLength: 80,
    };

    expect(projectOptionsSchema.parse(options)).toEqual(options);
  });
});

describe('projectSchema', () => {
  it('è il riassunto più stile, fotografia, fase e date', () => {
    const project = {
      id: 'film-1',
      title: 'L’ultima corsa',
      idea: body.idea,
      genre: 'drama',
      tone: 'moving',
      language: 'it',
      durationS: 60,
      style: 'realistic',
      cinematography: 'handheld_warm',
      phase: 'draft',
      createdAt: '2026-10-28T10:00:00.000Z',
      updatedAt: '2026-10-28T10:05:00.000Z',
    };

    expect(projectSchema.parse(project)).toEqual(project);
    expect(projectSchema.parse({ ...project, durationS: 45 }).durationS).toBe(45);
    expect(projectSchema.safeParse({ ...project, phase: 'casting' }).success).toBe(false);
  });
});
