import {
  planSceneEstimateSchema,
  scenePlanSchema,
  shotPlansSchema,
  shotSpecSchema,
  type ChangeShotBody,
  type PlanSceneBody,
  type SetFlagIgnoredBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le inquadrature (T3.9): le scene con il loro piano, la stima, pensarlo e cambiare un movimento. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/shots`;

export function fetchShotPlans(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), shotPlansSchema, { signal });
}

export function estimateScenePlan(filmId: string, sceneNumber: number, signal?: AbortSignal) {
  return sendJson(
    'POST',
    `${base(filmId)}/estimate`,
    planSceneEstimateSchema,
    { sceneNumber },
    {
      signal,
    },
  );
}

export function planScene(filmId: string, body: PlanSceneBody) {
  return sendJson('POST', base(filmId), scenePlanSchema, body);
}

/** «Ignora» un giallo o lo rimette (T5.3). */
export function setFlagIgnored(filmId: string, body: SetFlagIgnoredBody) {
  return sendJson('PUT', `${base(filmId)}/flags`, shotPlansSchema, body);
}

export function changeShotMovement(filmId: string, shotId: string, body: ChangeShotBody) {
  return sendJson('PATCH', `${base(filmId)}/${encodeURIComponent(shotId)}`, shotSpecSchema, body);
}
