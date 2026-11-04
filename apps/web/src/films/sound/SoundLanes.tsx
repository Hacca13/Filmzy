import type { AudioClip, AudioTrack, AudioTrackKind } from '@filmzy/contracts';
import { useState, type ReactNode } from 'react';

import type { SoundEditor } from '../../api/audio';
import { Toggle } from '../../components/ui';
import type { AddKind } from './AddSoundForm';
import {
  TRACK_LABELS,
  blockNote,
  blockState,
  formatClock,
  formatSeconds,
  percentOf,
  rulerMarks,
  sceneName,
} from './model';

/** Dove sta un blocco sulla traccia: tutto in percentuale della durata del film. */
const placeStyle = (startS: number, durationS: number, filmS: number) => ({
  left: `${String(percentOf(startS, filmS))}%`,
  width: `${String(percentOf(durationS, filmS))}%`,
});

interface LanesProps {
  editor: SoundEditor;
  selectedId: string | undefined;
  busy: boolean;
  onSelect: (clipId: string) => void;
  onAdd: (kind: AddKind) => void;
  onTrackChange: (trackId: string, patch: { muted?: boolean; volume?: number }) => void;
  onNativeAudio: (takeId: string, on: boolean) => void;
}

/**
 * Le quattro tracce sotto un solo righello (T5.6, D24): Video, Dialoghi, Musica ed Effetti, con muto e
 * volume. Le posizioni le dà il server; un clic su un blocco apre il suo pannello.
 */
export function SoundLanes({
  editor,
  selectedId,
  busy,
  onSelect,
  onAdd,
  onTrackChange,
  onNativeAudio,
}: LanesProps) {
  const { timeline, tracks, clips } = editor;
  const filmS = timeline.durationS;

  const placedBlocks = (kind: AudioTrackKind) =>
    clips
      .filter((clip) => clip.kind === kind && timeline.placements[clip.id] !== undefined)
      .map((clip) => (
        <SoundBlock
          key={clip.id}
          clip={clip}
          filmS={filmS}
          startS={timeline.placements[clip.id]?.startS ?? 0}
          durationS={timeline.placements[clip.id]?.durationS ?? 0}
          selected={clip.id === selectedId}
          onSelect={onSelect}
        />
      ));

  return (
    <div className="sound-lanes">
      <div className="sound-ruler" aria-hidden="true">
        {rulerMarks(filmS).map((mark) => (
          <span key={mark}>{formatClock(mark)}</span>
        ))}
      </div>

      {tracks.map((track) => (
        <Lane
          key={track.id}
          track={track}
          busy={busy}
          onTrackChange={onTrackChange}
          action={
            track.kind === 'native' ? undefined : (
              <button
                type="button"
                className="button"
                onClick={() => {
                  onAdd(track.kind as AddKind);
                }}
              >
                {LANE_TEXTS[track.kind].add}
              </button>
            )
          }
        >
          {track.kind === 'native' ? (
            timeline.shots.length === 0 ? (
              <p className="sound-empty">Nessuna inquadratura: pensale prima nella scena.</p>
            ) : (
              timeline.shots.map((shot) => (
                <div
                  key={shot.shotId}
                  className="sound-block"
                  data-kind="video"
                  data-ready={shot.takeId !== undefined}
                  style={placeStyle(shot.startS, shot.durationS, filmS)}
                  title={`${sceneName(timeline, shot.sceneId)} · ${shot.action}`}
                >
                  <span className="sound-block-title">{shot.action}</span>
                  <span className="sound-block-note">
                    {shot.takeId === undefined ? 'Da girare' : formatSeconds(shot.durationS)}
                  </span>
                  {shot.takeId === undefined ? null : (
                    <NativeAudioButton
                      on={shot.nativeAudio}
                      disabled={busy}
                      onToggle={() => {
                        if (shot.takeId !== undefined)
                          onNativeAudio(shot.takeId, !shot.nativeAudio);
                      }}
                    />
                  )}
                </div>
              ))
            )
          ) : (
            <LaneBlocks blocks={placedBlocks(track.kind)} empty={LANE_TEXTS[track.kind].empty} />
          )}
        </Lane>
      ))}
    </div>
  );
}

function Lane({
  track,
  busy,
  onTrackChange,
  action,
  children,
}: {
  track: AudioTrack;
  busy: boolean;
  onTrackChange: LanesProps['onTrackChange'];
  action: ReactNode;
  children: ReactNode;
}) {
  const label = TRACK_LABELS[track.kind];
  return (
    <div className="sound-lane" role="group" data-kind={track.kind} aria-label={label}>
      <div className="sound-lane-controls">
        <strong>{label}</strong>
        <Toggle
          label="Muto"
          checked={track.muted}
          disabled={busy}
          onChange={(muted) => {
            onTrackChange(track.id, { muted });
          }}
        />
        <VolumeSlider
          key={track.volume}
          label={`Volume di ${label}`}
          volume={track.volume}
          disabled={busy}
          onCommit={(volume) => {
            onTrackChange(track.id, { volume });
          }}
        />
        {action}
      </div>
      <div className="sound-lane-blocks">{children}</div>
    </div>
  );
}

/** Il volume si salva quando l'utente lascia il cursore, non a ogni spostamento. */
function VolumeSlider({
  label,
  volume,
  disabled,
  onCommit,
}: {
  label: string;
  volume: number;
  disabled: boolean;
  onCommit: (volume: number) => void;
}) {
  const [value, setValue] = useState(volume);
  const commit = () => {
    if (value !== volume) onCommit(value);
  };
  return (
    <input
      type="range"
      className="sound-volume"
      aria-label={label}
      min={0}
      max={1}
      step={0.05}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        setValue(Number(event.target.value));
      }}
      onPointerUp={commit}
      onKeyUp={commit}
      onBlur={commit}
    />
  );
}

/** L'icona dell'audio originale di una clip: parte spenta, e si cambia senza rigenerare (D43). */
function NativeAudioButton({
  on,
  disabled,
  onToggle,
}: {
  on: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const text = on ? 'Audio originale acceso' : 'Audio originale spento';
  return (
    <button
      type="button"
      className="sound-speaker"
      aria-pressed={on}
      aria-label={text}
      title={text}
      disabled={disabled}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7" /> : <path d="m16 9 6 6m0-6-6 6" />}
      </svg>
    </button>
  );
}

function SoundBlock({
  clip,
  filmS,
  startS,
  durationS,
  selected,
  onSelect,
}: {
  clip: AudioClip;
  filmS: number;
  startS: number;
  durationS: number;
  selected: boolean;
  onSelect: (clipId: string) => void;
}) {
  const note = blockNote(clip);
  return (
    <button
      type="button"
      className="sound-block"
      data-kind={clip.kind}
      data-state={blockState(clip)}
      aria-pressed={selected}
      style={placeStyle(startS, durationS, filmS)}
      title={clip.description}
      onClick={() => {
        onSelect(clip.id);
      }}
    >
      <span className="sound-block-title">{clip.description}</span>
      <span className="sound-block-note">{note ?? formatSeconds(durationS)}</span>
    </button>
  );
}

const LANE_TEXTS: Record<Exclude<AudioTrackKind, 'native'>, { empty: string; add: string }> = {
  dialogue: {
    empty:
      'Per ora i personaggi non parlano: puoi aggiungere una voce fuori campo, e le labbra non la seguono. Le voci dei personaggi arrivano più avanti.',
    add: 'Carica una registrazione',
  },
  music: { empty: 'Nessuna musica: aggiungi la prima', add: '+ Aggiungi una musica' },
  sfx: { empty: 'Nessun effetto: aggiungi il primo', add: '+ Aggiungi un suono' },
};

/** I blocchi della traccia o, finché è vuota, la frase che spiega cosa ci va. */
function LaneBlocks({ blocks, empty }: { blocks: readonly ReactNode[]; empty: string }) {
  return blocks.length === 0 ? <p className="sound-empty">{empty}</p> : <>{blocks}</>;
}
