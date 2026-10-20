import { describe, expect, it } from 'vitest';

import { PROJECT_PHASES, projectPhaseSchema, projectSummarySchema } from './project.js';

describe('projectPhaseSchema', () => {
  it.each(PROJECT_PHASES)('accetta %j', (phase) => {
    expect(projectPhaseSchema.parse(phase)).toBe(phase);
  });

  it('rifiuta una fase inventata', () => {
    expect(projectPhaseSchema.safeParse('casting').success).toBe(false);
  });
});

describe('projectSummarySchema', () => {
  it('accetta un riassunto completo', () => {
    const summary = {
      id: 'proj-1',
      title: 'Il corto di Anna',
      idea: 'Una donna attraversa la città per ritrovare un vecchio amico',
      genre: 'drama',
      tone: 'moving',
      language: 'it',
      durationS: 60,
    };
    expect(projectSummarySchema.parse(summary)).toEqual(summary);
  });

  it('rifiuta una durata negativa', () => {
    expect(
      projectSummarySchema.safeParse({
        id: 'proj-1',
        title: 'x',
        idea: 'x',
        genre: 'drama',
        tone: 'moving',
        language: 'it',
        durationS: -1,
      }).success,
    ).toBe(false);
  });
});
