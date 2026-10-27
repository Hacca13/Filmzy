import type { DraftTestResult } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TestResult } from './TestPanel';

const result: DraftTestResult = {
  example: { shot: 'primo piano' },
  output: { prompt: 'close-up of a hand' },
  receipt: {
    id: 'g-1',
    role: 'cinematographer',
    purpose: 'draft_test',
    releaseId: 'bozza',
    roleConfigHash: 'abc',
    modelId: 'claude-sonnet',
    modelLabel: 'Claude Sonnet',
    connectionId: 'anthropic',
    providerModel: 'x',
    inputHash: 'in',
    idempotencyKey: 'key',
    status: 'succeeded',
    attempts: 1,
    estimatedCostUsd: 0.004,
    actualCostUsd: 0.0031,
    durationMs: 820,
    createdAt: '2026-10-27T10:00:00.000Z',
  },
};

describe('TestResult', () => {
  it('mostra esempio, risultato, servizio, costo vero contro stima e durata', () => {
    const html = renderToStaticMarkup(<TestResult result={result} />);

    expect(html).toContain('Esempio fisso');
    expect(html).toContain('primo piano');
    expect(html).toContain('Risultato');
    expect(html).toContain('close-up of a hand');
    expect(html).toContain('Claude Sonnet');
    expect(html).toContain('costo 0,0031 $');
    expect(html).toContain('stimato 0,0040 $');
    expect(html).toContain('0,8 secondi');
  });

  it('senza durata non scrive niente di inventato', () => {
    const html = renderToStaticMarkup(
      <TestResult result={{ ...result, receipt: { ...result.receipt, durationMs: undefined } }} />,
    );

    expect(html).not.toContain('secondi');
  });
});
