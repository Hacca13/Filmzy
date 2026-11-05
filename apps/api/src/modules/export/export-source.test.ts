import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { AssemblyStore, ExportStore, SheetStore } from '@filmzy/db';
import type * as Media from '@filmzy/media';
import { MediaError, videoSize } from '@filmzy/media';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { JobRunner } from '../jobs/job-runner.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import { ExportService, type FolderOpener } from './export.service.js';

vi.mock('@filmzy/media', async (original) => ({
  ...(await original<typeof Media>()),
  videoSize: vi.fn(),
}));

/** Quando ffmpeg non risponde: da qui si arriva solo fingendo, perché nel programma vero c'è sempre. */
async function serviceWithFilm(): Promise<ExportService> {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-sorgente-'));
  await writeFile(path.join(dataDir, 'film.mp4'), 'un film');
  const stored = { assembly: { assetId: 'film' } };
  return new ExportService(
    { latest: () => undefined, succeeded: () => [] } as unknown as ExportStore,
    { lastSucceeded: () => stored } as unknown as AssemblyStore,
    { getAsset: () => ({ path: 'film.mp4', contentType: 'video/mp4' }) } as unknown as SheetStore,
    dataDir,
    {} as JobRunner,
    { get: () => ({}) } as unknown as ProjectsService,
    {} as FolderOpener,
  );
}

describe('quando il film montato non si legge', () => {
  beforeEach(() => {
    vi.mocked(videoSize).mockReset();
  });

  it.each(['ffmpeg_missing', 'timeout'] as const)(
    'con «%s» la pagina non si rompe e non offre di esportarlo',
    async (code) => {
      vi.mocked(videoSize).mockRejectedValue(new MediaError(code, 'no'));
      const service = await serviceWithFilm();

      expect(await service.view('film-1')).toEqual({});
      await expect(service.start('film-1', 720)).rejects.toMatchObject({
        response: { code: 'invalid_request', details: { field: 'exportSource' } },
      });
    },
  );

  it('un errore passeggero non resta in memoria: la volta dopo legge di nuovo', async () => {
    vi.mocked(videoSize).mockRejectedValueOnce(new MediaError('timeout', 'no'));
    vi.mocked(videoSize).mockResolvedValue({ width: 1280, height: 720 });
    const service = await serviceWithFilm();

    expect((await service.view('film-1')).source).toBeUndefined();
    expect((await service.view('film-1')).source?.qualities).toEqual([720, 480]);
  });

  it('un errore che non c’entra col film non si nasconde', async () => {
    vi.mocked(videoSize).mockRejectedValue(new Error('imprevisto'));
    const service = await serviceWithFilm();

    await expect(service.view('film-1')).rejects.toThrow('imprevisto');
  });
});
