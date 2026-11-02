import {
  draftReviewSchema,
  locationSchema,
  locationsSchema,
  projectOptionsSchema,
  projectSchema,
  scenePlanSchema,
  screenplayVersionSchema,
} from '@filmzy/contracts';

import type { Client } from './app-client.js';

/** Per i test dello storyboard e delle immagini: un film con la stesura finale scritta, un luogo e la prima scena pensata. */
export async function filmWithShot(client: Client) {
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

  const places = `/projects/${film.id}/locations`;
  const { proposals } = locationsSchema.parse((await client.call('GET', places)).body);
  const proposal = proposals[0];
  if (proposal === undefined) throw new Error('la bozza finta doveva proporre un luogo');
  const location = locationSchema.parse(
    (await client.call('POST', places, { proposalId: proposal.id })).body,
  );

  const { differences } = draftReviewSchema.parse(
    (await client.call('GET', `/projects/${film.id}/review`)).body,
  );
  const written = await client.call('POST', `/projects/${film.id}/screenplay/final`, {
    answers: differences
      .filter((difference) => difference.choices.length > 0)
      .map((difference) => ({ key: difference.key, decision: 'adapt' })),
  });
  const final = screenplayVersionSchema.parse(written.body);

  const planned = await client.call('POST', `/projects/${film.id}/shots`, { sceneNumber: 1 });
  const plan = scenePlanSchema.parse(planned.body);
  const shot = plan.shots[0];
  if (shot === undefined) throw new Error('doveva esserci un’inquadratura');

  return { film, location, final, shot, shots: `/projects/${film.id}/shots`, places };
}
