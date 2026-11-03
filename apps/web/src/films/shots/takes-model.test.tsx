import type { ShotTake } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShotVideoSection } from './ShotVideoSection';
import { takeCaption, takeText, takesAreWorking } from './takes-model';

const take = (status: ShotTake['status'], extra: Partial<ShotTake> = {}): ShotTake => ({
  id: 't-1',
  status,
  modelId: 'kling-o3-standard',
  modelLabel: 'Kling · Standard',
  chosen: false,
  createdAt: '2026-11-02T10:00:00.000Z',
  ...extra,
});

describe('takesAreWorking', () => {
  it('si continua a guardare finché un take è in coda o lavora, poi basta', () => {
    expect(takesAreWorking({ shotId: 's', takes: [take('queued')] })).toBe(true);
    expect(takesAreWorking({ shotId: 's', takes: [take('succeeded'), take('running')] })).toBe(
      true,
    );
    expect(takesAreWorking({ shotId: 's', takes: [take('succeeded'), take('failed')] })).toBe(
      false,
    );
    expect(takesAreWorking({ shotId: 's', takes: [] })).toBe(false);
  });
});

describe('takeText', () => {
  it('ogni stato dice cosa sta succedendo, e il video avverte che può volerci un po’', () => {
    expect(takeText(take('queued'))).toBe('In coda…');
    expect(takeText(take('running'))).toContain('qualche minuto');
    expect(takeText(take('succeeded', { assetId: 'a' }))).toBe('Pronto');
    expect(takeText(take('succeeded'))).toBe('Nessun video');
  });

  it('un take fallito dice perché in parole semplici, e senza motivo noto invita a riprovare', () => {
    expect(takeText(take('failed', { errorCode: 'content_rejected' }))).toContain('rifiutato');
    expect(takeText(take('failed', { errorCode: 'spend_cap_reached' }))).toContain(
      'limite di spesa',
    );
    expect(takeText(take('failed', { errorCode: 'codice_inventato' }))).toContain(
      'anche con un altro servizio',
    );
  });
});

describe('takeCaption', () => {
  it('nomina il servizio che ha lavorato e il costo vero', () => {
    expect(takeCaption(take('succeeded', { costUsd: 0.42 }))).toBe(
      'Fatto con Kling · Standard · costato 0,42 $',
    );
  });

  it('senza costo nomina solo il servizio', () => {
    expect(takeCaption(take('succeeded'))).toBe('Fatto con Kling · Standard');
  });
});

describe('ShotVideoSection', () => {
  it('mentre legge mostra il titolo e la spiegazione, e il pulsante è spento finché non si sa il servizio', () => {
    const html = renderToStaticMarkup(
      <ShotVideoSection filmId="f" shotId="s-1" onSettled={() => undefined} />,
    );

    expect(html).toContain('<h5>Video</h5>');
    expect(html).toContain('nuovo take');
    expect(html).toContain('Genera il video');
    expect(html).toMatch(/<button[^>]*disabled/);
  });
});
