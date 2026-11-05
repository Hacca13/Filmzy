import type { AudioClip, AudioTimeline, AudioTrack, AudioTrackKind } from '@filmzy/contracts';
import type { MixSound } from '@filmzy/media';

/** Quanto si accavallano due musiche di scene vicine (s): la dissolvenza incrociata di D24. */
const CROSSFADE_S = 1;

/** Una musica che entra o esce da sola non parte di colpo (s). */
const SOFT_EDGE_S = 0.5;

/** Il file in uso di una clip, già letto: dov'è e quanto dura davvero. */
export interface SoundFile {
  file: string;
  durationS: number;
}

export interface MixPlanInput {
  timeline: AudioTimeline;
  clips: readonly AudioClip[];
  tracks: readonly AudioTrack[];
  /** Il file in uso di ogni clip che ne ha uno. */
  files: Readonly<Record<string, SoundFile>>;
  /** Da quando parte la prima inquadratura nel film: prima ci sono i titoli. */
  offsetS: number;
}

/**
 * Cosa entra nel mix e dove (T5.7, D24): solo le clip con un suono in uso e un posto, sulle tracce non
 * mute. È una funzione pura, così si prova senza ffmpeg. Le posizioni vengono dalla linea del tempo, fatta
 * con le durate vere delle clip: un video un po' più lungo del previsto non sposta i suoni dopo di lui.
 */
export function planMix(input: MixPlanInput): MixSound[] {
  const { timeline, clips, tracks, files, offsetS } = input;
  const trackOf = new Map<AudioTrackKind, AudioTrack>(tracks.map((track) => [track.kind, track]));
  const heard = clips.filter((clip) => {
    const muted = trackOf.get(clip.kind)?.muted ?? true;
    return !muted && files[clip.id] !== undefined && timeline.placements[clip.id] !== undefined;
  });

  const scenesWithMusic = new Set(
    heard.filter(({ kind }) => kind === 'music').map((clip) => clip.sceneId),
  );
  const order = timeline.scenes.map(({ sceneId }) => sceneId);
  const neighbour = (sceneId: string, step: number): boolean => {
    const other = order[order.indexOf(sceneId) + step];
    return other !== undefined && scenesWithMusic.has(other);
  };

  return heard.flatMap((clip) => {
    const placement = timeline.placements[clip.id];
    const file = files[clip.id];
    if (placement === undefined || file === undefined) return [];
    const volume = (trackOf.get(clip.kind)?.volume ?? 1) * clip.volume;
    const placedS = Math.min(placement.durationS, file.durationS);
    if (volume <= 0 || placedS <= 0) return [];
    const startS = offsetS + placement.startS;

    if (clip.kind !== 'music') {
      return [
        {
          file: file.file,
          startS,
          durationS: placedS,
          volume,
          fadeInS: fitFade(clip.fadeInS, placedS),
          fadeOutS: fitFade(clip.fadeOutS, placedS),
        },
      ];
    }

    // Se dopo c'è un'altra musica questa continua un po' sotto di lei, se il file lo permette.
    const overlapS = neighbour(clip.sceneId, 1)
      ? Math.min(CROSSFADE_S, file.durationS - placedS)
      : 0;
    const durationS = placedS + overlapS;
    const enters = neighbour(clip.sceneId, -1) ? CROSSFADE_S : SOFT_EDGE_S;
    const leaves = overlapS > 0 ? overlapS : SOFT_EDGE_S;
    return [
      {
        file: file.file,
        startS,
        durationS,
        volume,
        fadeInS: fitFade(Math.max(enters, clip.fadeInS), durationS),
        fadeOutS: fitFade(Math.max(leaves, clip.fadeOutS), durationS),
      },
    ];
  });
}

/** Una dissolvenza non occupa più di metà del suono: entrata e uscita non si devono pestare. */
function fitFade(fadeS: number, durationS: number): number {
  return Math.min(fadeS, durationS / 2);
}
