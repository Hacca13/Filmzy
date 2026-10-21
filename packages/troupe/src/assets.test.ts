import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { LocalAssetStore } from './assets.js';

async function store(): Promise<{ dir: string; assets: LocalAssetStore }> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-assets-'));
  return { dir, assets: new LocalAssetStore(dir) };
}

const png = { fileName: 'take.png', contentType: 'image/png', bytes: new Uint8Array([1, 2, 3]) };

describe('LocalAssetStore', () => {
  it('salva il file nella cartella e dice dove', async () => {
    const { dir, assets } = await store();
    const stored = await assets.put(png);

    expect(stored.path.startsWith(dir)).toBe(true);
    expect(stored.contentType).toBe('image/png');
    expect(stored.bytes).toBe(3);
    expect(await readFile(stored.path)).toEqual(Buffer.from([1, 2, 3]));
  });

  it("lo stesso file non si salva due volte: l'id è il suo contenuto", async () => {
    const { dir, assets } = await store();
    const primo = await assets.put(png);
    const secondo = await assets.put({ ...png, fileName: 'un-altro-nome.png' });

    expect(secondo.assetId).toBe(primo.assetId);
    expect(await readdir(dir)).toHaveLength(1);
  });

  it('il nome del file lo decide il nostro codice, non il fornitore', async () => {
    const { assets } = await store();
    const stored = await assets.put({ ...png, fileName: '../../fuori/dalla/cartella.png' });

    expect(path.basename(stored.path)).toBe(`${stored.assetId}.png`);
  });

  it('accetta video e audio', async () => {
    const { assets } = await store();
    const video = await assets.put({ ...png, contentType: 'video/mp4' });
    const audio = await assets.put({ ...png, contentType: 'audio/wav' });

    expect(path.extname(video.path)).toBe('.mp4');
    expect(path.extname(audio.path)).toBe('.wav');
  });

  it('rifiuta un tipo che non sappiamo salvare, invece di scrivere un file muto', async () => {
    const { assets } = await store();

    await expect(assets.put({ ...png, contentType: 'application/zip' })).rejects.toMatchObject({
      code: 'invalid_output',
    });
  });
});
