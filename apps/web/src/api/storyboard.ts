import {
  sheetOptionsSchema,
  shotStoryboardSchema,
  type StartSheetBody,
  type StoryboardMode,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/**
 * Lo storyboard di un'inquadratura (T4.1) e il suo ultimo fotogramma (T4.2): le varianti, i servizi
 * con la stima, la richiesta e la scelta. Sono lo stesso lavoro, in due modi, con due percorsi.
 */

const SEGMENT: Record<StoryboardMode, string> = {
  storyboard: 'storyboard',
  end_frame: 'end-frame',
};

const base = (filmId: string, shotId: string, mode: StoryboardMode) =>
  `/projects/${encodeURIComponent(filmId)}/shots/${encodeURIComponent(shotId)}/${SEGMENT[mode]}`;

export function fetchStoryboard(
  filmId: string,
  shotId: string,
  mode: StoryboardMode,
  signal?: AbortSignal,
) {
  return getJson(base(filmId, shotId, mode), shotStoryboardSchema, { signal });
}

export function fetchStoryboardOptions(
  filmId: string,
  shotId: string,
  mode: StoryboardMode,
  signal?: AbortSignal,
) {
  return getJson(`${base(filmId, shotId, mode)}/options`, sheetOptionsSchema, { signal });
}

export function startStoryboard(
  filmId: string,
  shotId: string,
  mode: StoryboardMode,
  body: StartSheetBody,
) {
  return sendJson('POST', base(filmId, shotId, mode), shotStoryboardSchema, body);
}

export function chooseStoryboard(
  filmId: string,
  shotId: string,
  mode: StoryboardMode,
  assetId: string,
) {
  return sendJson('PUT', `${base(filmId, shotId, mode)}/choice`, shotStoryboardSchema, {
    assetId,
  });
}
