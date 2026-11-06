import { aboutSchema } from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** «Informazioni» e «I tuoi dati» (T6.2): la versione, la cartella dei dati, e aprirla. */

export function fetchAbout(signal?: AbortSignal) {
  return getJson('/about', aboutSchema, { signal });
}

export function openDataFolder() {
  return sendJson('POST', '/about/data-folder', z.undefined());
}
