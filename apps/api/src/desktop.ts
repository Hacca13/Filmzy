import type { JobQueue } from '@filmzy/db';
import type { INestApplicationContext } from '@nestjs/common';

import { JOB_QUEUE } from './modules/database/database.module.js';

/**
 * Quello che il programma per computer (`apps/desktop`, T6.4) usa del server: lo accende accanto alla sua
 * finestra e, prima di chiudere, chiede quanti lavori sono aperti (D63).
 */
export { startServer, type StartServerOptions } from './start-server.js';
export type { SecretCipher } from './modules/secrets/secret-cipher.js';

/** I lavori in coda o in corso: chiudendo adesso si fermerebbero, e dopo il riavvio non ripartono (D84). */
export function openJobCount(app: INestApplicationContext): number {
  const { queued, running } = app.get<JobQueue>(JOB_QUEUE, { strict: false }).counts();
  return queued + running;
}
