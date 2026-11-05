import type { AssemblyView } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AssemblyBody } from './AssemblySection';
import { assemblyFailureText, assemblyIsWorking, gapText } from './assembly-model';

const view = (patch: Partial<AssemblyView> = {}): AssemblyView => ({
  gaps: [],
  upToDate: false,
  titles: {
    title: 'L’ultima corsa',
    cast: 'Con Anna e Marco',
    aiNotice: 'Contiene contenuti generati con intelligenza artificiale',
  },
  ...patch,
});

const made = {
  id: 'm-1',
  status: 'succeeded',
  assetId: 'film',
  createdAt: '2026-11-05T10:00:00.000Z',
} as const;

const body = (value: AssemblyView) =>
  renderToStaticMarkup(<AssemblyBody view={value} busy={false} onStart={() => undefined} />);

const startButton = (html: string) => /<button[^>]*>[^<]*<\/button>/.exec(html)?.[0] ?? '';

describe('cosa manca', () => {
  it('si scrive in parole semplici', () => {
    expect(gapText({ sceneNumber: 2, kind: 'not_planned' })).toBe(
      'Scena 2: le inquadrature sono ancora da pensare',
    );
    expect(gapText({ sceneNumber: 2, kind: 'stale' })).toBe(
      'Scena 2: è cambiata, rifai le inquadrature',
    );
    expect(gapText({ sceneNumber: 3, kind: 'no_take', missing: 1 })).toBe(
      'Scena 3: un’inquadratura senza video',
    );
    expect(gapText({ sceneNumber: 3, kind: 'no_take', missing: 4 })).toBe(
      'Scena 3: 4 inquadrature senza video',
    );
  });

  it('finché manca qualcosa il pulsante è spento, e l’elenco lo dice', () => {
    const html = body(view({ gaps: [{ sceneNumber: 1, kind: 'not_planned' }] }));

    expect(html).toContain('Per montare il film manca ancora');
    expect(startButton(html)).toContain('disabled');
  });
});

describe('il montaggio', () => {
  it('prima del primo tentativo si può montare, e i titoli si leggono', () => {
    const html = body(view());

    expect(startButton(html)).toContain('Monta il film');
    expect(startButton(html)).not.toContain('disabled');
    expect(html).toContain('L’ultima corsa');
    expect(html).toContain('Con Anna e Marco');
    expect(html).toContain('Contiene contenuti generati con intelligenza artificiale');
    expect(html).not.toContain('<video');
  });

  it('mentre lavora lo dice e non si chiede di nuovo', () => {
    const value = view({ latest: { ...made, status: 'running' } });

    expect(assemblyIsWorking(value)).toBe(true);
    expect(body(value)).toContain('Sto montando il film');
    expect(startButton(body(value))).toContain('disabled');
  });

  it('riuscito mostra il film e si può rifare', () => {
    const html = body(view({ latest: made, upToDate: true }));

    expect(html).toContain('<video');
    expect(startButton(html)).toContain('Monta di nuovo');
    expect(html).not.toContain('hai cambiato qualcosa');
  });

  it('se dopo è cambiato qualcosa lo dice', () => {
    expect(body(view({ latest: made, upToDate: false }))).toContain('hai cambiato qualcosa');
  });

  it('fallito dice perché, in parole semplici, e si può riprovare', () => {
    const html = body(
      view({
        latest: { id: 'm-1', status: 'failed', errorCode: 'not_found', createdAt: 'x' },
      }),
    );

    expect(html).toContain('non c’è più sul computer');
    expect(startButton(html)).not.toContain('disabled');
    expect(assemblyFailureText('ffmpeg_failed')).toContain('non è riuscito');
    expect(assemblyFailureText(undefined)).toContain('non è riuscito');
  });
});
