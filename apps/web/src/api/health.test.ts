import { describe, expect, it, vi } from 'vitest';

import { waitUntilServerIsReady } from './health';

const okResponse = () => Response.json({ status: 'ok' });
const serverDown = () => Promise.reject(new TypeError('fetch failed'));

describe('waitUntilServerIsReady', () => {
  it('risponde subito se il server è già pronto', async () => {
    const fetchImpl = vi.fn<typeof fetch>(() => Promise.resolve(okResponse()));

    await expect(waitUntilServerIsReady({ fetchImpl })).resolves.toEqual({ status: 'ok' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('riprova finché il server non si accende', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(serverDown)
      .mockImplementationOnce(serverDown)
      .mockImplementation(() => Promise.resolve(okResponse()));

    await expect(waitUntilServerIsReady({ fetchImpl, delayMs: 0 })).resolves.toEqual({
      status: 'ok',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('si arrende dopo il numero di tentativi indicato', async () => {
    const fetchImpl = vi.fn<typeof fetch>(serverDown);

    await expect(
      waitUntilServerIsReady({ fetchImpl, attempts: 3, delayMs: 0 }),
    ).rejects.toMatchObject({ code: 'network_error' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("si ferma subito se l'attesa viene annullata", async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn<typeof fetch>(() => {
      controller.abort(); // la pagina viene chiusa durante la prima richiesta
      return serverDown();
    });

    await expect(
      waitUntilServerIsReady({ fetchImpl, signal: controller.signal, delayMs: 60_000 }),
    ).rejects.toBeInstanceOf(Error);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
