import { roleChangeResultSchema, rolesOverviewSchema, type RoleTuning } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** «Chi fa cosa» (T2.7, D38, D95): il servizio, la creatività e l'impegno di ogni ruolo. Valgono subito. */

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
  return setTuning(roleId, 'temperature', value);
}

/** `null` torna al predefinito del servizio. */
export function setRoleEffort(roleId: string, value: string | null) {
  return setTuning(roleId, 'effort', value);
}

function setTuning(roleId: string, tuning: RoleTuning, value: number | string | null) {
  return sendJson('PUT', `/roles/${encodeURIComponent(roleId)}/${tuning}`, roleChangeResultSchema, {
    value,
  });
}
