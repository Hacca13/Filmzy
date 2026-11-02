import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ImageAttemptsSection } from './ImageAttemptsSection';
import {
  attemptWho,
  attemptsAreWorking,
  describeAttempt,
  type ImageAttempt,
} from './image-attempts';

const attempt = (
  status: ImageAttempt['status'],
  extra: Partial<ImageAttempt> = {},
): ImageAttempt => ({
  attempt: 1,
  status,
  createdAt: '2026-11-02T10:00:00.000Z',
  assetIds: [],
  ...extra,
});

describe('attemptsAreWorking', () => {
  it('si guarda finché un tentativo è in coda o lavora', () => {
    expect(attemptsAreWorking({ attempts: [attempt('queued')] })).toBe(true);
    expect(attemptsAreWorking({ attempts: [attempt('succeeded'), attempt('running')] })).toBe(true);
    expect(attemptsAreWorking({ attempts: [attempt('failed'), attempt('succeeded')] })).toBe(false);
    expect(attemptsAreWorking({ attempts: [] })).toBe(false);
  });
});

describe('describeAttempt', () => {
  it('mentre lavora dice cosa sta disegnando, col testo che gli si dà', () => {
    expect(describeAttempt(attempt('running'), 'Sto disegnando l’inquadratura…')).toBe(
      'Sto disegnando l’inquadratura…',
    );
    expect(describeAttempt(attempt('queued'), 'qualsiasi')).toBe('In coda…');
  });

  it('un tentativo riuscito è «Pronto», o dice che non ha immagini', () => {
    expect(describeAttempt(attempt('succeeded', { assetIds: ['a'] }), 'x')).toBe('Pronto');
    expect(describeAttempt(attempt('succeeded'), 'x')).toBe('Nessuna immagine');
  });

  it('un fallimento dice perché in parole semplici, e senza motivo noto invita a riprovare', () => {
    expect(describeAttempt(attempt('failed', { errorCode: 'content_rejected' }), 'x')).toContain(
      'rifiutato',
    );
    expect(describeAttempt(attempt('failed', { errorCode: 'spend_cap_reached' }), 'x')).toContain(
      'limite di spesa',
    );
    expect(describeAttempt(attempt('failed', { errorCode: 'codice_inventato' }), 'x')).toContain(
      'Puoi riprovare',
    );
  });
});

describe('attemptWho', () => {
  it('dice il servizio e il costo vero, come nell’intestazione del tentativo', () => {
    const done = attempt('succeeded', { modelLabel: 'Seedream · Standard', costUsd: 0.27 });

    expect(attemptWho(done)).toBe('Seedream · Standard · 0,27 $');
  });

  it('mentre lavora c’è solo il servizio scelto; senza niente, niente', () => {
    expect(attemptWho(attempt('running', { modelLabel: 'Seedream · Standard' }))).toBe(
      'Seedream · Standard',
    );
    expect(attemptWho(attempt('queued'))).toBe('');
  });
});

describe('ImageAttemptsSection', () => {
  const never = () => new Promise<never>(() => undefined);
  const render = () =>
    renderToStaticMarkup(
      <ImageAttemptsSection
        title="Storyboard"
        hint="Scegline una."
        createVerb="Crea lo storyboard"
        workingText="Sto disegnando…"
        imageLabel="Inquadratura"
        wide
        load={never}
        loadOptions={never}
        start={never}
        choose={never}
      />,
    );

  it('prima di sapere i servizi mostra il titolo, la spiegazione e un pulsante spento', () => {
    const html = render();

    expect(html).toContain('<h5>Storyboard</h5>');
    expect(html).toContain('Scegline una.');
    expect(html).toContain('Crea lo storyboard');
    expect(html).toMatch(/<button[^>]*disabled/);
  });
});
