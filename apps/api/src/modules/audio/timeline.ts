import type {
  AssemblyGap,
  AudioClip,
  AudioPlacement,
  AudioTimeline,
  AudioTimelineScene,
  AudioTimelineShot,
  ScenePlan,
  ShotSpec,
} from '@filmzy/contracts';
import type { KeptTake } from '@filmzy/db';

import { sceneIdOf } from '../shots/plan-shots.js';

/**
 * Quanto dura una scena nel film: una pensata quanto le sue inquadrature, perché è quello che si monterà;
 * una non ancora pensata il tempo scritto nella stesura.
 */
export function sceneLengthS(shots: readonly ShotSpec[], writtenS: number): number {
  return shots.length === 0
    ? writtenS
    : shots.reduce((total, shot) => total + shot.intent.durationS, 0);
}

/** Perché una scena non si può ancora montare: da pensare, da rifare, o con inquadrature senza video. */
export function sceneGap(
  scene: ScenePlan,
  kept: Readonly<Record<string, KeptTake>>,
): AssemblyGap | undefined {
  if (!scene.planned || scene.shots.length === 0) return { kind: 'not_planned' };
  if (scene.stale) return { kind: 'stale' };
  const missing = scene.shots.filter((shot) => kept[shot.id] === undefined).length;
  return missing === 0 ? undefined : { kind: 'no_take', missing };
}

/** Le scene che entrano nel film (D85): quelle che hanno tutto e che l'utente non ha tolto. */
export function tickedScenes(
  scenes: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
  excluded: ReadonlySet<number>,
): ScenePlan[] {
  return scenes.filter(
    (scene) => !excluded.has(scene.sceneNumber) && sceneGap(scene, kept) === undefined,
  );
}

/**
 * Le scene che stanno sulle tracce: quelle del film, così righello e blocchi dicono com'è davvero (D85). Finché
 * nessuna è pronta si vedono tutte tranne quelle tolte: il suono si può preparare prima dei video (D82).
 */
export function scenesOnLanes(
  scenes: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
  excluded: ReadonlySet<number>,
): ScenePlan[] {
  const ticked = tickedScenes(scenes, kept, excluded);
  return ticked.length > 0 ? ticked : scenes.filter((scene) => !excluded.has(scene.sceneNumber));
}

/**
 * La linea del tempo del film (T5.6, architettura §5.5): scene e inquadrature una dopo l'altra, e dove
 * cade ogni suono. È una funzione pura, così il disegno delle tracce e il montaggio (T5.7) non possono
 * dire cose diverse.
 */
export function buildTimeline(
  plans: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
  clips: readonly AudioClip[],
  hiddenSceneIds: readonly string[] = [],
): AudioTimeline {
  const scenes: AudioTimelineScene[] = [];
  const shots: AudioTimelineShot[] = [];
  let cursor = 0;

  for (const plan of plans) {
    const sceneId = sceneIdOf(plan.sceneNumber);
    const startS = cursor;
    for (const shot of plan.shots) {
      const take = kept[shot.id];
      shots.push({
        shotId: shot.id,
        sceneId,
        startS: cursor,
        durationS: shot.intent.durationS,
        action: shot.intent.action,
        ...(take === undefined ? {} : { takeId: take.takeId, assetId: take.assetId }),
        nativeAudio: take?.nativeAudio ?? false,
      });
      cursor += shot.intent.durationS;
    }
    const durationS = sceneLengthS(plan.shots, plan.durationS);
    cursor = startS + durationS;
    scenes.push({
      sceneId,
      sceneNumber: plan.sceneNumber,
      heading: plan.heading,
      startS,
      durationS,
      stale: plan.stale,
    });
  }

  const durationS = cursor;
  const placements: Record<string, AudioPlacement> = {};
  for (const clip of clips) {
    const placement = placeClip(clip, scenes, shots, durationS);
    if (placement !== undefined) placements[clip.id] = placement;
  }
  return { durationS, scenes, shots, placements, hiddenSceneIds: [...hiddenSceneIds] };
}

/**
 * Dove si sente una clip. La musica sta dentro la sua scena: è il mix a tagliarla (D81). Un effetto o una
 * voce può sforare nell'inquadratura dopo, ma non oltre la fine del film. Senza il suo posto non si sente.
 */
function placeClip(
  clip: AudioClip,
  scenes: readonly AudioTimelineScene[],
  shots: readonly AudioTimelineShot[],
  filmEndS: number,
): AudioPlacement | undefined {
  const scene = scenes.find(({ sceneId }) => sceneId === clip.sceneId);
  if (scene === undefined) return undefined;

  if (clip.kind === 'music') {
    return { startS: scene.startS, durationS: Math.min(clip.durationS, scene.durationS) };
  }

  const shot = clip.shotId === undefined ? undefined : shots.find((s) => s.shotId === clip.shotId);
  if (clip.shotId !== undefined && shot?.sceneId !== clip.sceneId) return undefined;
  const startS = (shot?.startS ?? scene.startS) + clip.startS;
  const durationS = Math.min(clip.durationS, filmEndS - startS);
  return durationS > 0 ? { startS, durationS } : undefined;
}
