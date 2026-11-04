import type {
  AudioClip,
  AudioPlacement,
  AudioTimeline,
  AudioTimelineScene,
  AudioTimelineShot,
  ScenePlan,
} from '@filmzy/contracts';
import type { KeptTake } from '@filmzy/db';

import { sceneIdOf } from '../shots/plan-shots.js';

/**
 * La linea del tempo del film (T5.6, architettura §5.5): scene e inquadrature una dopo l'altra, e dove
 * cade ogni suono. È una funzione pura, così il disegno delle tracce e il montaggio (T5.7) non possono
 * dire cose diverse. Una scena non ancora pensata occupa il tempo scritto nella stesura; una pensata
 * dura quanto le sue inquadrature, perché è quello che si monterà.
 */
export function buildTimeline(
  plans: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
  clips: readonly AudioClip[],
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
    if (plan.shots.length === 0) cursor += plan.durationS;
    scenes.push({
      sceneId,
      sceneNumber: plan.sceneNumber,
      heading: plan.heading,
      startS,
      durationS: cursor - startS,
      stale: plan.stale,
    });
  }

  const durationS = cursor;
  const placements: Record<string, AudioPlacement> = {};
  for (const clip of clips) {
    const placement = placeClip(clip, scenes, shots, durationS);
    if (placement !== undefined) placements[clip.id] = placement;
  }
  return { durationS, scenes, shots, placements };
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
