import type { Connection } from '@filmzy/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ProviderError } from '../provider-error.js';
import { testConnection } from './index.js';
import type { ConnectionTestOptions } from './types.js';

const SECRET = 'sk-chiave-segretissima-123';

function connection(extra: Partial<Connection>): Connection {
  return {
    adapter: 'anthropic',
    api_key: 'env:CHIAVE',
    timeout_s: 60,
    max_concurrency: 1,
    enabled: true,
    ...extra,
  };
}

interface Call {
  url: string;
  headers: Record<string, string>;
}

/** Un `fetch` finto che ricorda cosa gli si è chiesto e risponde come deciso: nessuna rete (regola 5). */
function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
      headers: (init?.headers ?? {}) as Record<string, string>,
    });
    return Promise.resolve(respond());
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

function options(
  extra: Partial<Connection>,
  fetch: typeof globalThis.fetch,
  more: Partial<ConnectionTestOptions> = {},
): ConnectionTestOptions {
  return {
    connectionId: 'prova',
    connection: connection(extra),
    secrets: { env: { CHIAVE: SECRET } },
    fetch,
    ...more,
  };
}

async function failureOf(promise: Promise<void>): Promise<ProviderError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ProviderError) return error;
  }
  throw new Error('la prova doveva fallire con un ProviderError');
}

describe('prova di connessione: Anthropic', () => {
  it("legge l'elenco dei modelli con la chiave e la versione che usa anche per generare", async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({ data: [] }));

    await testConnection(options({}, fetch));

    expect(calls).toEqual([
      {
        url: 'https://api.anthropic.com/v1/models?limit=1',
        headers: { 'x-api-key': SECRET, 'anthropic-version': '2023-06-01' },
      },
    ]);
  });

  it('con un gateway usa il suo indirizzo, anche con la barra finale', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    await testConnection(options({ base_url: 'https://gateway.example/v1/' }, fetch));

    expect(calls[0]?.url).toBe('https://gateway.example/v1/models?limit=1');
  });

  it('una chiave rifiutata dà provider_auth_failed, e la chiave non esce nel messaggio', async () => {
    const { fetch } = fakeFetch(() => new Response('{"error":"bad key"}', { status: 401 }));

    const error = await failureOf(testConnection(options({}, fetch)));

    expect(error).toMatchObject({ code: 'provider_auth_failed', retryable: false });
    expect(error.message).not.toContain(SECRET);
    expect(JSON.stringify(error.details)).not.toContain(SECRET);
  });

  it('senza chiave non chiama nessuno e dice secret_missing', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    const error = await failureOf(testConnection({ ...options({}, fetch), secrets: { env: {} } }));

    expect(error.code).toBe('secret_missing');
    expect(calls).toEqual([]);
  });

  it.each([
    [403, 'provider_auth_failed', false],
    [429, 'rate_limited', true],
    [404, 'config_invalid', false],
    [500, 'provider_unavailable', true],
    [503, 'provider_unavailable', true],
    [418, 'provider_unavailable', false],
  ] as const)('lo stato %i diventa %s', async (status, code, retryable) => {
    const { fetch } = fakeFetch(() => new Response('', { status }));

    const error = await failureOf(testConnection(options({}, fetch)));

    expect(error).toMatchObject({ code, retryable });
  });

  it('un servizio irraggiungibile è provider_unavailable e riprovabile', async () => {
    const fetch = vi.fn(() =>
      Promise.reject(new TypeError('fetch failed')),
    ) as unknown as typeof globalThis.fetch;

    expect(await failureOf(testConnection(options({}, fetch)))).toMatchObject({
      code: 'provider_unavailable',
      retryable: true,
    });
  });

  it('un servizio che non risponde in tempo è timeout', async () => {
    const fetch = vi.fn(() =>
      Promise.reject(new DOMException('The operation timed out.', 'TimeoutError')),
    ) as unknown as typeof globalThis.fetch;

    expect(await failureOf(testConnection(options({}, fetch)))).toMatchObject({
      code: 'timeout',
      retryable: true,
    });
  });
});

describe('prova di connessione: compatibile con OpenAI', () => {
  it('chiama {base_url}/models con la chiave come Bearer', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({ data: [] }));

    await testConnection(
      options({ adapter: 'openai_compatible', base_url: 'https://gateway.example/api/v1' }, fetch),
    );

    expect(calls).toEqual([
      {
        url: 'https://gateway.example/api/v1/models',
        headers: { Authorization: `Bearer ${SECRET}` },
      },
    ]);
  });

  it('un modello sul proprio computer (`none`) non manda nessuna chiave', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    await testConnection(
      options(
        { adapter: 'openai_compatible', base_url: 'http://localhost:11434/v1', api_key: 'none' },
        fetch,
      ),
    );

    expect(calls[0]?.headers).toEqual({});
  });

  it('una chiave facoltativa assente non blocca la prova', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    await testConnection({
      ...options(
        { adapter: 'openai_compatible', base_url: 'https://x.example/v1', api_key: 'env:ALTRA?' },
        fetch,
      ),
      secrets: { env: {} },
    });

    expect(calls[0]?.headers).toEqual({});
  });

  it('senza base_url dice quale campo manca', async () => {
    const { fetch } = fakeFetch(() => Response.json({}));

    const error = await failureOf(testConnection(options({ adapter: 'openai_compatible' }, fetch)));

    expect(error).toMatchObject({ code: 'config_invalid', details: { field: 'base_url' } });
  });
});

describe('prova di connessione: fal', () => {
  it('chiede il prezzo di un servizio con la chiave nel formato di fal', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({ prices: [] }));

    await testConnection(
      options({ adapter: 'fal' }, fetch, { sampleProviderModel: 'fal-ai/kling-video/o3/standard' }),
    );

    expect(calls).toEqual([
      {
        url: 'https://api.fal.ai/v1/models/pricing?endpoint_id=fal-ai%2Fkling-video%2Fo3%2Fstandard',
        headers: { Authorization: `Key ${SECRET}` },
      },
    ]);
  });

  it('una chiave rifiutata dà provider_auth_failed', async () => {
    const { fetch } = fakeFetch(() => new Response('', { status: 401 }));

    const error = await failureOf(
      testConnection(options({ adapter: 'fal' }, fetch, { sampleProviderModel: 'fal-ai/x' })),
    );

    expect(error.code).toBe('provider_auth_failed');
    expect(error.message).not.toContain(SECRET);
  });

  it('senza un servizio con cui provarla lo dice, senza chiamare nessuno', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    const error = await failureOf(testConnection(options({ adapter: 'fal' }, fetch)));

    expect(error.code).toBe('config_invalid');
    expect(calls).toEqual([]);
  });
});

describe('prova di connessione: altri adapter', () => {
  it('il fornitore finto risponde sempre, senza rete e senza chiave', async () => {
    const { fetch, calls } = fakeFetch(() => Response.json({}));

    await testConnection({
      ...options({ adapter: 'fake', api_key: 'none' }, fetch),
      secrets: { env: {} },
    });

    expect(calls).toEqual([]);
  });

  it('un adapter che non esiste lo dice', async () => {
    const { fetch } = fakeFetch(() => Response.json({}));

    const error = await failureOf(testConnection(options({ adapter: 'elevenlabs' }, fetch)));

    expect(error.code).toBe('config_invalid');
  });
});
