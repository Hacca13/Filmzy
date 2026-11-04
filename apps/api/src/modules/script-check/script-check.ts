import { createHash } from 'node:crypto';

import type {
  ContinuityFlag,
  ScenePlan,
  ScriptCheckIssue,
  ScriptCheckView,
  ScriptSupervisorIssue,
} from '@filmzy/contracts';
import type { NewScriptIssue, StoredScriptCheck } from '@filmzy/db';

import { sceneIdOf } from '../shots/plan-shots.js';

/**
 * Il controllo della storia (T5.2, architettura §8): cosa legge la segretaria di edizione, come si
 * ripulisce ciò che risponde, e come diventa un giallo. Funzioni pure, così si provano a parte.
 */

/** Quante segnalazioni si tengono al massimo: oltre, nessuno le legge, e di solito il modello esagera. */
export const MAX_ISSUES = 20;

/** Le scene che la segretaria legge: quelle con un piano che vale ancora (non da rifare). */
export const usableScenes = (scenes: readonly ScenePlan[]): ScenePlan[] =>
  scenes.filter((scene) => scene.planned && !scene.stale);

/**
 * Riassume ciò che il controllo ha letto: la stesura finale e le inquadrature delle scene che valgono.
 * Se la stesura viene corretta o una scena viene ripensata (nuove inquadrature, nuovi id) il riassunto
 * cambia e il controllo è vecchio.
 */
export function fingerprintOf(finalId: string, scenes: readonly ScenePlan[]): string {
  const shotIds = usableScenes(scenes)
    .flatMap((scene) => scene.shots.map((shot) => shot.id))
    .sort();
  return createHash('sha256')
    .update(JSON.stringify([finalId, shotIds]))
    .digest('hex')
    .slice(0, 16);
}

/** Dove la segretaria può dire che c'è un problema: gli id che le abbiamo dato. */
export interface KnownPlaces {
  sceneIds: ReadonlySet<string>;
  /** Ogni inquadratura con la sua scena. */
  shotScenes: ReadonlyMap<string, string>;
}

export function placesOf(scenes: readonly ScenePlan[]): KnownPlaces {
  const used = usableScenes(scenes);
  return {
    sceneIds: new Set(used.map((scene) => sceneIdOf(scene.sceneNumber))),
    shotScenes: new Map(
      used.flatMap((scene) => scene.shots.map((shot) => [shot.id, shot.sceneId] as const)),
    ),
  };
}

/**
 * Ciò che la segretaria risponde, ripulito: gli id inventati non valgono (un'inquadratura sconosciuta
 * cade sulla sua scena, se questa c'è; altrimenti il problema resta del film), l'inquadratura porta la
 * sua scena e il peso diventa quello del giallo. Un modello che esagera si ferma a `MAX_ISSUES`.
 */
export function settleIssues(
  issues: readonly ScriptSupervisorIssue[],
  known: KnownPlaces,
): NewScriptIssue[] {
  return issues.slice(0, MAX_ISSUES).map((issue) => {
    const shotScene = issue.shotId === undefined ? undefined : known.shotScenes.get(issue.shotId);
    const sceneId =
      shotScene ??
      (issue.sceneId !== undefined && known.sceneIds.has(issue.sceneId)
        ? issue.sceneId
        : undefined);
    return {
      code: issue.code,
      light: issue.severity === 'notice',
      reason: issue.reason.trim(),
      ...(sceneId === undefined ? {} : { sceneId }),
      ...(shotScene === undefined || issue.shotId === undefined ? {} : { shotId: issue.shotId }),
    };
  });
}

/** `none` senza controllo; `current` se ha letto la storia di adesso; altrimenti `outdated`. */
export function checkState(
  check: StoredScriptCheck | undefined,
  finalId: string,
  scenes: readonly ScenePlan[],
): ScriptCheckView['state'] {
  if (check === undefined) return 'none';
  return check.fingerprint === fingerprintOf(finalId, scenes) ? 'current' : 'outdated';
}

const toFlag = (issue: { code: string; light: boolean; reason: string }): ContinuityFlag => ({
  code: issue.code,
  reason: issue.reason,
  origin: 'llm',
  light: issue.light,
});

/**
 * Le segnalazioni della segretaria come gialli: sull'inquadratura se ce n'è una, altrimenti sulla scena.
 * Quelle del film intero restano nell'elenco del controllo. Un controllo vecchio non ingiallisce niente:
 * la storia è cambiata dopo, e magari proprio per rispondere a quella segnalazione.
 */
export function addScriptFlags(
  scenes: readonly ScenePlan[],
  check: StoredScriptCheck | undefined,
  finalId: string,
): ScenePlan[] {
  if (check === undefined || checkState(check, finalId, scenes) !== 'current') return [...scenes];
  return scenes.map((scene) => {
    const sceneId = sceneIdOf(scene.sceneNumber);
    const flags: ScenePlan['flags'] = { ...scene.flags };
    const sceneFlags = [...scene.sceneFlags];
    const shotIds = new Set(scene.shots.map((shot) => shot.id));
    for (const issue of check.issues) {
      if (issue.shotId !== undefined && shotIds.has(issue.shotId)) {
        flags[issue.shotId] = [...(flags[issue.shotId] ?? []), toFlag(issue)];
      } else if (issue.shotId === undefined && issue.sceneId === sceneId) {
        sceneFlags.push(toFlag(issue));
      }
    }
    return { ...scene, flags, sceneFlags };
  });
}

/** Le segnalazioni come le vede l'utente: con scena e inquadratura numerate da 1. */
export function issuesView(
  check: StoredScriptCheck,
  scenes: readonly ScenePlan[],
): ScriptCheckIssue[] {
  const sceneNumbers = new Map(
    scenes.map((scene) => [sceneIdOf(scene.sceneNumber), scene.sceneNumber]),
  );
  const shotNumbers = new Map(
    scenes.flatMap((scene) => scene.shots.map((shot) => [shot.id, shot.order + 1] as const)),
  );
  return check.issues.map((issue) => {
    const sceneNumber = issue.sceneId === undefined ? undefined : sceneNumbers.get(issue.sceneId);
    const shotNumber = issue.shotId === undefined ? undefined : shotNumbers.get(issue.shotId);
    return {
      id: issue.id,
      code: issue.code,
      light: issue.light,
      reason: issue.reason,
      ...(sceneNumber === undefined ? {} : { sceneNumber }),
      ...(shotNumber === undefined ? {} : { shotNumber }),
    };
  });
}
