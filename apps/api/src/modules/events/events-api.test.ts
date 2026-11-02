import { domainEventSchema, type JobChangedEvent } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';

/**
 * Il flusso degli eventi (T4.4), col server vero, la coda dei lavori e il fornitore finto: mentre un
 * take video si gira, chi è collegato a `/api/events` riceve le notifiche, senza dover chiedere.
 */
let app: NestExpressApplication;
let client: Client;
let baseUrl: string;

beforeAll(async () => {
  ({ app, client } = await startApp());
  baseUrl = await app.getUrl();
}, 30_000);

afterAll(async () => {
  await app.close();
});

/** Un ascoltatore del flusso: raccoglie gli eventi che arrivano e si ferma quando glielo si dice. */
async function listen() {
  const controller = new AbortController();
  const response = await fetch(`${baseUrl}/api/events`, { signal: controller.signal });
  const events: JobChangedEvent[] = [];
  const reader = response.body?.getReader();
  if (reader === undefined) throw new Error('il flusso non ha un corpo');

  const done = (async () => {
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const chunk = await reader.read().catch(() => ({ done: true, value: undefined }));
      if (chunk.done) return;
      buffer += decoder.decode(chunk.value, { stream: true });
      for (let split = buffer.indexOf('\n\n'); split >= 0; split = buffer.indexOf('\n\n')) {
        const block = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);
        const data = block
          .split('\n')
          .filter((line) => line.startsWith('data: '))
          .map((line) => line.slice('data: '.length))
          .join('');
        if (data === '' || block.includes('event: ping')) continue;
        const parsed = domainEventSchema.parse(JSON.parse(data));
        if (parsed.type === 'job.changed') events.push(parsed);
      }
    }
  })();

  return {
    response,
    events,
    stop: async () => {
      controller.abort();
      await done;
    },
  };
}

async function until(condition: () => boolean, what: string): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`non è arrivato in tempo: ${what}`);
}

describe('GET /api/events', () => {
  it('è un flusso di eventi, e chi lo apre lo vede aperto', async () => {
    const stream = await listen();

    expect(stream.response.status).toBe(200);
    expect(stream.response.headers.get('content-type')).toContain('text/event-stream');
    await stream.stop();
  });

  it('mentre il video si gira arrivano «in lavorazione» e «finito», con il film e l’inquadratura', async () => {
    const film = await filmWithShot(client);
    const stream = await listen();

    const started = await client.call('POST', `${film.shots}/${film.shot.id}/takes`, {});
    expect(started.status).toBe(201);
    await until(
      () =>
        stream.events.some((event) => event.kind === 'take_generate' && event.status === 'done'),
      'il take finito',
    );
    await stream.stop();

    const take = stream.events.filter((event) => event.kind === 'take_generate');
    expect(take.map((event) => event.status)).toEqual(['running', 'done']);
    expect(take.every((event) => event.projectId === film.film.id)).toBe(true);
    expect(take.every((event) => event.subjectId === film.shot.id)).toBe(true);
  }, 30_000);

  it('un secondo ascoltatore riceve gli stessi eventi, e chi si è scollegato non riceve più niente', async () => {
    const film = await filmWithShot(client);
    const first = await listen();
    const second = await listen();
    await first.stop();

    await client.call('POST', `${film.shots}/${film.shot.id}/storyboard`, {});
    await until(
      () =>
        second.events.some(
          (event) => event.kind === 'storyboard_images' && event.status === 'done',
        ),
      'lo storyboard finito',
    );
    await second.stop();

    expect(first.events.filter((event) => event.kind === 'storyboard_images')).toEqual([]);
    expect(second.events.map((event) => event.status)).toContain('running');
  }, 30_000);
});
