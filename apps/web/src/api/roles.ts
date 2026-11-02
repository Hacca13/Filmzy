import { roleChangeResultSchema, rolesOverviewSchema } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** «Chi fa cosa» (T2.7, D38): il servizio e la creatività di ogni ruolo. Valgono subito. */

export function fetchRoles(signal?: AbortSignal) {
  return getJson('/roles', rolesOverviewSchema, { signal });
}

/** `null` torna al servizio della release (o al predefinito del gruppo). */
export function setRoleService(roleId: string, modelId: string | null) {
  return sendJson('PUT', `/roles/${encodeURIComponent(roleId)}/service`, roleChangeResultSchema, {
    modelId,
  });
}

/** `null` torna al valore del programma. */
export function setRoleTemperature(roleId: string, value: number | null) {
  return sendJson(
    'PUT',
    `/roles/${encodeURIComponent(roleId)}/temperature`,
    roleChangeResultSchema,
    { value },
  );
}
