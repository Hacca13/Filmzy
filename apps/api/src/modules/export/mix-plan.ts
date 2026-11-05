import type { AudioClip, AudioTimeline, AudioTrack, AudioTrackKind } from '@filmzy/contracts';
import type { MixSound } from '@filmzy/media';

/** Quanto si accavallano due musiche di scene vicine (s): la dissolvenza incrociata di D24. */
const CROSSFADE_S = 1;

/** Una musica che entra o esce da sola non parte di colpo (s). */
const SOFT_EDGE_S = 0.5;

/**
 * A che livello si porta ogni traccia prima del mix (LUFS): una voce deve sentirsi sopra la musica, e la
 * musica stare sotto. Il volume dell'utente si applica dopo, quindi le proporzioni restano nelle sue mani.
 */
export const LEVEL_OF: Record<AudioTrackKind, number> = {
  dialogue: -16,
  native: -20,
  sfx: -20,
  music: -23,
};

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
 * I suoni che si sentono: una variante in uso, un posto nel film, una traccia non muta e un volume. Solo
 * di questi serve il file: uno che non si sentirebbe non deve poter fermare il film.
 */
export function heardClips(
  clips: readonly AudioClip[],
  tracks: readonly AudioTrack[],
  timeline: AudioTimeline,
): AudioClip[] {
  const trackOf = new Map<AudioTrackKind, AudioTrack>(tracks.map((track) => [track.kind, track]));
  return clips.filter((clip) => {
    const track = trackOf.get(clip.kind);
    return (
      track !== undefined &&
      !track.muted &&
      track.volume * clip.volume > 0 &&
      clip.chosenVariantId !== undefined &&
      timeline.placements[clip.id] !== undefined
    );
  });
}

/**
 * Cosa entra nel mix e dove (T5.7, D24). È una funzione pura, così si prova senza ffmpeg. Le posizioni
 * vengono dalla linea del tempo, fatta con le durate vere delle clip: un video un po' più lungo del
 * previsto non sposta i suoni dopo di lui.
 */
export function planMix(input: MixPlanInput): MixSound[] {
  const { timeline, clips, tracks, files, offsetS } = input;
  const trackOf = new Map<AudioTrackKind, AudioTrack>(tracks.map((track) => [track.kind, track]));
  const heard = heardClips(clips, tracks, timeline).filter((clip) => files[clip.id] !== undefined);

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
    if (placedS <= 0) return [];
    const startS = offsetS + placement.startS;
    const levelLufs = LEVEL_OF[clip.kind];

    if (clip.kind !== 'music') {
      return [
        {
          file: file.file,
          startS,
          durationS: placedS,
          volume,
          fadeInS: fitFade(clip.fadeInS, placedS),
          fadeOutS: fitFade(clip.fadeOutS, placedS),
          levelLufs,
        },
      ];
    }

    // Se dopo c'è un'altra musica questa continua un po' sotto di lei, se il file lo permette. Una musica
    // che finisce prima della fine della scena non ha niente con cui incrociarsi.
    const scene = timeline.scenes.find(({ sceneId }) => sceneId === clip.sceneId);
    const reachesEnd = scene !== undefined && placedS >= scene.durationS;
    const overlapS =
      reachesEnd && neighbour(clip.sceneId, 1)
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
        levelLufs,
      },
    ];
  });
}

/** Una dissolvenza non occupa più di metà del suono: entrata e uscita non si devono pestare. */
function fitFade(fadeS: number, durationS: number): number {
  return Math.min(fadeS, durationS / 2);
}
