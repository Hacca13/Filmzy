import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { draftViewSchema, type DraftView } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { createApp } from '../create-app.js';
import type { SecretCipher } from '../modules/secrets/secret-cipher.js';

/** La cartella `config/` del repository: i file di seme veri. */
const CONFIG_DIR = fileURLToPath(new URL('../../../../config', import.meta.url));

/** Un cifrario finto ma reversibile: basta a provare che sul disco non resta il testo in chiaro. */
export const fakeCipher: SecretCipher = {
  isAvailable: () => true,
  encrypt: (plain) => Buffer.from(`cifrato:${Buffer.from(plain).toString('base64')}`),
  decrypt: (data) => Buffer.from(data.toString().slice('cifrato:'.length), 'base64').toString(),
};

export interface Reply {
  status: number;
  text: string;
  body: unknown;
}

export class Client {
  constructor(private readonly baseUrl: string) {}

  async call(method: string, route: string, body?: unknown): Promise<Reply> {
    const response = await fetch(`${this.baseUrl}/api${route}`, {
      method,
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
    const text = await response.text();
    return { status: response.status, text, body: text === '' ? undefined : JSON.parse(text) };
  }

  async draft(): Promise<DraftView> {
    return draftViewSchema.parse((await this.call('GET', '/troupe/draft')).body);
  }
}

/** Il server vero, con una cartella dati sua e i fornitori finti (regola d'oro 5: zero spesa). */
export async function startApp(cipher?: SecretCipher) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-impostazioni-'));
  const app: NestExpressApplication = await createApp({
    logger: false,
    dataDir,
    configDir: CONFIG_DIR,
    environment: 'offline',
    ...(cipher === undefined ? {} : { cipher }),
  });
  await app.listen(0, '127.0.0.1');
  return { app, dataDir, client: new Client(await app.getUrl()) };
}
