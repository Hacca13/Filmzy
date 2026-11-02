import { appPreferencesSchema, type AppPreferences } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

export function fetchPreferences(signal?: AbortSignal) {
  return getJson('/preferences', appPreferencesSchema, { signal });
}

export function savePreferences(preferences: AppPreferences) {
  return sendJson('PUT', '/preferences', appPreferencesSchema, preferences);
}
