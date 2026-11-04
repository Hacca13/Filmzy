import type { CreateAudioClipBody, ScenePlan, SoundCue } from '@filmzy/contracts';

import { sceneIdOf } from '../shots/plan-shots.js';

/** Quanti effetti per scena: lo dicono anche le istruzioni, ma il modello a volte esagera. */
const MAX_EFFECTS_PER_SCENE = 3;

/**
 * Cosa si tiene delle proposte del sound designer (T5.5, D24). Il modello scrive liberamente: una scena o
 * un'inquadratura che non esiste, o un secondo oltre la fine, non devono arrivare all'utente. Ogni proposta
 * ha già la forma di una clip da creare, così accettarla è una richiesta come le altre.
 */
export function settleCues(
  cues: readonly SoundCue[],
  scenes: readonly ScenePlan[],
  allowed: { music: boolean; sfx: boolean },
): CreateAudioClipBody[] {
  const sceneById = new Map(scenes.map((scene) => [sceneIdOf(scene.sceneNumber), scene]));
  const withMusic = new Set<string>();
  const effects = new Map<string, number>();
  const settled: CreateAudioClipBody[] = [];

  for (const cue of cues) {
    const scene = sceneById.get(cue.sceneId);
    const description = cue.description.trim();
    if (scene === undefined || description === '') continue;
    const mood = cue.mood?.trim();

    if (cue.kind === 'music') {
      // Un blocco di musica per scena, e non più lungo della scena.
      if (!allowed.music || withMusic.has(cue.sceneId)) continue;
      withMusic.add(cue.sceneId);
      settled.push({
        kind: 'music',
        sceneId: cue.sceneId,
        durationS: Math.min(cue.durationS, scene.durationS),
        description,
        ...(mood === undefined || mood === '' ? {} : { mood }),
      });
      continue;
    }

    // Le inquadrature di una scena da rifare non valgono più: i loro id spariranno.
    const shot = scene.stale ? undefined : scene.shots.find(({ id }) => id === cue.shotId);
    const count = effects.get(cue.sceneId) ?? 0;
    if (!allowed.sfx || shot === undefined || count >= MAX_EFFECTS_PER_SCENE) continue;
    effects.set(cue.sceneId, count + 1);
    const startS = cue.atS ?? 0;
    settled.push({
      kind: 'sfx',
      sceneId: cue.sceneId,
      shotId: shot.id,
      startS: startS < shot.intent.durationS ? startS : 0,
      durationS: cue.durationS,
      description,
    });
  }
  return settled;
}
