import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { SheetStore } from '@filmzy/db';
import { beforeEach, describe, expect, it } from 'vitest';

import { referenceInput } from './references.js';

let dataDir: string;

/** Un archivio dei file con i soli record che servono al test. */
const filesWith = (records: Record<string, { path: string; contentType: string }>) =>
  ({ getAsset: (id: string) => records[id] }) as unknown as Pick<SheetStore, 'getAsset'>;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-riferimenti-'));
  await mkdir(path.join(dataDir, 'progetti', 'film-1', 'immagini'), { recursive: true });
  await writeFile(path.join(dataDir, 'progetti', 'film-1', 'immagini', 'volto.png'), 'PNG');
});

describe('referenceInput', () => {
  it('legge il file del record e lo dà come riferimento', async () => {
    const files = filesWith({
      volto: { path: 'progetti/film-1/immagini/volto.png', contentType: 'image/png' },
    });

    const input = await referenceInput(files, dataDir, 'volto');

    expect(input?.use).toBe('reference');
    expect(input?.file).toMatchObject({ fileName: 'volto.png', contentType: 'image/png' });
    expect(new TextDecoder().decode(input?.file.bytes)).toBe('PNG');
  });

  it('un file che non c’è più dà «niente», non un errore', async () => {
    const files = filesWith({
      perso: { path: 'progetti/film-1/immagini/perso.png', contentType: 'image/png' },
    });

    expect(await referenceInput(files, dataDir, 'perso')).toBeUndefined();
    expect(await referenceInput(files, dataDir, 'sconosciuto')).toBeUndefined();
  });

  it('un record con un percorso fuori dalla cartella dei dati non fa leggere niente', async () => {
    await writeFile(path.join(path.dirname(dataDir), 'segreto.txt'), 'non si legge');
    const files = filesWith({
      fuori: { path: '../segreto.txt', contentType: 'text/plain' },
      assoluto: {
        path: path.join(path.dirname(dataDir), 'segreto.txt'),
        contentType: 'text/plain',
      },
      // Una cartella che ha lo stesso inizio del nome non è la cartella dei dati.
      vicino: { path: `../${path.basename(dataDir)}-altro/x.png`, contentType: 'image/png' },
    });

    expect(await referenceInput(files, dataDir, 'fuori')).toBeUndefined();
    expect(await referenceInput(files, dataDir, 'assoluto')).toBeUndefined();
    expect(await referenceInput(files, dataDir, 'vicino')).toBeUndefined();
  });
});
