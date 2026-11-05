import { SHOT_DURATION_RANGE_S, type FilmEstimate } from '@filmzy/contracts';
import type { ConfigSource, Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { variantsOf } from '../media/image-jobs.js';
import { identityStandIns } from '../shots/storyboard-input.js';
import type { MediaRequest } from '../shots/video-inputs.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';

/** Quanto dura in media un'inquadratura: serve a sapere quante ce ne vogliono per fare il film. */
const AVERAGE_SHOT_S = (SHOT_DURATION_RANGE_S.min + SHOT_DURATION_RANGE_S.max) / 2;

/** Quante varianti se la configurazione del ruolo non lo dice: come lo storyboard (T4.1). */
const FALLBACK_VARIANTS = 3;

/** Un'inquadratura tipica ha due personaggi e il set: i servizi si scelgono anche da cosa ricevono. */
const TYPICAL_REFERENCES = {
  characters: [
    { characterId: 'stima-1', assetId: 'stima-1' },
    { characterId: 'stima-2', assetId: 'stima-2' },
  ],
  locationAssetId: 'stima-set',
};

/**
 * Il costo indicativo di un film, per video e storyboard (D85). I prezzi vengono dal catalogo, per i servizi
 * che l'utente ha scelto come predefiniti (regola 2). Non chiama nessun servizio: la richiesta è finta e non
 * si invia mai. Non conta il testo che scrive i prompt, che pesa pochissimo, né personaggi, luoghi e suoni: la
 * schermata dice che sono a parte. Il conto serve a farsi un'idea, e prima di ogni generazione si vede quello vero.
 */
@Injectable()
export class FilmEstimateService {
  constructor(
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
  ) {}

  async estimate(durationS: number): Promise<FilmEstimate> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });

    const standIn = { prompt: 'Una stima: non si invia mai.', idempotencyKey: 'stima-del-film' };
    const [video, storyboard] = await Promise.all([
      this.defaultPrice({
        ...standIn,
        role: 'camera_operator',
        durationS: Math.round(AVERAGE_SHOT_S),
        params: {},
      }),
      this.defaultPrice({
        ...standIn,
        role: 'storyboard_artist',
        params: { variants: variantsOf(loaded.config, 'storyboard_artist', FALLBACK_VARIANTS) },
      }),
    ]);
    if (video === undefined) return { available: false, reason: 'no_video_service' };
    if (storyboard === undefined) return { available: false, reason: 'no_image_service' };

    const shots = Math.ceil(durationS / AVERAGE_SHOT_S);
    return {
      available: true,
      lowUsd: shots * (video + storyboard),
      highUsd: shots * (2 * video + storyboard),
    };
  }

  /**
   * Il prezzo del servizio predefinito. Prima con i riferimenti di un'inquadratura tipica, poi senza: un servizio
   * attivato che non ne accetta ha comunque un prezzo, e dire che non c'è niente di attivato sarebbe falso.
   */
  private async defaultPrice(
    request: Omit<MediaRequest, 'inputs' | 'characterIds'>,
  ): Promise<number | undefined> {
    const typical = await this.troupe.options(request.role, {
      ...request,
      inputs: identityStandIns(TYPICAL_REFERENCES),
      characterIds: TYPICAL_REFERENCES.characters.map(({ characterId }) => characterId),
    });
    const options =
      typical.length > 0
        ? typical
        : await this.troupe.options(request.role, { ...request, inputs: [], characterIds: [] });
    return (options.find((option) => option.isDefault) ?? options[0])?.estimatedCostUsd;
  }
}
