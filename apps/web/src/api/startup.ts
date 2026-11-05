import { z } from 'zod';

import { sendJson } from './client';

/** Le due cose che si possono fare quando i dati non si aprono (§6.2). Il server è quello ridotto. */

export function retryStartup() {
  return sendJson('POST', '/startup/retry', z.undefined());
}

export function openStartupFolder() {
  return sendJson('POST', '/startup/folder', z.undefined());
}
