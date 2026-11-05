import type { rename } from 'node:fs/promises';

import { describe, expect, it, vi } from 'vitest';

import { moveIntoPlace } from './move-file.js';

describe('mettere un file al suo posto', () => {
  const busy = (code: string) => Object.assign(new Error('occupato'), { code });

  it('se è occupato per un attimo riprova, e ce la fa', async () => {
    const move = vi
      .fn<typeof rename>()
      .mockRejectedValueOnce(busy('EPERM'))
      .mockRejectedValueOnce(busy('EBUSY'))
      .mockResolvedValue(undefined);

    await moveIntoPlace('a', 'b', { move, waitMs: 0 });

    expect(move).toHaveBeenCalledTimes(3);
  });

  it('se resta occupato si arrende col motivo vero', async () => {
    const move = vi.fn<typeof rename>().mockRejectedValue(busy('EPERM'));

    await expect(moveIntoPlace('a', 'b', { move, waitMs: 0 })).rejects.toMatchObject({
      code: 'EPERM',
    });
    expect(move).toHaveBeenCalledTimes(6);
  });

  it('un disco pieno non si riprova: aspettare non serve', async () => {
    const move = vi.fn<typeof rename>().mockRejectedValue(busy('ENOSPC'));

    await expect(moveIntoPlace('a', 'b', { move, waitMs: 0 })).rejects.toMatchObject({
      code: 'ENOSPC',
    });
    expect(move).toHaveBeenCalledTimes(1);
  });
});
