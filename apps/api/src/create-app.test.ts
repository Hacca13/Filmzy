import { request } from 'node:http';

import { healthResponseSchema, LOCAL_API_HOST } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './create-app.js';

interface RawResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

/**
 * Fa una GET scegliendo l'header Host. `fetch` non lo permette, e per provare il rifiuto
 * di un Host non locale serve poterlo falsificare come farebbe un attaccante.
 */
function getWithHost(url: string, hostHeader: string): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers: { host: hostHeader } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => (body += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode ?? 0, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('server locale', () => {
  let app: NestExpressApplication;
  let baseUrl: string;

  beforeAll(async () => {
    app = await createApp({ logger: false });
    await app.listen(0, LOCAL_API_HOST); // porta 0: il sistema ne sceglie una libera
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('risponde su /api/health con uno stato valido', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.status).toBe(200);
    expect(healthResponseSchema.parse(await response.json())).toEqual({ status: 'ok' });
  });

  it('accetta le richieste con Host locale', async () => {
    const response = await getWithHost(`${baseUrl}/api/health`, 'localhost:5173');

    expect(response.status).toBe(200);
  });

  it('rifiuta le richieste con un Host che non è questo computer', async () => {
    const response = await getWithHost(`${baseUrl}/api/health`, 'evil.example');

    expect(response.status).toBe(403);
    expect(JSON.parse(response.body)).toEqual({ code: 'forbidden_host' });
  });

  it('non dichiara il framework nelle intestazioni', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.headers.get('x-powered-by')).toBeNull();
  });
});
