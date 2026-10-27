import { describe, expect, it } from 'vitest';

import { spendOverviewSchema } from './spend-api.js';

describe('spendOverviewSchema', () => {
  it('un fornitore con limite, uno senza, e la spesa dei film', () => {
    const overview = {
      monthStart: '2026-10-01T00:00:00.000Z',
      totalMonthUsd: 17.5,
      providers: [
        {
          connectionId: 'fal',
          label: 'fal.ai',
          spentUsd: 16,
          capUsd: 20,
          percent: 80,
          level: 'warning',
        },
        { connectionId: 'anthropic', label: 'Anthropic', spentUsd: 1.5, level: 'none' },
      ],
      filmBudgetUsd: 10,
      films: [{ projectId: 'film-1', spentUsd: 9.2 }],
    };

    expect(spendOverviewSchema.parse(overview)).toEqual(overview);
  });

  it.each([
    { connectionId: 'fal', label: 'fal.ai', spentUsd: -1, level: 'none' },
    { connectionId: 'fal', label: 'fal.ai', spentUsd: 1, level: 'quasi' },
    { connectionId: 'fal', label: 'fal.ai', spentUsd: 1, capUsd: 0, level: 'ok' },
  ])('rifiuta il fornitore %j', (provider) => {
    expect(
      spendOverviewSchema.safeParse({
        monthStart: '2026-10-01T00:00:00.000Z',
        totalMonthUsd: 0,
        providers: [provider],
        films: [],
      }).success,
    ).toBe(false);
  });
});
