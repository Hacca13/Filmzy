import { JOB_INTERRUPTED, type ExportView } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/client';
import { ExportBody } from './ExportSection';
import {
  exportFailureText,
  exportIsWorking,
  formatLabel,
  openFolderFailureText,
  qualityLabel,
} from './export-model';

const source: NonNullable<ExportView['source']> = {
  width: 1920,
  height: 1080,
  qualities: [1080, 720, 480],
};

const attempt = (patch: Partial<NonNullable<ExportView['latest']>> = {}) => ({
  id: 'e-1',
  status: 'succeeded' as const,
  shortSide: 1080,
  createdAt: '2026-11-05T10:00:00.000Z',
  ...patch,
});

const file: NonNullable<ExportView['file']> = {
  id: 'e-1',
  shortSide: 1080,
  path: 'C:\\Filmzy\\L’ultima corsa - 1080p.mp4',
  current: true,
};

const body = (
  view: ExportView,
  { behind = false, chosen = undefined as number | undefined } = {},
) =>
  renderToStaticMarkup(
    <ExportBody
      filmId="film-1"
      view={view}
      behind={behind}
      chosen={chosen}
      busy={false}
      opening={false}
      onChoose={() => undefined}
      onStart={() => undefined}
      onOpenFolder={() => undefined}
    />,
  );

const startButton = (html: string) =>
  /<button[^>]*>Esporta il film<\/button>/.exec(html)?.[0] ?? '';

describe('come si scrive', () => {
  it('la qualità', () => {
    expect(qualityLabel(2160)).toBe('4K · 2160p');
    expect(qualityLabel(1080)).toBe('Alta definizione · 1080p');
    expect(qualityLabel(720)).toBe('HD · 720p');
    expect(qualityLabel(480)).toBe('Leggera · 480p');
    expect(qualityLabel(240)).toBe('240p');
  });

  it('il formato', () => {
    expect(formatLabel({ width: 1920, height: 1080 })).toBe('16:9 · Orizzontale');
    // Le misure pari arrotondano: resta 16:9.
    expect(formatLabel({ width: 852, height: 480 })).toBe('16:9 · Orizzontale');
    expect(formatLabel({ width: 1080, height: 1920 })).toBe('9:16 · Verticale');
    expect(formatLabel({ width: 1000, height: 1000 })).toBe('1:1 · Quadrato');
    expect(formatLabel({ width: 1920, height: 1000 })).toBe('1920×1000 · Orizzontale');
  });

  it('perché non è riuscita', () => {
    expect(exportFailureText(JOB_INTERRUPTED)).toContain('Non riparte da solo');
    expect(exportFailureText('disk_full')).toContain('disco è pieno');
    expect(exportFailureText('file_in_use')).toContain('aperto in un altro programma');
    expect(exportFailureText('not_found')).toContain('Montalo di nuovo');
    expect(exportFailureText('ffmpeg_failed')).toContain('non è riuscita');
    expect(exportFailureText(undefined)).toContain('non è riuscita');
  });

  it('perché la cartella non si è aperta', () => {
    expect(
      openFolderFailureText(new ApiError('http_error', { serverCode: 'media_failed' })),
    ).toContain('puoi aprirla a mano');
    expect(openFolderFailureText(new ApiError('network_error'))).toContain('non risponde');
  });
});

describe('esportare', () => {
  it('prima del primo tentativo si sceglie la qualità, partendo dalla più alta', () => {
    const html = body({ source });

    expect(html).toContain('Qualità di esportazione');
    expect(html).toContain('Alta definizione · 1080p');
    expect(html).toContain('Leggera · 480p');
    expect(html).toContain('16:9 · Orizzontale');
    expect(startButton(html)).not.toContain('disabled');
    expect(html).not.toContain('Esportazione completata');
  });

  it('una scelta che non vale più torna alla più alta', () => {
    expect(body({ source }, { chosen: 480 })).toMatch(/<option value="480" selected/);
    expect(body({ source }, { chosen: 240 })).toMatch(/<option value="1080" selected/);
  });

  it('mentre lavora lo dice, e non si chiede di nuovo', () => {
    const view: ExportView = { source, latest: attempt({ status: 'running' }), file };

    expect(exportIsWorking(view)).toBe(true);
    expect(body(view)).toContain('Sto esportando il film');
    expect(startButton(body(view))).toContain('disabled');
    expect(body(view)).not.toContain('Esportazione completata');
  });

  it('riuscita dice dov’è, e si può aprire la cartella o salvare una copia', () => {
    const html = body({ source, latest: attempt(), file });

    expect(html).toContain('Esportazione completata');
    expect(html).toContain('L’ultima corsa - 1080p.mp4');
    expect(html).toContain('readOnly');
    expect(html).toContain('Apri la cartella');
    expect(html).toContain('href="/api/projects/film-1/exports/e-1/file"');
    expect(html).toContain('download');
    expect(html).not.toContain('montaggio di prima');
  });

  it('fallita dice perché, si può riprovare, e il file di prima resta', () => {
    const html = body({
      source,
      latest: attempt({ id: 'e-2', status: 'failed', errorCode: 'disk_full' }),
      file,
    });

    expect(html).toContain('disco è pieno');
    expect(startButton(html)).not.toContain('disabled');
    expect(html).toContain('Esportazione completata');
  });

  it('un file di un montaggio di prima lo dice', () => {
    expect(body({ source, latest: attempt(), file: { ...file, current: false } })).toContain(
      'montaggio di prima',
    );
  });

  it('se dopo il montaggio è cambiato qualcosa lo dice, e non blocca', () => {
    const html = body({ source }, { behind: true });

    expect(html).toContain('le modifiche fatte dopo non ci sono');
    expect(startButton(html)).not.toContain('disabled');
  });

  it('se il film montato non c’è più lo dice, senza pulsanti', () => {
    const html = body({});

    expect(html).toContain('montalo di nuovo');
    expect(startButton(html)).toBe('');
  });
});
