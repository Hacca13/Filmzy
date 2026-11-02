import {
  domainErrorSchema,
  draftReviewSchema,
  locationSchema,
  locationsSchema,
  planSceneEstimateSchema,
  projectOptionsSchema,
  projectSchema,
  scenePlanSchema,
  screenplayVersionSchema,
  shotPlansSchema,
  shotSpecSchema,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro delle inquadrature (T3.9), col server vero e il fornitore finto: dalla stesura finale
 * l'aiuto regista pensa le inquadrature di una scena, si cambia un movimento di macchina, e una
 * correzione della stesura segna il piano da rifare. Nessuna spesa vera.
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

/** Un film con la stesura finale scritta; `withLocation` aggiunge il primo luogo proposto. */
async function filmWithFinal({ withLocation }: { withLocation: boolean }) {
  const film = await newFilm();
  await client.call('POST', `/projects/${film.id}/screenplay/draft`, {});
  let locationId: string | undefined;
  if (withLocation) {
    const { proposals } = locationsSchema.parse(
      (await client.call('GET', `/projects/${film.id}/locations`)).body,
    );
    const proposal = proposals[0];
    if (proposal === undefined) throw new Error('la bozza finta doveva proporre un luogo');
    const added = await client.call('POST', `/projects/${film.id}/locations`, {
      proposalId: proposal.id,
    });
    locationId = locationSchema.parse(added.body).id;
  }
  const { differences } = draftReviewSchema.parse(
    (await client.call('GET', `/projects/${film.id}/review`)).body,
  );
  const written = await client.call('POST', `/projects/${film.id}/screenplay/final`, {
    answers: differences
      .filter((difference) => difference.choices.length > 0)
      .map((difference) => ({ key: difference.key, decision: 'adapt' })),
  });
  expect(written.status).toBe(201);
  return { film, locationId, final: screenplayVersionSchema.parse(written.body) };
}

const base = (filmId: string) => `/projects/${filmId}/shots`;

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

describe('le inquadrature di un film', () => {
  it('senza la stesura finale non ci sono scene da dividere', async () => {
    const film = await newFilm();

    expect(failure(await client.call('GET', base(film.id)))).toMatchObject({
      status: 404,
      code: 'not_found',
      details: { field: 'final' },
    });
  });

  it('con la stesura le scene ci sono, non ancora pensate, e i movimenti da scegliere sono quelli attivi', async () => {
    const { film, final } = await filmWithFinal({ withLocation: true });

    const plans = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(plans.finalVersionId).toBe(final.id);
    expect(plans.scenes.length).toBe(final.screenplay.scenes.length);
    expect(plans.scenes.every((scene) => !scene.planned && !scene.stale)).toBe(true);
    expect(plans.cameraMovements.length).toBeGreaterThan(0);
  });

  it('pensare una scena dà inquadrature coerenti col film, con stati di continuità e un movimento valido', async () => {
    const { film, locationId } = await filmWithFinal({ withLocation: true });
    const { cameraMovements } = shotPlansSchema.parse(
      (await client.call('GET', base(film.id))).body,
    );

    const reply = await client.call('POST', base(film.id), { sceneNumber: 1 });
    expect(reply.status).toBe(201);
    const plan = scenePlanSchema.parse(reply.body);

    expect(plan).toMatchObject({ sceneNumber: 1, planned: true, stale: false });
    expect(plan.shots.length).toBeGreaterThan(0);
    for (const [index, shot] of plan.shots.entries()) {
      expect(shot.order).toBe(index);
      expect(cameraMovements.map((m) => m.id)).toContain(shot.intent.cameraMovement);
      // Il fornitore finto cita il luogo dell'esempio: il server lo riporta a quello del film.
      expect(shot.location.locationId).toBe(locationId);
      expect(shot.continuity.entry.locationId).toBe(locationId);
      expect(shot.continuity.exit.locationId).toBe(locationId);
    }

    const reread = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(reread.scenes[0]).toEqual(plan);
    expect(projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body).phase).toBe(
      'shots',
    );
  });

  it('la stima si legge prima', async () => {
    const { film } = await filmWithFinal({ withLocation: true });

    const reply = await client.call('POST', `${base(film.id)}/estimate`, { sceneNumber: 1 });
    expect(reply.status).toBe(201);
    expect(planSceneEstimateSchema.parse(reply.body).estimate.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('rifare una scena cambia le sue inquadrature', async () => {
    const { film } = await filmWithFinal({ withLocation: true });
    const first = scenePlanSchema.parse(
      (await client.call('POST', base(film.id), { sceneNumber: 1 })).body,
    );
    const second = scenePlanSchema.parse(
      (await client.call('POST', base(film.id), { sceneNumber: 1 })).body,
    );

    expect(second.shots.map((s) => s.id)).not.toEqual(first.shots.map((s) => s.id));
    const plans = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(plans.scenes[0]?.shots.map((s) => s.id)).toEqual(second.shots.map((s) => s.id));
  });

  it('senza luoghi nel film si chiede di aggiungerne uno, e una scena che non c’è dà «non trovato»', async () => {
    const { film } = await filmWithFinal({ withLocation: false });

    expect(failure(await client.call('POST', base(film.id), { sceneNumber: 1 }))).toMatchObject({
      status: 409,
      code: 'invalid_request',
      details: { field: 'locations' },
    });
    expect(failure(await client.call('POST', base(film.id), { sceneNumber: 99 }))).toMatchObject({
      status: 404,
      code: 'not_found',
      details: { field: 'sceneNumber' },
    });
    expect(failure(await client.call('POST', base(film.id), { sceneNumber: 0 }))).toMatchObject({
      status: 400,
      code: 'invalid_request',
    });
  });
});

describe('il movimento di macchina', () => {
  async function plannedShot() {
    const { film, final } = await filmWithFinal({ withLocation: true });
    const plan = scenePlanSchema.parse(
      (await client.call('POST', base(film.id), { sceneNumber: 1 })).body,
    );
    const shot = plan.shots[0];
    if (shot === undefined) throw new Error('doveva esserci un’inquadratura');
    const { cameraMovements } = shotPlansSchema.parse(
      (await client.call('GET', base(film.id))).body,
    );
    return { film, final, shot, cameraMovements };
  }

  it('si cambia scegliendolo dalla lista e resta cambiato', async () => {
    const { film, shot, cameraMovements } = await plannedShot();
    const other = cameraMovements.find((m) => m.id !== shot.intent.cameraMovement);
    if (other === undefined) throw new Error('servono almeno due movimenti attivi');

    const reply = await client.call('PATCH', `${base(film.id)}/${shot.id}`, {
      cameraMovement: other.id,
    });
    expect(reply.status).toBe(200);
    expect(shotSpecSchema.parse(reply.body).intent.cameraMovement).toBe(other.id);

    const plans = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(plans.scenes[0]?.shots[0]?.intent.cameraMovement).toBe(other.id);
  });

  it('un movimento inventato, un’inquadratura sconosciuta o di un altro film sono rifiutati', async () => {
    const { film, shot } = await plannedShot();
    const other = await newFilm();

    expect(
      failure(
        await client.call('PATCH', `${base(film.id)}/${shot.id}`, { cameraMovement: 'volo' }),
      ),
    ).toMatchObject({ status: 400, code: 'invalid_request', details: { field: 'cameraMovement' } });
    expect(
      failure(
        await client.call('PATCH', `${base(film.id)}/non-esiste`, { cameraMovement: 'static' }),
      ),
    ).toMatchObject({ status: 404, code: 'not_found' });
    expect(
      failure(
        await client.call('PATCH', `${base(other.id)}/${shot.id}`, { cameraMovement: 'static' }),
      ),
    ).toMatchObject({ status: 404, code: 'not_found' });
  });
});

describe('quando la stesura cambia', () => {
  it('la correzione del testo di una scena segna il suo piano da rifare, e rifarlo lo ripulisce', async () => {
    const { film, final } = await filmWithFinal({ withLocation: true });
    await client.call('POST', base(film.id), { sceneNumber: 1 });

    const scenes = final.screenplay.scenes.map((scene) =>
      scene.number === 1 ? { ...scene, summary: 'Una scena riscritta a mano.' } : scene,
    );
    const edited = await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
      screenplay: { ...final.screenplay, scenes },
    });
    expect(edited.status).toBe(200);

    const stale = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(stale.scenes[0]).toMatchObject({ planned: true, stale: true });
    expect(stale.scenes[0]?.shots.length).toBeGreaterThan(0);

    await client.call('POST', base(film.id), { sceneNumber: 1 });
    const fresh = shotPlansSchema.parse((await client.call('GET', base(film.id))).body);
    expect(fresh.scenes[0]).toMatchObject({ planned: true, stale: false });
  });
});
