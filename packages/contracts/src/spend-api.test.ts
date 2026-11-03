import { describe, expect, it } from 'vitest';

import { filmSpendSchema, spendOverviewSchema } from './spend-api.js';

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
      servicesMonth: 2,
      filmsMonth: 1,
      films: [{ projectId: 'film-1', title: 'L’ultima corsa', spentUsd: 9.2, monthUsd: 4.1 }],
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
        servicesMonth: 0,
        filmsMonth: 0,
        films: [],
      }).success,
    ).toBe(false);
  });
});

describe('filmSpendSchema (T4.7)', () => {
  const film = {
    projectId: 'film-1',
    title: 'L’ultima corsa',
    totalUsd: 12.4,
    monthUsd: 12.4,
    roles: [{ role: 'camera_operator', label: 'Operatore di ripresa', spentUsd: 8.4, calls: 3 }],
    services: [
      {
        modelId: 'kling-o3-standard',
        label: 'Kling · Standard',
        providerLabel: 'fal.ai',
        spentUsd: 8.4,
        calls: 3,
      },
    ],
  };

  it('un film con la spesa per ruolo e per servizio', () => {
    expect(filmSpendSchema.parse(film)).toEqual(film);
    expect(filmSpendSchema.parse({ ...film, roles: [], services: [] }).roles).toEqual([]);
  });

  it.each([
    { totalUsd: -1 },
    { title: '' },
    { roles: [{ role: 'x', label: 'X', spentUsd: 1, calls: 1.5 }] },
    { services: [{ modelId: 'x', label: 'X', spentUsd: 1, calls: 1 }] },
  ])('rifiuta %j', (change) => {
    expect(filmSpendSchema.safeParse({ ...film, ...change }).success).toBe(false);
  });
});
