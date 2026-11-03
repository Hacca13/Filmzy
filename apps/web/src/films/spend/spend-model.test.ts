import { describe, expect, it } from 'vitest';

import { barShares, callsText, monthCounts, monthTitle, remainingText } from './spend-model';

describe('barShares', () => {
  it('la voce più cara riempie la barra, le altre in proporzione', () => {
    expect(barShares([12.4, 6.2, 3.1])).toEqual([100, 50, 25]);
  });

  it('una voce che ha speso qualcosa non sparisce mai del tutto', () => {
    expect(barShares([100, 0.01])).toEqual([100, 2]);
  });

  it('senza spesa le barre sono vuote, e senza voci non c’è niente', () => {
    expect(barShares([0, 0])).toEqual([0, 0]);
    expect(barShares([])).toEqual([]);
  });
});

describe('monthTitle e monthCounts', () => {
  it('il mese si scrive in maiuscolo e in italiano', () => {
    expect(monthTitle(new Date(2026, 9, 1).toISOString())).toBe('OTTOBRE 2026');
    expect(monthTitle(new Date(2027, 0, 1).toISOString())).toBe('GENNAIO 2027');
  });

  it('i conteggi hanno il singolare quando serve', () => {
    expect(monthCounts(3, 5)).toBe('3 film · 5 servizi utilizzati');
    expect(monthCounts(1, 1)).toBe('1 film · 1 servizio utilizzato');
    expect(monthCounts(0, 0)).toBe('0 film · 0 servizi utilizzati');
  });

  it('le chiamate hanno il singolare quando serve', () => {
    expect(callsText(1)).toBe('1 chiamata');
    expect(callsText(4)).toBe('4 chiamate');
  });
});

describe('remainingText', () => {
  it('dice quanto manca al limite, con la cifra in dollari', () => {
    expect(remainingText(12.4, 50)).toBe('mancano 37,60 $');
  });

  it('senza limite, o con il limite raggiunto o superato, non dice niente', () => {
    expect(remainingText(12.4, undefined)).toBeUndefined();
    expect(remainingText(50, 50)).toBeUndefined();
    expect(remainingText(60, 50)).toBeUndefined();
  });
});
