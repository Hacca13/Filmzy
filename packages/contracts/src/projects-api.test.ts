import { describe, expect, it } from 'vitest';

import { IDEA_MAX_LENGTH, projectSchema } from './project.js';
import {
  createProjectBodySchema,
  filmEstimateQuerySchema,
  filmEstimateSchema,
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

  it('accetta una durata qualsiasi in secondi interi: i limiti del tipo li controlla il server', () => {
    expect(createProjectBodySchema.parse({ ...body, durationS: 45 }).durationS).toBe(45);
    expect(createProjectBodySchema.safeParse({ ...body, durationS: 0 }).success).toBe(false);
    expect(createProjectBodySchema.safeParse({ ...body, durationS: 4.5 }).success).toBe(false);
  });

  it('il tipo di film è facoltativo, ma deve esistere', () => {
    expect(createProjectBodySchema.parse({ ...body, kind: 'spot' }).kind).toBe('spot');
    expect(createProjectBodySchema.parse(body).kind).toBeUndefined();
    expect(createProjectBodySchema.safeParse({ ...body, kind: 'serie' }).success).toBe(false);
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
      kinds: [
        { id: 'short', minS: 60, maxS: 600, stepS: 30, defaultS: 60, available: true },
        { id: 'feature', minS: 3600, stepS: 600, defaultS: 5400, available: false },
      ],
      defaults: { genre: 'drama', kind: 'short', durationS: 60 },
      ideaMaxLength: IDEA_MAX_LENGTH,
      titleMaxLength: 80,
    };

    expect(projectOptionsSchema.parse(options)).toEqual(options);
  });
});

describe('il costo indicativo', () => {
  it('la durata arriva come testo nell’indirizzo', () => {
    expect(filmEstimateQuerySchema.parse({ durationS: '300' })).toEqual({ durationS: 300 });
    expect(filmEstimateQuerySchema.safeParse({ durationS: 'tanto' }).success).toBe(false);
    expect(filmEstimateQuerySchema.safeParse({}).success).toBe(false);
  });

  it('è una forchetta, oppure il motivo per cui non si può fare', () => {
    expect(filmEstimateSchema.safeParse({ available: true, lowUsd: 35, highUsd: 70 }).success).toBe(
      true,
    );
    expect(
      filmEstimateSchema.safeParse({ available: false, reason: 'no_video_service' }).success,
    ).toBe(true);
    expect(filmEstimateSchema.safeParse({ available: true }).success).toBe(false);
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
      kind: 'short',
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
