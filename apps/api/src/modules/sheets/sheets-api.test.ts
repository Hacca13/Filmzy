import {
  castSchema,
  castSuggestionsSchema,
  characterSchema,
  characterSheetSchema,
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  sheetOptionsSchema,
  type CharacterSheet,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro della scheda di un personaggio (T3.6), col server vero, la coda dei lavori e il fornitore
 * finto: si creano le tre immagini, si aprono, si blocca il volto. Nessuna spesa vera.
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

async function newCharacter() {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  const film = projectSchema.parse(
    (
      await client.call('POST', '/projects', {
        idea: 'Una bobina dimenticata sull’ultimo treno della sera.',
        genre: options.defaults.genre,
        tone: options.defaults.tone,
        style: options.defaults.style,
        cinematography: options.defaults.cinematography,
        durationS: 60,
      })
    ).body,
  );
  const suggestion = castSuggestionsSchema.parse(
    (await client.call('POST', `/projects/${film.id}/cast/suggestions`, { count: 1 })).body,
  ).suggestions[0];
  const character = characterSchema.parse(
    (await client.call('POST', `/projects/${film.id}/cast/characters`, { suggestion })).body,
  );
  return { film, character, base: `/projects/${film.id}/cast/characters/${character.id}/sheet` };
}

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

/** Aspetta che il lavoro in coda finisca le immagini del primo tentativo (o che falliscano). */
async function untilDone(path: string): Promise<CharacterSheet> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const sheet = characterSheetSchema.parse((await client.call('GET', path)).body);
    const images = sheet.attempts[0]?.images ?? [];
    if (
      images.length > 0 &&
      images.every((image) => !['queued', 'running'].includes(image.status))
    ) {
      return sheet;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('la scheda non è arrivata in tempo');
}

describe('la scheda di un personaggio', () => {
  it('all’inizio è vuota, e le opzioni dicono il costo dell’intera scheda', async () => {
    const { base } = await newCharacter();

    const sheet = characterSheetSchema.parse((await client.call('GET', base)).body);
    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${base}/options`)).body,
    );

    expect(sheet.attempts).toEqual([]);
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.label !== '' && option.estimatedCostUsd >= 0)).toBe(
      true,
    );
  });

  it('crea le tre immagini in coda, le salva nella cartella del film e le serve', async () => {
    const { base } = await newCharacter();

    const started = await client.call('POST', base, {});
    expect(started.status).toBe(201);
    const first = characterSheetSchema.parse(started.body);
    expect(first.attempts[0]?.images.map((image) => image.angle)).toEqual([
      'front',
      'profile',
      'three_quarter',
    ]);

    const done = await untilDone(base);
    const images = done.attempts[0]?.images ?? [];
    expect(images.every((image) => image.status === 'succeeded')).toBe(true);

    const assetId = images[0]?.assetId ?? '';
    const file = await fetch(`${baseUrl}/api/assets/${assetId}`);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('image/png');
    expect((await file.arrayBuffer()).byteLength).toBeGreaterThan(0);
  }, 20_000);

  it('un secondo tentativo mentre il primo lavora si rifiuta', async () => {
    const { base } = await newCharacter();
    await client.call('POST', base, {});

    const second = failure(await client.call('POST', base, {}));

    expect(second).toMatchObject({ status: 409, details: { field: 'sheet' } });
    await untilDone(base);
  }, 20_000);

  it('si blocca il volto su un tentativo pronto: il personaggio ha tre immagini di riferimento', async () => {
    const { film, character, base } = await newCharacter();
    await client.call('POST', base, {});
    await untilDone(base);

    const locked = await client.call('PUT', `${base}/lock`, { attempt: 1 });
    expect(characterSheetSchema.parse(locked.body).lockedAttempt).toBe(1);

    const cast = castSchema.parse((await client.call('GET', `/projects/${film.id}/cast`)).body);
    const found = cast.characters.find((candidate) => candidate.id === character.id);
    expect(found?.sheet).toHaveLength(3);

    const unlocked = await client.call('DELETE', `${base}/lock`);
    expect(characterSheetSchema.parse(unlocked.body).lockedAttempt).toBeUndefined();
    const after = castSchema.parse((await client.call('GET', `/projects/${film.id}/cast`)).body);
    expect(after.characters.find((candidate) => candidate.id === character.id)?.sheet).toEqual([]);
  }, 20_000);

  it('non si blocca un tentativo che non c’è', async () => {
    const { base } = await newCharacter();

    const reply = failure(await client.call('PUT', `${base}/lock`, { attempt: 7 }));

    expect(reply).toMatchObject({ status: 409, details: { field: 'attempt' } });
  });

  it('un servizio che non è fra quelli adatti non si usa: nessuno scambio in silenzio', async () => {
    const { base } = await newCharacter();

    const reply = failure(await client.call('POST', base, { modelId: 'inventato' }));

    expect(reply).toMatchObject({ status: 409, code: 'no_eligible_model' });
    expect(characterSheetSchema.parse((await client.call('GET', base)).body).attempts).toEqual([]);
  });

  it('un personaggio di un altro film, o che non c’è, dà «non trovato»', async () => {
    const { film } = await newCharacter();

    const reply = await client.call('GET', `/projects/${film.id}/cast/characters/non-c-e/sheet`);

    expect(reply.status).toBe(404);
  });

  it('togliere il personaggio toglie la sua scheda', async () => {
    const { film, character, base } = await newCharacter();
    await client.call('POST', base, {});
    await untilDone(base);

    await client.call('DELETE', `/projects/${film.id}/cast/characters/${character.id}`);

    expect((await client.call('GET', base)).status).toBe(404);
  }, 20_000);
});

describe('i file dei film', () => {
  it('un id che non è un checksum, o che non c’è, dà «non trovato»', async () => {
    for (const id of ['non-un-checksum', '0'.repeat(64), '..%2F..%2Ffilmzy.db']) {
      const reply = await fetch(`${baseUrl}/api/assets/${id}`);

      expect(reply.status).toBe(404);
    }
  });
});
