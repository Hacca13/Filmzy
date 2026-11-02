import {
  domainErrorSchema,
  draftReviewSchema,
  locationsSchema,
  projectOptionsSchema,
  projectSchema,
  screenplayEstimateSchema,
  screenplayVersionSchema,
  screenplayVersionsSchema,
  type DraftReview,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro del riepilogo e della stesura ufficiale (T3.8), col server vero e il fornitore finto:
 * si scrive la bozza, si guardano le differenze, si scrive la stesura e la si corregge a mano.
 * Nessuna spesa vera.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
}, 30_000);

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
  expect(reply.status).toBe(201);
  return projectSchema.parse(reply.body);
}

async function filmWithDraft() {
  const film = await newFilm();
  expect((await client.call('POST', `/projects/${film.id}/screenplay/draft`, {})).status).toBe(201);
  return film;
}

const review = async (filmId: string): Promise<DraftReview> =>
  draftReviewSchema.parse((await client.call('GET', `/projects/${filmId}/review`)).body);

/** «Adatta la storia» a tutto ciò su cui l'utente deve decidere. */
const adaptEverything = (differences: DraftReview['differences']) =>
  differences
    .filter((difference) => difference.choices.length > 0)
    .map((difference) => ({ key: difference.key, decision: 'adapt' as const }));

async function filmWithFinal() {
  const film = await filmWithDraft();
  const { differences } = await review(film.id);
  const written = await client.call('POST', `/projects/${film.id}/screenplay/final`, {
    answers: adaptEverything(differences),
  });
  expect(written.status).toBe(201);
  return { film, version: screenplayVersionSchema.parse(written.body) };
}

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

describe('il riepilogo', () => {
  it('senza bozza non c’è niente da confrontare', async () => {
    const film = await newFilm();

    expect(failure(await client.call('GET', `/projects/${film.id}/review`))).toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('dopo la bozza ogni personaggio e luogo proposto, non ancora scelto, è una differenza su cui decidere', async () => {
    const film = await filmWithDraft();
    const { differences } = await review(film.id);

    expect(differences.length).toBeGreaterThan(0);
    for (const difference of differences) {
      expect(difference).toMatchObject({ reason: 'not_chosen', choices: ['adapt', 'keep'] });
    }
  });

  it('aggiungere un luogo proposto lo toglie dalle differenze', async () => {
    const film = await filmWithDraft();
    const before = await review(film.id);
    const { proposals } = locationsSchema.parse(
      (await client.call('GET', `/projects/${film.id}/locations`)).body,
    );
    const proposal = proposals[0];
    if (proposal === undefined) throw new Error('la bozza finta doveva proporre un luogo');
    await client.call('POST', `/projects/${film.id}/locations`, { proposalId: proposal.id });

    const after = await review(film.id);
    expect(after.differences.map((d) => d.key)).not.toContain(`location:not_chosen:${proposal.id}`);
    expect(after.differences.length).toBe(before.differences.length - 1);
  });
});

describe('la stesura ufficiale', () => {
  it('senza le risposte alle differenze non si scrive', async () => {
    const film = await filmWithDraft();

    expect(
      failure(await client.call('POST', `/projects/${film.id}/screenplay/final`, { answers: [] })),
    ).toMatchObject({ status: 409, code: 'invalid_request', details: { field: 'answers' } });
  });

  it('la stima si legge prima di scrivere', async () => {
    const film = await filmWithDraft();

    const reply = await client.call('POST', `/projects/${film.id}/screenplay/final/estimate`, {});
    expect(reply.status).toBe(201);
    expect(screenplayEstimateSchema.parse(reply.body).estimate.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('scritta la stesura, è la versione 1 della tappa «final» e il film passa alla fase finale', async () => {
    const { film, version } = await filmWithFinal();

    expect(version).toMatchObject({ stage: 'final', version: 1 });
    expect(version.screenplay.characters).toEqual([]);
    expect(version.screenplay.locations).toEqual([]);
    expect(projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body).phase).toBe(
      'final',
    );

    const latest = screenplayVersionSchema.parse(
      (await client.call('GET', `/projects/${film.id}/screenplay/final`)).body,
    );
    expect(latest.id).toBe(version.id);
    expect(
      screenplayVersionsSchema.parse(
        (await client.call('GET', `/projects/${film.id}/screenplay/final/versions`)).body,
      ).versions,
    ).toHaveLength(1);
  });

  it('la bozza resta com’era, e una versione della stesura non si legge dalla bozza', async () => {
    const { film, version } = await filmWithFinal();

    const draft = screenplayVersionSchema.parse(
      (await client.call('GET', `/projects/${film.id}/screenplay`)).body,
    );
    expect(draft.stage).toBe('draft');
    expect(
      failure(await client.call('GET', `/projects/${film.id}/screenplay/versions/${version.id}`)),
    ).toMatchObject({ status: 404, code: 'not_found' });
    expect(
      (await client.call('GET', `/projects/${film.id}/screenplay/final/versions/${version.id}`))
        .status,
    ).toBe(200);
  });

  it('prima di scriverla la stesura non c’è', async () => {
    const film = await filmWithDraft();

    expect(
      failure(await client.call('GET', `/projects/${film.id}/screenplay/final`)),
    ).toMatchObject({ status: 404, code: 'not_found' });
  });
});

describe('la stesura corretta a mano', () => {
  it('ogni correzione è una versione nuova e la precedente resta da rileggere', async () => {
    const { film, version } = await filmWithFinal();
    const path = `/projects/${film.id}/screenplay/final`;

    const reply = await client.call('PUT', path, {
      screenplay: { ...version.screenplay, title: 'La corsa di notte' },
    });
    expect(reply.status).toBe(200);
    const edited = screenplayVersionSchema.parse(reply.body);
    expect(edited).toMatchObject({ stage: 'final', version: 2 });
    expect(edited.screenplay.title).toBe('La corsa di notte');

    const versions = screenplayVersionsSchema.parse(
      (await client.call('GET', `${path}/versions`)).body,
    ).versions;
    expect(versions.map((v) => v.version)).toEqual([2, 1]);
    const first = screenplayVersionSchema.parse(
      (await client.call('GET', `${path}/versions/${version.id}`)).body,
    );
    expect(first.screenplay.title).toBe(version.screenplay.title);
  });

  it('se non cambia niente non nasce una versione uguale', async () => {
    const { film, version } = await filmWithFinal();
    const path = `/projects/${film.id}/screenplay/final`;

    const reply = await client.call('PUT', path, { screenplay: version.screenplay });
    expect(screenplayVersionSchema.parse(reply.body).id).toBe(version.id);
    expect(
      screenplayVersionsSchema.parse((await client.call('GET', `${path}/versions`)).body).versions,
    ).toHaveLength(1);
  });

  it('una scena che cita un personaggio che il film non ha è rifiutata', async () => {
    const { film, version } = await filmWithFinal();
    const scenes = version.screenplay.scenes.map((scene) => ({
      ...scene,
      characterIds: ['fantasma'],
    }));

    expect(
      failure(
        await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
          screenplay: { ...version.screenplay, scenes },
        }),
      ),
    ).toMatchObject({
      status: 400,
      code: 'invalid_request',
      details: { field: 'screenplay.scenes' },
    });
  });

  it('senza una stesura da correggere dà «non trovato», e un corpo sbagliato dà «richiesta non valida»', async () => {
    const film = await filmWithDraft();
    const { version } = await filmWithFinal();

    expect(
      failure(
        await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
          screenplay: version.screenplay,
        }),
      ),
    ).toMatchObject({ status: 404, code: 'not_found' });
    expect(
      failure(
        await client.call('PUT', `/projects/${film.id}/screenplay/final`, { screenplay: {} }),
      ),
    ).toMatchObject({ status: 400, code: 'invalid_request' });
  });
});
