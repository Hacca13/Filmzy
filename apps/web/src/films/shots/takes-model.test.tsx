import type { ShotTake } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShotVideoSection } from './ShotVideoSection';
import {
  formatMoment,
  keptTake,
  takeCaption,
  takeText,
  takesAreWorking,
  timeInVideo,
} from './takes-model';

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

describe('keptTake (T4.6)', () => {
  const done = (id: string, extra: Partial<ShotTake> = {}) =>
    take('succeeded', { id, assetId: `clip-${id}`, ...extra });

  it('senza scelta vale il più recente riuscito; un take scelto vale anche se è più vecchio', () => {
    const newest = done('nuovo');
    const oldest = done('vecchio');

    expect(keptTake({ shotId: 's', takes: [newest, oldest] })?.id).toBe('nuovo');
    expect(keptTake({ shotId: 's', takes: [newest, { ...oldest, chosen: true }] })?.id).toBe(
      'vecchio',
    );
  });

  it('i take non riusciti non contano, e senza take riusciti non c’è niente da tenere', () => {
    expect(keptTake({ shotId: 's', takes: [take('failed', { id: 'x' }), done('buono')] })?.id).toBe(
      'buono',
    );
    expect(
      keptTake({ shotId: 's', takes: [take('failed', { id: 'x', chosen: true })] }),
    ).toBeUndefined();
    expect(keptTake({ shotId: 's', takes: [] })).toBeUndefined();
  });
});

describe('timeInVideo e formatMoment (T4.6)', () => {
  it('il momento del lettore si arrotonda ai millesimi; senza lettore o con un valore strano vale l’inizio', () => {
    expect(timeInVideo(1.23456)).toBe(1.235);
    expect(timeInVideo(0)).toBe(0);
    expect(timeInVideo(undefined)).toBe(0);
    expect(timeInVideo(Number.NaN)).toBe(0);
    expect(timeInVideo(Number.POSITIVE_INFINITY)).toBe(0);
    expect(timeInVideo(-3)).toBe(0);
  });

  it('il momento si legge in italiano, con la virgola', () => {
    expect(formatMoment(1.5)).toBe('1,5 s');
    expect(formatMoment(0)).toBe('0 s');
    expect(formatMoment(2.346)).toBe('2,35 s');
  });
});
