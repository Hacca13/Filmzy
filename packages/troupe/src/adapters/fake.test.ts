import { fileURLToPath } from 'node:url';

import { cinematographerOutputSchema, ROLE_IO, ROLE_OUTPUT_EXAMPLES } from '@filmzy/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProviderError } from '../provider-error.js';
import { FakeProvider } from './fake.js';
import type { LlmRequest, MediaRequest } from './types.js';

const FIXTURES = fileURLToPath(new URL('../../test/fixtures', import.meta.url));
const FIXTURES_ERRORI = `${FIXTURES}/errori`;

const llmRequest: LlmRequest = {
  role: 'cinematographer',
  modelId: 'claude-sonnet',
  providerModel: 'claude-sonnet-5-5',
  system: 'Sei il direttore della fotografia.',
  user: 'Inquadratura: close_up, durata 5 s',
  params: { temperature: 0.5 },
  outputSchema: ROLE_IO.cinematographer.output,
};

const videoRequest: MediaRequest = {
  role: 'camera_operator',
  modelId: 'kling-o3-standard',
  providerModel: 'fal-ai/kling-o3-standard',
  prompt: 'close up, woman smiles, golden hour light',
  params: { resolution: '720p', duration_s: 5 },
  idempotencyKey: 'shot-1:kling-o3-standard:abc123',
};

/** Nessuna rete: è il criterio di T0.6, quindi lo si verifica invece di fidarsi. */
let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  expect(fetchSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe('un ruolo LLM con il fornitore finto', () => {
  it("risponde con l'esempio del ruolo quando non c'è una fixture", async () => {
    const fake = new FakeProvider();
    const { data, usage } = await fake.generate(llmRequest);

    expect(data).toEqual(ROLE_OUTPUT_EXAMPLES.cinematographer);
    expect(usage?.inputTokens).toBeGreaterThan(0);
    expect(fake.calls).toEqual([
      {
        kind: 'llm',
        role: 'cinematographer',
        modelId: 'claude-sonnet',
        providerModel: 'claude-sonnet-5-5',
      },
    ]);
  });

  it("preferisce la fixture registrata, quando c'è", async () => {
    const fake = new FakeProvider({ fixturesDir: FIXTURES });
    const { data } = await fake.generate(llmRequest);

    expect(cinematographerOutputSchema.parse(data).prompt).toContain('town square');
  });

  it('valida la risposta con lo schema del ruolo: una fixture sbagliata non passa', async () => {
    const fake = new FakeProvider({ responses: { cinematographer: { data: { prompt: '' } } } });

    await expect(fake.generate(llmRequest)).rejects.toMatchObject({
      code: 'invalid_output',
      retryable: false,
    });
  });

  it('sa fingere un errore tecnico, con codice e retryable', async () => {
    const fake = new FakeProvider({ fixturesDir: FIXTURES_ERRORI });

    await expect(fake.generate({ ...llmRequest, role: 'moderator' })).rejects.toMatchObject({
      code: 'provider_unavailable',
      retryable: true,
    });
  });

  it("dice chiaramente quando per un ruolo non c'è nessuna risposta", async () => {
    const fake = new FakeProvider();

    await expect(
      fake.generate({ ...llmRequest, role: 'camera_operator', outputSchema: undefined }),
    ).rejects.toBeInstanceOf(ProviderError);
  });
});

describe('un ruolo video con il fornitore finto', () => {
  it('mette in coda, risponde "in lavorazione" e poi consegna il file', async () => {
    const fake = new FakeProvider();
    const { providerRequestId } = await fake.submit(videoRequest);

    expect(providerRequestId).toMatch(/^fake-/);
    expect(await fake.poll(providerRequestId)).toEqual({ state: 'running' });

    const done = await fake.poll(providerRequestId);
    if (done.state !== 'succeeded') throw new Error(`stato inatteso: ${done.state}`);
    expect(done.files[0]?.contentType).toBe('video/mp4');
    expect(done.files[0]?.bytes.byteLength).toBeGreaterThan(0);
    expect(done.usage).toEqual({ seconds: 5 });
  });

  it('usa il nome del file della fixture registrata', async () => {
    const fake = new FakeProvider({ fixturesDir: FIXTURES });
    const { providerRequestId } = await fake.submit(videoRequest);
    await fake.poll(providerRequestId);

    const done = await fake.poll(providerRequestId);
    if (done.state !== 'succeeded') throw new Error(`stato inatteso: ${done.state}`);
    expect(done.files[0]?.fileName).toBe('take-registrato.mp4');
  });

  it("un lavoro fallito è uno stato, non un'eccezione", async () => {
    const fake = new FakeProvider({ fixturesDir: FIXTURES_ERRORI });
    const { providerRequestId } = await fake.submit(videoRequest);

    expect(await fake.poll(providerRequestId)).toEqual({
      state: 'failed',
      code: 'content_rejected',
      retryable: false,
      message: 'il fornitore finto rifiuta il contenuto',
    });
  });

  it('la stessa chiave di idempotenza dà lo stesso lavoro, non un doppione (§7)', async () => {
    const fake = new FakeProvider();
    const first = await fake.submit(videoRequest);
    const second = await fake.submit(videoRequest);

    expect(second.providerRequestId).toBe(first.providerRequestId);
    // Il primo polling del primo invio ha già consumato l'attesa: il lavoro è uno solo.
    expect(await fake.poll(first.providerRequestId)).toEqual({ state: 'running' });
    expect((await fake.poll(second.providerRequestId)).state).toBe('succeeded');
  });

  it('non conosce un id che non ha mai messo in coda', async () => {
    const fake = new FakeProvider();

    await expect(fake.poll('fake-inventato')).rejects.toMatchObject({ code: 'not_found' });
  });
});
