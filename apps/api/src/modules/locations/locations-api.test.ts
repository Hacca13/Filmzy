import {
  domainErrorSchema,
  locationImagesSchema,
  locationSchema,
  locationsSchema,
  projectOptionsSchema,
  projectSchema,
  sheetOptionsSchema,
  type LocationImages,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro dei luoghi (T3.7), col server vero, la coda dei lavori e il fornitore finto: la bozza
 * propone, si aggiunge un luogo, si fanno le immagini del set, se ne sceglie una. Nessuna spesa vera.
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

/** Un film con la bozza già scritta (che propone i luoghi). */
async function filmWithDraft() {
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
  await client.call('POST', `/projects/${film.id}/screenplay/draft`, {});
  return { film, base: `/projects/${film.id}/locations` };
}

async function addFirst(base: string) {
  const { proposals } = locationsSchema.parse((await client.call('GET', base)).body);
  const proposal = proposals[0];
  if (proposal === undefined) throw new Error('la bozza finta doveva proporre un luogo');
  const added = await client.call('POST', base, { proposalId: proposal.id });
  expect(added.status).toBe(201);
  return { proposal, location: locationSchema.parse(added.body) };
}

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

async function untilDone(path: string): Promise<LocationImages> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const images = locationImagesSchema.parse((await client.call('GET', path)).body);
    const status = images.attempts[0]?.status;
    if (status === 'succeeded' || status === 'failed') return images;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('le immagini non sono arrivate in tempo');
}

describe('i luoghi del film', () => {
  it('la bozza propone i luoghi, e aggiungerne uno lo toglie dalle proposte', async () => {
    const { base } = await filmWithDraft();

    const before = locationsSchema.parse((await client.call('GET', base)).body);
    expect(before.locations).toEqual([]);
    expect(before.proposals.length).toBeGreaterThan(0);

    const { proposal, location } = await addFirst(base);
    expect(location).toMatchObject({
      name: proposal.name,
      prompt: proposal.prompt,
      proposalId: proposal.id,
      references: [],
    });

    const after = locationsSchema.parse((await client.call('GET', base)).body);
    expect(after.locations.map((l) => l.id)).toEqual([location.id]);
    expect(after.proposals.map((p) => p.id)).not.toContain(proposal.id);
  });

  it('il film passa alla fase dei luoghi, e la stessa proposta non si aggiunge due volte', async () => {
    const { film, base } = await filmWithDraft();
    const { proposal } = await addFirst(base);

    const reread = projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body);
    expect(reread.phase).toBe('locations');
    expect(failure(await client.call('POST', base, { proposalId: proposal.id }))).toMatchObject({
      status: 409,
      details: { field: 'proposalId' },
    });
  });

  it('una proposta che la bozza non ha, o un film senza bozza, dà «non trovato»', async () => {
    const { base } = await filmWithDraft();

    expect(failure(await client.call('POST', base, { proposalId: 'inventata' }))).toMatchObject({
      status: 404,
      details: { field: 'proposalId' },
    });
    expect((await client.call('GET', '/projects/non-c-e/locations')).status).toBe(404);
  });

  it('si fanno le immagini del set, si salvano nella cartella del film e si servono', async () => {
    const { base } = await filmWithDraft();
    const { location } = await addFirst(base);
    const images = `${base}/${location.id}/images`;

    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${images}/options`)).body,
    );
    expect(options.length).toBeGreaterThan(0);

    const started = await client.call('POST', images, {});
    expect(started.status).toBe(201);
    // Il lavoro parte subito: appena messo in coda può essere già in lavorazione.
    expect(['queued', 'running']).toContain(
      locationImagesSchema.parse(started.body).attempts[0]?.status,
    );

    const done = await untilDone(images);
    const assetId = done.attempts[0]?.assetIds[0] ?? '';
    expect(done.attempts[0]?.status).toBe('succeeded');
    const file = await fetch(`${baseUrl}/api/assets/${assetId}`);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('image/png');
  }, 20_000);

  it('un secondo tentativo mentre il primo lavora si rifiuta', async () => {
    const { base } = await filmWithDraft();
    const { location } = await addFirst(base);
    const images = `${base}/${location.id}/images`;
    await client.call('POST', images, {});

    expect(failure(await client.call('POST', images, {}))).toMatchObject({
      status: 409,
      details: { field: 'images' },
    });
    await untilDone(images);
  }, 20_000);

  it('l’immagine scelta diventa il riferimento del luogo nella Bibbia; una che non è sua si rifiuta', async () => {
    const { base } = await filmWithDraft();
    const { location } = await addFirst(base);
    const images = `${base}/${location.id}/images`;
    await client.call('POST', images, {});
    const done = await untilDone(images);
    const assetId = done.attempts[0]?.assetIds[0] ?? '';

    const rejected = failure(
      await client.call('PUT', `${images}/choice`, { assetId: 'a'.repeat(64) }),
    );
    expect(rejected).toMatchObject({ status: 409, details: { field: 'assetId' } });

    const chosen = await client.call('PUT', `${images}/choice`, { assetId });
    expect(locationImagesSchema.parse(chosen.body).chosenAssetId).toBe(assetId);
    const list = locationsSchema.parse((await client.call('GET', base)).body);
    expect(list.locations[0]?.references).toEqual([{ assetId }]);
  }, 20_000);

  it('un servizio che non è fra quelli adatti non si usa: nessuno scambio in silenzio', async () => {
    const { base } = await filmWithDraft();
    const { location } = await addFirst(base);
    const images = `${base}/${location.id}/images`;

    const reply = failure(await client.call('POST', images, { modelId: 'inventato' }));

    expect(reply).toMatchObject({ status: 409, code: 'no_eligible_model' });
    expect(locationImagesSchema.parse((await client.call('GET', images)).body).attempts).toEqual(
      [],
    );
  });

  it('togliere il luogo porta via le sue immagini', async () => {
    const { base } = await filmWithDraft();
    const { location } = await addFirst(base);
    const images = `${base}/${location.id}/images`;
    await client.call('POST', images, {});
    await untilDone(images);

    expect((await client.call('DELETE', `${base}/${location.id}`)).status).toBe(204);

    expect((await client.call('GET', images)).status).toBe(404);
    expect(locationsSchema.parse((await client.call('GET', base)).body).locations).toEqual([]);
  }, 20_000);
});
