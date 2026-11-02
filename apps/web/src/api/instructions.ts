import {
  createInstructionVersionResponseSchema,
  instructionTextSchema,
  instructionsOverviewSchema,
  previewInstructionsResponseSchema,
  roleInstructionsSchema,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le istruzioni dei ruoli: le versioni, il controllo di un testo, la scelta (D38). */

export function fetchInstructions(signal?: AbortSignal) {
  return getJson('/instructions', instructionsOverviewSchema, { signal });
}

export function fetchInstructionText(roleId: string, version: number, signal?: AbortSignal) {
  return getJson(`/instructions/${roleId}/versions/${String(version)}`, instructionTextSchema, {
    signal,
  });
}

export function previewInstructions(roleId: string, text: string) {
  return sendJson('POST', `/instructions/${roleId}/preview`, previewInstructionsResponseSchema, {
    text,
  });
}

export function createInstructionVersion(roleId: string, text: string, basedOn?: number) {
  return sendJson(
    'POST',
    `/instructions/${roleId}/versions`,
    createInstructionVersionResponseSchema,
    { text, ...(basedOn === undefined ? {} : { basedOn }) },
  );
}

/** `null` torna alla versione consigliata. */
export function chooseInstructionVersion(roleId: string, version: number | null) {
  return sendJson('PUT', `/instructions/${roleId}/choice`, roleInstructionsSchema, { version });
}
