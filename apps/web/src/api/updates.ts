import { updateCheckResultSchema } from '@filmzy/contracts';

import { sendJson } from './client';

export function checkForUpdates() {
  return sendJson('POST', '/updates/check', updateCheckResultSchema);
}
