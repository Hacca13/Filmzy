import { healthResponseSchema } from '@filmzy/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError, getJson } from './client';

/** Un `fetch` finto che risponde sempre con la stessa risposta: i test non usano la rete. */
function fakeFetch(response: Response): typeof fetch {
  return () => Promise.resolve(response);
}

const parseHealth = (fetchImpl: typeof fetch) =>
  getJson('/health', healthResponseSchema, { fetchImpl });

describe('getJson', () => {
  it('restituisce la risposta controllata dallo schema', async () => {
    const fetchImpl = fakeFetch(Response.json({ status: 'ok' }));

    await expect(parseHealth(fetchImpl)).resolves.toEqual({ status: 'ok' });
  });

  it('chiama la rotta sotto il prefisso /api', async () => {
    const fetchSpy = vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ status: 'ok' })));

    await parseHealth(fetchSpy);

    expect(fetchSpy).toHaveBeenCalledWith('/api/health', expect.objectContaining({}));
  });

  it('segnala un errore HTTP', async () => {
    const fetchImpl = fakeFetch(new Response('boom', { status: 500 }));

    await expect(parseHealth(fetchImpl)).rejects.toMatchObject({ code: 'http_error' });
  });

  it('segnala una risposta fuori schema', async () => {
    const fetchImpl = fakeFetch(Response.json({ status: 'down' }));

    await expect(parseHealth(fetchImpl)).rejects.toMatchObject({ code: 'invalid_response' });
  });

  it('segnala un server irraggiungibile', async () => {
    const fetchImpl: typeof fetch = () => Promise.reject(new TypeError('fetch failed'));

    const error: unknown = await parseHealth(fetchImpl).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'network_error' });
  });
});
