import { request } from 'node:http';

import { healthResponseSchema, LOCAL_API_HOST } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './create-app.js';

interface RawResponse {
  status: number;
  body: string;
}

/**
 * Fa una richiesta scegliendo metodo e intestazioni, Host compreso. `fetch` non permette di
 * falsificare Host né Origin, e per provare i rifiuti serve farlo come farebbe un attaccante.
 */
function send(url: string, method: string, headers: Record<string, string>): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = request(url, { method, headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => (body += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode ?? 0, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('server locale', () => {
  let app: NestExpressApplication;
  let healthUrl: string;

  beforeAll(async () => {
    app = await createApp({ logger: false });
    await app.listen(0, LOCAL_API_HOST); // porta 0: il sistema ne sceglie una libera
    healthUrl = `${await app.getUrl()}/api/health`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('risponde su /api/health con uno stato valido', async () => {
    const response = await fetch(healthUrl);

    expect(response.status).toBe(200);
    expect(healthResponseSchema.parse(await response.json())).toEqual({ status: 'ok' });
  });

  it('non dichiara il framework nelle intestazioni', async () => {
    const response = await fetch(healthUrl);

    expect(response.headers.get('x-powered-by')).toBeNull();
  });

  describe('difesa dal DNS rebinding (header Host)', () => {
    it('accetta una richiesta con Host locale', async () => {
      expect((await send(healthUrl, 'GET', { host: 'localhost:5173' })).status).toBe(200);
    });

    it('rifiuta una richiesta con un Host che non è questo computer', async () => {
      const response = await send(healthUrl, 'GET', { host: 'evil.example' });

      expect(response.status).toBe(403);
      expect(JSON.parse(response.body)).toEqual({ code: 'forbidden_host' });
    });
  });

  describe('difesa dalle richieste di altri siti (header Origin)', () => {
    it('rifiuta una richiesta che modifica dati e viene da un altro sito', async () => {
      const response = await send(healthUrl, 'POST', { origin: 'https://evil.example' });

      expect(response.status).toBe(403);
      expect(JSON.parse(response.body)).toEqual({ code: 'forbidden_origin' });
    });

    it('lascia passare la stessa richiesta se arriva da una pagina locale', async () => {
      // Non c'è una rotta POST: 404 significa che il controllo ha lasciato passare la richiesta.
      const response = await send(healthUrl, 'POST', { origin: 'http://localhost:5173' });

      expect(response.status).toBe(404);
    });

    it('non blocca le letture (GET) con un Origin straniero', async () => {
      const response = await send(healthUrl, 'GET', { origin: 'https://evil.example' });

      expect(response.status).toBe(200);
    });
  });
});
