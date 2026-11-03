import type { SpendRow } from '@filmzy/db';
import { describe, expect, it } from 'vitest';

import { filmBreakdown, filmLines } from './spend-report.js';

const row = (extra: Partial<SpendRow>): SpendRow => ({
  projectId: 'film-1',
  role: 'camera_operator',
  modelId: 'kling',
  connectionId: 'fal',
  spentUsd: 1,
  calls: 1,
  ...extra,
});

describe('filmLines', () => {
  const titles: Record<string, string> = {
    'film-1': 'L’ultima corsa',
    'film-2': 'Dove finisce il mare',
  };
  const titleOf = (id: string) => titles[id];

  it('ogni film ha la spesa dall’inizio e quella del mese; prima chi ha speso di più nel mese', () => {
    const all = [
      row({ projectId: 'film-1', spentUsd: 10 }),
      row({ projectId: 'film-1', role: 'screenwriter', spentUsd: 2 }),
      row({ projectId: 'film-2', spentUsd: 30 }),
    ];
    const month = [
      row({ projectId: 'film-1', spentUsd: 5 }),
      row({ projectId: 'film-2', spentUsd: 1 }),
    ];

    expect(filmLines(all, month, titleOf)).toEqual([
      { projectId: 'film-1', title: 'L’ultima corsa', spentUsd: 12, monthUsd: 5 },
      { projectId: 'film-2', title: 'Dove finisce il mare', spentUsd: 30, monthUsd: 1 },
    ]);
  });

  it('un film che quest’anno non ha speso nel mese compare lo stesso, dopo quelli del mese', () => {
    const lines = filmLines(
      [row({ projectId: 'film-1', spentUsd: 9 }), row({ projectId: 'film-2', spentUsd: 3 })],
      [row({ projectId: 'film-2', spentUsd: 3 })],
      titleOf,
    );

    expect(lines.map((line) => [line.projectId, line.monthUsd])).toEqual([
      ['film-2', 3],
      ['film-1', 0],
    ]);
  });

  it('le chiamate che non sono di un film non entrano, e un film senza spesa non compare', () => {
    const lines = filmLines(
      [row({ projectId: null, spentUsd: 4 }), row({ projectId: 'film-1', spentUsd: 0, calls: 0 })],
      [],
      titleOf,
    );

    expect(lines).toEqual([]);
  });

  it('un film che non c’è più si chiama con una frase, non con il suo codice', () => {
    const [line] = filmLines([row({ projectId: 'sparito', spentUsd: 2 })], [], titleOf);

    expect(line?.title).toBe('Un film che non c’è più');
  });
});

describe('filmBreakdown', () => {
  const config = {
    roles: {
      camera_operator: { label: 'Operatore di ripresa' },
      screenwriter: { label: 'Sceneggiatore' },
    },
    models: { kling: { label: 'Kling · Standard' }, claude: { label: 'Claude Sonnet' } },
    connections: { fal: { label: 'fal.ai' }, anthropic: {} },
  } as never;

  it('somma per ruolo e per servizio, dal più caro, con i nomi in parole semplici', () => {
    const rows = [
      row({ spentUsd: 6, calls: 2 }),
      row({ modelId: 'seedance', spentUsd: 2, calls: 1 }),
      row({
        role: 'screenwriter',
        modelId: 'claude',
        connectionId: 'anthropic',
        spentUsd: 0.4,
        calls: 3,
      }),
    ];

    const { roles, services } = filmBreakdown(rows, config);

    expect(roles).toEqual([
      { role: 'camera_operator', label: 'Operatore di ripresa', spentUsd: 8, calls: 3 },
      { role: 'screenwriter', label: 'Sceneggiatore', spentUsd: 0.4, calls: 3 },
    ]);
    expect(
      services.map((service) => [service.label, service.providerLabel, service.spentUsd]),
    ).toEqual([
      ['Kling · Standard', 'fal.ai', 6],
      ['seedance', 'fal.ai', 2],
      ['Claude Sonnet', 'anthropic', 0.4],
    ]);
  });

  it('senza configurazione i nomi sono gli id, mai una riga vuota', () => {
    const { roles, services } = filmBreakdown([row({ spentUsd: 3 })], undefined);

    expect(roles[0]?.label).toBe('camera_operator');
    expect(services[0]).toMatchObject({ label: 'kling', providerLabel: 'fal' });
  });

  it('un ruolo con sole chiamate fallite (nessuna spesa, nessuna chiamata) non compare', () => {
    const { roles, services } = filmBreakdown([row({ spentUsd: 0, calls: 0 })], config);

    expect(roles).toEqual([]);
    expect(services).toEqual([]);
  });

  it('senza scontrini non c’è niente da mostrare', () => {
    expect(filmBreakdown([], config)).toEqual({ roles: [], services: [] });
  });
});
