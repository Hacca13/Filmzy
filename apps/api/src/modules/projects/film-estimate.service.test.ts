import type { ModelOption } from '@filmzy/contracts';
import type { ConfigSource, Troupe } from '@filmzy/troupe';
import { describe, expect, it } from 'vitest';

import { FilmEstimateService } from './film-estimate.service.js';

const option = (estimatedCostUsd: number, isDefault = true) =>
  ({ modelId: 'x', label: 'X', estimatedCostUsd, isDefault }) as ModelOption;

/** Quali servizi risponde il catalogo per ogni ruolo, con i riferimenti e senza. */
function serviceWith(prices: {
  video?: ModelOption[];
  image?: ModelOption[];
  imageWithoutReferences?: ModelOption[];
}): FilmEstimateService {
  const troupe = {
    options: (role: string, request: { inputs: unknown[] }) => {
      if (role === 'camera_operator') return Promise.resolve(prices.video ?? []);
      return Promise.resolve(
        request.inputs.length > 0 ? (prices.image ?? []) : (prices.imageWithoutReferences ?? []),
      );
    },
  } as unknown as Troupe;
  const configSource = {
    load: () => Promise.resolve({ config: { roles: {} }, issues: [] }),
  } as unknown as ConfigSource;
  return new FilmEstimateService(troupe, configSource);
}

describe('il costo indicativo di un film', () => {
  it('il numero alto rifà tutti i video una volta; lo storyboard si paga una volta sola', async () => {
    // Un minuto, cioè 11 inquadrature da 5,5 secondi.
    const estimate = await serviceWith({
      video: [option(1)],
      image: [option(0.1)],
    }).estimate(60);

    expect(estimate).toEqual({ available: true, lowUsd: 11 * 1.1, highUsd: 11 * 2.1 });
  });

  it('usa il servizio predefinito, non il primo dell’elenco', async () => {
    const estimate = await serviceWith({
      video: [option(9, false), option(1)],
      image: [option(0)],
    }).estimate(11);

    expect(estimate).toMatchObject({ available: true, lowUsd: 2 });
  });

  it('senza un servizio video lo dice', async () => {
    expect(await serviceWith({ image: [option(0.1)] }).estimate(60)).toEqual({
      available: false,
      reason: 'no_video_service',
    });
  });

  it('senza un servizio per le immagini lo dice', async () => {
    expect(await serviceWith({ video: [option(1)] }).estimate(60)).toEqual({
      available: false,
      reason: 'no_image_service',
    });
  });

  it('un servizio attivato che non accetta riferimenti ha comunque un prezzo', async () => {
    const estimate = await serviceWith({
      video: [option(1)],
      imageWithoutReferences: [option(0.1)],
    }).estimate(60);

    expect(estimate.available).toBe(true);
  });

  it('se la configurazione non si carica lo dice con il suo codice', async () => {
    const service = new FilmEstimateService(
      {} as Troupe,
      { load: () => Promise.resolve({ issues: [] }) } as unknown as ConfigSource,
    );

    await expect(service.estimate(60)).rejects.toMatchObject({
      response: { code: 'config_invalid' },
    });
  });
});
