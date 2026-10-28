import type { Location, LocationAttempt, LocationImages } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProposalCard } from './LocationsPanel';
import { attemptText, hasReference, imagesAreWorking } from './model';

const attempt = (
  status: LocationAttempt['status'],
  extra: Partial<LocationAttempt> = {},
): LocationAttempt => ({
  attempt: 1,
  status,
  createdAt: '2026-10-28T10:00:00.000Z',
  assetIds: [],
  ...extra,
});

const images = (attempts: LocationAttempt[], chosenAssetId?: string): LocationImages => ({
  locationId: 'l-1',
  attempts,
  ...(chosenAssetId === undefined ? {} : { chosenAssetId }),
});

describe('model', () => {
  it('si continua a guardare finché un tentativo è in coda o lavora, poi basta', () => {
    expect(imagesAreWorking(images([attempt('queued')]))).toBe(true);
    expect(imagesAreWorking(images([attempt('succeeded'), attempt('running')]))).toBe(true);
    expect(imagesAreWorking(images([attempt('succeeded'), attempt('failed')]))).toBe(false);
    expect(imagesAreWorking(images([]))).toBe(false);
  });

  it('ogni stato dice cosa sta succedendo, e un tentativo fallito dice perché in parole semplici', () => {
    expect(attemptText(attempt('queued'))).toBe('In coda…');
    expect(attemptText(attempt('running'))).toBe('Sto disegnando il set…');
    expect(attemptText(attempt('succeeded', { assetIds: ['a'] }))).toBe('Pronto');
    expect(attemptText(attempt('failed', { errorCode: 'content_rejected' }))).toContain(
      'rifiutato',
    );
    expect(attemptText(attempt('failed', { errorCode: 'codice_inventato' }))).toContain(
      'Puoi riprovare',
    );
  });

  it('un luogo ha il riferimento quando un’immagine è stata scelta', () => {
    expect(hasReference(images([attempt('succeeded')], 'a'))).toBe(true);
    expect(hasReference(images([attempt('succeeded')]))).toBe(false);
    expect(hasReference(undefined)).toBe(false);
  });
});

describe('ProposalCard', () => {
  const proposal = {
    id: 'piazza',
    name: 'La piazza del paese',
    description: 'Piazza centrale al tramonto',
    prompt: 'a small town square at sunset',
  };
  const render = (busy = false) =>
    renderToStaticMarkup(
      <ul>
        <ProposalCard proposal={proposal} busy={busy} onAdd={() => undefined} />
      </ul>,
    );

  it('mostra il luogo in italiano e offre «Aggiungi», senza mai il testo in inglese del set', () => {
    const html = render();

    expect(html).toContain('La piazza del paese');
    expect(html).toContain('Piazza centrale al tramonto');
    expect(html).toContain('Aggiungi');
    expect(html).not.toContain('a small town square');
  });

  it('mentre lavora «Aggiungi» è spento', () => {
    expect(render(true)).toContain('disabled=""');
  });
});

describe('tipi', () => {
  it('un luogo senza riferimento ha le references vuote (compila anche senza immagini)', () => {
    const location: Location = {
      id: 'l-1',
      name: 'La piazza',
      description: 'Piazza',
      prompt: 'a square',
      references: [],
    };

    expect(location.references).toEqual([]);
  });
});
