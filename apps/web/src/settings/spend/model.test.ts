import type { ProviderSpend, SpendBreach } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/client';
import { breachOf, breachText, raisedLimitUsd, spendBadge, spendLine } from './model';

const monthly: SpendBreach = {
  limit: 'monthly_cap',
  limitUsd: 20,
  spentUsd: 19.5,
  estimatedUsd: 1.2,
};

describe('breachOf', () => {
  it("riconosce l'errore «supera un limite» e ne tira fuori il limite", () => {
    const error = new ApiError('http_error', {
      status: 409,
      serverCode: 'spend_cap_reached',
      details: { spend: monthly },
    });

    expect(breachOf(error)).toEqual(monthly);
  });

  it('un altro errore, o uno senza dettagli, non è un limite superato', () => {
    expect(
      breachOf(new ApiError('http_error', { status: 502, serverCode: 'provider_unavailable' })),
    ).toBeUndefined();
    expect(
      breachOf(new ApiError('http_error', { status: 409, serverCode: 'spend_cap_reached' })),
    ).toBeUndefined();
    expect(breachOf(new Error('boh'))).toBeUndefined();
  });
});

describe('breachText', () => {
  it('il limite mensile dice il fornitore e quanto già speso', () => {
    expect(breachText(monthly, 'fal.ai')).toBe(
      'Questa generazione costa circa 1,20 $ e supera il limite di questo mese per fal.ai: ne hai già spesi 19,50 $ su 20,00 $.',
    );
  });

  it('il limite per film lo dice così', () => {
    expect(
      breachText({ limit: 'film_budget', limitUsd: 10, spentUsd: 9, estimatedUsd: 2 }),
    ).toContain('supera il limite per questo film');
  });

  it('«conferma sopra» non parla di quanto già speso', () => {
    const text = breachText({
      limit: 'confirm_above',
      limitUsd: 2,
      spentUsd: 0,
      estimatedUsd: 2.5,
    });

    expect(text).toBe(
      'Questa generazione costa circa 2,50 $, più della cifra sopra cui hai chiesto di confermare (2,00 $).',
    );
    expect(text).not.toContain('già spesi');
  });

  it('nessuna parola tecnica', () => {
    for (const limit of ['monthly_cap', 'film_budget', 'confirm_above'] as const) {
      expect(breachText({ ...monthly, limit })).not.toMatch(/prompt|token|spend_cap|modello/i);
    }
  });
});

describe('raisedLimitUsd', () => {
  it('abbastanza perché rientri, al dollaro intero', () => {
    expect(raisedLimitUsd(monthly)).toBe(21);
    expect(
      raisedLimitUsd({ limit: 'film_budget', limitUsd: 10, spentUsd: 9, estimatedUsd: 2 }),
    ).toBe(11);
  });

  it('per «conferma sopra» basta la stima', () => {
    expect(
      raisedLimitUsd({ limit: 'confirm_above', limitUsd: 2, spentUsd: 0, estimatedUsd: 2.5 }),
    ).toBe(3);
  });

  it('mai sotto un dollaro, anche per cifre minuscole', () => {
    expect(
      raisedLimitUsd({ limit: 'confirm_above', limitUsd: 0.001, spentUsd: 0, estimatedUsd: 0.004 }),
    ).toBe(1);
  });

  it('il nuovo limite fa rientrare la stessa generazione', () => {
    expect(raisedLimitUsd(monthly)).toBeGreaterThanOrEqual(monthly.spentUsd + monthly.estimatedUsd);
  });
});

describe('spendBadge', () => {
  const spend = (level: ProviderSpend['level'], percent?: number): ProviderSpend => ({
    connectionId: 'fal',
    label: 'fal.ai',
    spentUsd: 1,
    level,
    ...(percent === undefined ? {} : { capUsd: 10, percent }),
  });

  it("avvisa all'80% e al limite, e non dice niente prima", () => {
    expect(spendBadge(spend('warning', 83.4))).toEqual({
      text: '83% · Manca poco al limite',
      tone: 'warning',
    });
    expect(spendBadge(spend('reached', 100))).toEqual({
      text: '⚠ 100% · Limite raggiunto',
      tone: 'reached',
    });
    expect(spendBadge(spend('ok', 20))).toBeUndefined();
    expect(spendBadge(spend('none'))).toBeUndefined();
    expect(spendBadge(undefined)).toBeUndefined();
  });
});

describe('spendLine', () => {
  it('senza limite dice solo la spesa', () => {
    expect(spendLine({ connectionId: 'fal', label: 'fal.ai', spentUsd: 3, level: 'none' })).toBe(
      '3,00 $ questo mese · nessun limite',
    );
  });

  it('con limite dice quanto manca, mai sotto zero', () => {
    const base = { connectionId: 'fal', label: 'fal.ai', capUsd: 20, level: 'ok' } as const;

    expect(spendLine({ ...base, spentUsd: 12, percent: 60 })).toBe(
      '12,00 $ questo mese · limite 20,00 $ · mancano 8,00 $',
    );
    expect(spendLine({ ...base, spentUsd: 25, percent: 125, level: 'reached' })).toContain(
      'mancano 0,00 $',
    );
  });
});
