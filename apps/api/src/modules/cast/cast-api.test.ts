import {
  castEstimateSchema,
  castSchema,
  castSuggestionsSchema,
  characterSchema,
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro del cast (T3.5), col server vero e il fornitore finto: si chiedono le proposte, si
 * aggiungono, si rivedono, si toglie, e il massimo del seme (due personaggi) tiene. Nessuna spesa vera.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
});

afterAll(async () => {
  await app.close();
});

async function newFilm() {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  const reply = await client.call('POST', '/projects', {
    idea: 'Una bobina dimenticata sull’ultimo treno della sera.',
    genre: options.defaults.genre,
    tone: options.defaults.tone,
    style: options.defaults.style,
    cinematography: options.defaults.cinematography,
    durationS: 60,
  });
  return projectSchema.parse(reply.body);
}

const base = (filmId: string) => `/projects/${filmId}/cast`;

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

async function firstSuggestion(filmId: string) {
  const reply = await client.call('POST', `${base(filmId)}/suggestions`, { count: 1 });
  expect(reply.status).toBe(201);
  const suggestion = castSuggestionsSchema.parse(reply.body).suggestions[0];
  if (suggestion === undefined) throw new Error('il casting finto doveva proporre qualcuno');
  return suggestion;
}

describe('il cast del film', () => {
  it('all’inizio è vuoto, col massimo del seme e i ruoli attivi tra cui scegliere', async () => {
    const film = await newFilm();

    const cast = castSchema.parse((await client.call('GET', base(film.id))).body);

    expect(cast.characters).toEqual([]);
    expect(cast.maxCharacters).toBe(2);
    expect(cast.tags.map((tag) => tag.id)).toContain('protagonist');
  });

  it('la stima dice quanto costerebbe, senza proporre né salvare niente', async () => {
    const film = await newFilm();

    const reply = await client.call('POST', `${base(film.id)}/estimate`, { count: 2 });

    expect(castEstimateSchema.parse(reply.body).estimate.modelLabel).not.toBe('');
    expect(castSchema.parse((await client.call('GET', base(film.id))).body).characters).toEqual([]);
  });

  it('le proposte si aggiungono: il personaggio entra nel cast e il film passa ai personaggi', async () => {
    const film = await newFilm();
    const suggestion = await firstSuggestion(film.id);

    const added = await client.call('POST', `${base(film.id)}/characters`, { suggestion });
    const character = characterSchema.parse(added.body);

    expect(added.status).toBe(201);
    expect(character).toMatchObject({ name: suggestion.name, tag: suggestion.tag, sheet: [] });
    const cast = castSchema.parse((await client.call('GET', base(film.id))).body);
    expect(cast.characters.map((c) => c.id)).toEqual([character.id]);
    const reread = projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body);
    expect(reread.phase).toBe('cast');
  });

  it('il massimo tiene: oltre due personaggi si rifiuta, e non si chiedono più proposte dei posti liberi', async () => {
    const film = await newFilm();
    const suggestion = await firstSuggestion(film.id);
    const add = (name: string) =>
      client.call('POST', `${base(film.id)}/characters`, { suggestion: { ...suggestion, name } });

    expect((await add('Anna')).status).toBe(201);
    expect((await add('Bruno')).status).toBe(201);

    expect(failure(await add('Carla'))).toMatchObject({ status: 409, details: { field: 'cast' } });
    const tooMany = await client.call('POST', `${base(film.id)}/suggestions`, { count: 1 });
    expect(failure(tooMany)).toMatchObject({ status: 400, details: { field: 'count' } });
  });

  it('si rivede il ruolo, e si toglie: il posto torna libero', async () => {
    const film = await newFilm();
    const suggestion = await firstSuggestion(film.id);
    const character = characterSchema.parse(
      (await client.call('POST', `${base(film.id)}/characters`, { suggestion })).body,
    );

    const changed = await client.call('PATCH', `${base(film.id)}/characters/${character.id}`, {
      tag: 'protagonist',
    });
    expect(characterSchema.parse(changed.body).tag).toBe('protagonist');

    expect(
      (await client.call('DELETE', `${base(film.id)}/characters/${character.id}`)).status,
    ).toBe(204);
    const cast = castSchema.parse((await client.call('GET', base(film.id))).body);
    expect(cast.characters).toEqual([]);
  });

  it('un film che non c’è, un personaggio di un altro film e un ruolo inesistente si rifiutano', async () => {
    const film = await newFilm();
    const other = await newFilm();
    const suggestion = await firstSuggestion(film.id);
    const character = characterSchema.parse(
      (await client.call('POST', `${base(film.id)}/characters`, { suggestion })).body,
    );

    expect((await client.call('GET', '/projects/non-c-e/cast')).status).toBe(404);
    expect(
      (await client.call('PATCH', `${base(other.id)}/characters/${character.id}`, { tag: 'ally' }))
        .status,
    ).toBe(404);
    expect(
      failure(
        await client.call('PATCH', `${base(film.id)}/characters/${character.id}`, {
          tag: 'inventato',
        }),
      ),
    ).toMatchObject({ status: 400, details: { field: 'tag' } });
  });
});
