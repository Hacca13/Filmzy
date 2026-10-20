import { healthResponseSchema } from '@filmzy/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError, getJson } from './client';

/** Un `fetch` finto che risponde sempre con la stessa risposta: i test non usano la rete. */
function fakeFetch(response: Response): typeof fetch {
  return () => Promise.resolve(response);
}

const parseHealth = (fetchImpl: typeof fetch) =>
  getJson('/health', healthResponseSchema, { fetchImpl });

/** Esegue la chiamata e restituisce l'errore, per controllarne i dettagli. */
async function failureOf(fetchImpl: typeof fetch): Promise<unknown> {
  return parseHealth(fetchImpl).catch((caught: unknown) => caught);
}

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

  it('segnala un errore HTTP con lo stato e il codice scritto dal server', async () => {
    const error = await failureOf(
      fakeFetch(Response.json({ code: 'forbidden_host' }, { status: 403 })),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'http_error', status: 403, serverCode: 'forbidden_host' });
  });

  it("segnala un errore HTTP anche se il corpo non è nel formato dell'API", async () => {
    const error = await failureOf(fakeFetch(new Response('Bad Gateway', { status: 502 })));

    expect(error).toMatchObject({ code: 'http_error', status: 502, serverCode: undefined });
  });

  it('segnala una risposta fuori schema', async () => {
    const error = await failureOf(fakeFetch(Response.json({ status: 'down' })));

    expect(error).toMatchObject({ code: 'invalid_response' });
  });

  it('segnala un corpo che non è JSON come risposta non valida', async () => {
    const error = await failureOf(fakeFetch(new Response('<html>')));

    expect(error).toMatchObject({ code: 'invalid_response' });
  });

  it('segnala un server irraggiungibile', async () => {
    const error = await failureOf(() => Promise.reject(new TypeError('fetch failed')));

    expect(error).toMatchObject({ code: 'network_error' });
  });

  it('segnala come errore di rete una connessione interrotta durante la lettura del corpo', async () => {
    const brokenBody = new Response('{"status":');
    vi.spyOn(brokenBody, 'json').mockRejectedValue(new TypeError('terminated'));

    const error = await failureOf(fakeFetch(brokenBody));

    expect(error).toMatchObject({ code: 'network_error' });
  });
});
