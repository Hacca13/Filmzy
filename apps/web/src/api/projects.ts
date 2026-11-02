import {
  projectOptionsSchema,
  projectSchema,
  projectsListSchema,
  type CreateProjectBody,
  type UpdateProjectBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** I film (T3.2): le scelte del wizard «La tua idea», l'elenco, un film, e creare o rivedere l'idea. */

export function fetchProjectOptions(signal?: AbortSignal) {
  return getJson('/projects/options', projectOptionsSchema, { signal });
}

export function fetchProjects(signal?: AbortSignal) {
  return getJson('/projects', projectsListSchema, { signal });
}

export function fetchProject(id: string, signal?: AbortSignal) {
  return getJson(`/projects/${encodeURIComponent(id)}`, projectSchema, { signal });
}

export function createProject(body: CreateProjectBody) {
  return sendJson('POST', '/projects', projectSchema, body);
}

export function updateProject(id: string, body: UpdateProjectBody) {
  return sendJson('PATCH', `/projects/${encodeURIComponent(id)}`, projectSchema, body);
}
