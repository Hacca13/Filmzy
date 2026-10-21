import type { Connection } from '@filmzy/contracts';
import { ApiError } from '@fal-ai/client';
import { describe, expect, it, vi } from 'vitest';

import { falMediaAdapter, fileUrls, type FalFetch, type FalQueue } from './fal.js';
import type { AdapterOptions, MediaFile, MediaRequest } from './types.js';

const connection: Connection = {
  adapter: 'fal',
  api_key: 'env:FAL_KEY',
  delivery: 'polling',
  timeout_s: 900,
  max_concurrency: 3,
  enabled: true,
};

const options: AdapterOptions = {
  connectionId: 'fal',
  connection,
  secrets: { env: { FAL_KEY: 'chiave-di-prova' } },
};

const request: MediaRequest = {
  role: 'camera_operator',
  modelId: 'un-servizio-video',
  providerModel: 'fornitore/un-punto-di-accesso',
  prompt: 'close up, woman smiles, golden hour light',
  params: { resolution: '720p', duration_s: 5 },
  idempotencyKey: 'shot-1:abc',
  providerInput: { prompt: 'close up, woman smiles', duration: 5 },
};

/** Una coda finta: stessi passi di fal (in coda, in lavorazione, finito), zero rete. */
function queueWith(options: {
  states?: ('queued' | 'running' | 'completed')[];
  data?: unknown;
  submitError?: Error;
  statusError?: Error;
}): { queue: FalQueue; submitted: Record<string, unknown>[] } {
  const states = [...(options.states ?? ['completed'])];
  const submitted: Record<string, unknown>[] = [];

  return {
    submitted,
    queue: {
      submit: (_endpoint, input) => {
        if (options.submitError !== undefined) return Promise.reject(options.submitError);
        submitted.push(input);
        return Promise.resolve({ requestId: 'richiesta-1' });
      },
      status: () => {
        if (options.statusError !== undefined) return Promise.reject(options.statusError);
        return Promise.resolve({
          state: states.length > 1 ? (states.shift() ?? 'completed') : (states[0] ?? 'completed'),
        });
      },
      result: () =>
        Promise.resolve({ data: options.data ?? { video: { url: 'https://finto/video.mp4' } } }),
      cancel: () => Promise.resolve(),
    },
  };
}

const fetchFile: FalFetch = (url: string): Promise<MediaFile> =>
  Promise.resolve({
    fileName: url.split('/').at(-1) ?? 'file',
    contentType: 'video/mp4',
    bytes: new Uint8Array([1, 2, 3]),
  });

describe('adapter fal', () => {
  it("manda in coda il corpo costruito dal traduttore e torna l'id del lavoro", async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { queue, submitted } = queueWith({});
    const adapter = falMediaAdapter(options, queue, fetchFile);

    const { providerRequestId } = await adapter.submit(request);

    expect(providerRequestId).toBe('richiesta-1');
    expect(submitted).toEqual([{ prompt: 'close up, woman smiles', duration: 5 }]);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('senza corpo non chiama nessuno: lo costruisce il traduttore', async () => {
    const { queue } = queueWith({});
    const adapter = falMediaAdapter(options, queue, fetchFile);
    const senzaCorpo: MediaRequest = { ...request };
    delete senzaCorpo.providerInput;

    await expect(adapter.submit(senzaCorpo)).rejects.toMatchObject({ code: 'invalid_request' });
  });

  it("aspetta in coda, poi consegna il file scaricato (regola d'oro 11)", async () => {
    const { queue } = queueWith({ states: ['queued', 'running', 'completed'] });
    const adapter = falMediaAdapter(options, queue, fetchFile);
    const { providerRequestId } = await adapter.submit(request);

    expect(await adapter.poll(providerRequestId)).toEqual({ state: 'queued' });
    expect(await adapter.poll(providerRequestId)).toEqual({ state: 'running' });

    const done = await adapter.poll(providerRequestId);
    if (done.state !== 'succeeded') throw new Error(`stato inatteso: ${done.state}`);
    expect(done.files[0]?.fileName).toBe('video.mp4');
    expect(done.files[0]?.bytes.byteLength).toBe(3);
  });

  it('un lavoro finito senza file è un fallimento spiegato, non un vuoto', async () => {
    const { queue } = queueWith({ data: { note: 'niente file' } });
    const adapter = falMediaAdapter(options, queue, fetchFile);
    const { providerRequestId } = await adapter.submit(request);

    expect(await adapter.poll(providerRequestId)).toMatchObject({
      state: 'failed',
      code: 'invalid_output',
    });
  });

  it('non sa dare notizie di un lavoro che non ha mandato lui', async () => {
    const { queue } = queueWith({});
    const adapter = falMediaAdapter(options, queue, fetchFile);

    await expect(adapter.poll('mai-visto')).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('gli errori di fal diventano codici di §4.10', () => {
  function apiError(status: number): ApiError<unknown> {
    return new ApiError({ message: 'errore di fal', status, body: {} });
  }

  it.each([
    [401, 'provider_auth_failed'],
    [402, 'provider_quota_exhausted'],
    [429, 'rate_limited'],
    [500, 'provider_unavailable'],
    [422, 'invalid_request'],
  ] as const)('%i in invio diventa %s', async (status, code) => {
    const { queue } = queueWith({ submitError: apiError(status) });
    const adapter = falMediaAdapter(options, queue, fetchFile);

    await expect(adapter.submit(request)).rejects.toMatchObject({ code });
  });

  it("un errore durante il polling è uno stato fallito, non un'eccezione", async () => {
    const { queue } = queueWith({ statusError: apiError(500) });
    const adapter = falMediaAdapter(options, queue, fetchFile);
    const { providerRequestId } = await adapter.submit(request);

    expect(await adapter.poll(providerRequestId)).toMatchObject({
      state: 'failed',
      code: 'provider_unavailable',
      retryable: true,
    });
  });
});

describe('fileUrls', () => {
  it('trova i file dove ogni famiglia li mette', () => {
    expect(fileUrls({ video: { url: 'a' } })).toEqual(['a']);
    expect(fileUrls({ images: [{ url: 'a' }, { url: 'b' }] })).toEqual(['a', 'b']);
    expect(fileUrls({ audio: { file: { url: 'a' } } })).toEqual(['a']);
  });

  it('non inventa file dove non ce ne sono', () => {
    expect(fileUrls({ seed: 42, prompt: 'x' })).toEqual([]);
  });
});
