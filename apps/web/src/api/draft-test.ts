import {
  draftTestEstimateSchema,
  draftTestResultSchema,
  testableRolesSchema,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** La prova della bozza: stima prima, poi la prova vera (architettura §4.5 punto 2). */

export function fetchTestableRoles(signal?: AbortSignal) {
  return getJson('/troupe/test/roles', testableRolesSchema, { signal });
}

export function estimateTest(roleId: string, signal?: AbortSignal) {
  return sendJson('POST', `/troupe/test/${roleId}/estimate`, draftTestEstimateSchema, undefined, {
    signal,
  });
}

/** `spendConfirmed`: l'utente ha visto che la prova supera un limite di spesa e prosegue (D30). */
export function runTest(roleId: string, options: { spendConfirmed?: boolean } = {}) {
  return sendJson(
    'POST',
    `/troupe/test/${roleId}/run`,
    draftTestResultSchema,
    options.spendConfirmed === true ? { spendConfirmed: true } : undefined,
  );
}
