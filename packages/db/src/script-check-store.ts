import { randomUUID } from 'node:crypto';

import { asc, desc, eq, inArray } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { scriptChecks, scriptIssues } from './schema.js';

/** Una cosa che la segretaria di edizione ha trovato, prima di salvarla. */
export interface NewScriptIssue {
  sceneId?: string;
  shotId?: string;
  code: string;
  /** Un avviso leggero e non un giallo vero. */
  light: boolean;
  reason: string;
}

export interface NewScriptCheck {
  projectId: string;
  /** Riassume ciò che è stato letto (la stesura finale e le inquadrature): se cambia, il controllo è vecchio. */
  fingerprint: string;
  /** Lo scontrino della chiamata. */
  generationId: string;
  issues: NewScriptIssue[];
}

export interface StoredScriptIssue extends NewScriptIssue {
  id: string;
}

export interface StoredScriptCheck extends Omit<NewScriptCheck, 'issues'> {
  id: string;
  createdAt: string;
  issues: StoredScriptIssue[];
}

/**
 * Il controllo della storia (T5.2, architettura §6, §8). A differenza dei gialli delle regole, che si
 * ricalcolano dai dati, quello della segretaria di edizione costa una chiamata: si salva. Per film ne
 * vale uno solo, l'ultimo: ripeterlo sostituisce il precedente.
 */
export interface ScriptCheckStore {
  /** Salva il controllo e toglie quello di prima, in una sola operazione. */
  replace: (check: NewScriptCheck) => StoredScriptCheck;
  latest: (projectId: string) => StoredScriptCheck | undefined;
}

export interface ScriptCheckStoreOptions {
  now?: () => Date;
}

export function createScriptCheckStore(
  db: FilmzyDb,
  options: ScriptCheckStoreOptions = {},
): ScriptCheckStore {
  const now = options.now ?? (() => new Date());

  const issuesOf = (checkId: string): StoredScriptIssue[] =>
    db
      .select()
      .from(scriptIssues)
      .where(eq(scriptIssues.checkId, checkId))
      .orderBy(asc(scriptIssues.position))
      .all()
      .map((row) => ({
        id: row.id,
        code: row.code,
        light: row.light,
        reason: row.reason,
        ...(row.sceneId === null ? {} : { sceneId: row.sceneId }),
        ...(row.shotId === null ? {} : { shotId: row.shotId }),
      }));

  return {
    replace(check) {
      return db.transaction((tx) => {
        const old = tx
          .select({ id: scriptChecks.id })
          .from(scriptChecks)
          .where(eq(scriptChecks.projectId, check.projectId))
          .all()
          .map((row) => row.id);
        if (old.length > 0) {
          tx.delete(scriptIssues).where(inArray(scriptIssues.checkId, old)).run();
          tx.delete(scriptChecks).where(eq(scriptChecks.projectId, check.projectId)).run();
        }

        const id = randomUUID();
        const createdAt = now().getTime();
        tx.insert(scriptChecks)
          .values({
            id,
            projectId: check.projectId,
            fingerprint: check.fingerprint,
            generationId: check.generationId,
            createdAt,
          })
          .run();
        const issues: StoredScriptIssue[] = check.issues.map((issue) => ({
          ...issue,
          id: randomUUID(),
        }));
        for (const [position, issue] of issues.entries()) {
          tx.insert(scriptIssues)
            .values({
              id: issue.id,
              checkId: id,
              position,
              sceneId: issue.sceneId ?? null,
              shotId: issue.shotId ?? null,
              code: issue.code,
              light: issue.light,
              reason: issue.reason,
            })
            .run();
        }
        return {
          id,
          projectId: check.projectId,
          fingerprint: check.fingerprint,
          generationId: check.generationId,
          createdAt: new Date(createdAt).toISOString(),
          issues,
        };
      });
    },

    latest(projectId) {
      const row = db
        .select()
        .from(scriptChecks)
        .where(eq(scriptChecks.projectId, projectId))
        .orderBy(desc(scriptChecks.createdAt))
        .limit(1)
        .get();
      if (row === undefined) return undefined;
      return {
        id: row.id,
        projectId: row.projectId,
        fingerprint: row.fingerprint,
        generationId: row.generationId,
        createdAt: new Date(row.createdAt).toISOString(),
        issues: issuesOf(row.id),
      };
    },
  };
}
