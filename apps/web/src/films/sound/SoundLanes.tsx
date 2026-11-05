import type { AudioClip, AudioTrack, AudioTrackKind } from '@filmzy/contracts';
import { useEffect, useState, type ReactNode } from 'react';

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
  stackRows,
} from './model';

/** Quanto occupa una riga di blocchi sulla traccia (px), e il margine sopra e sotto: come nel foglio di stile. */
const ROW_PX = 56;
const LANE_PADDING_PX = 8;

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

  // I blocchi di una traccia, nelle loro righe: due suoni nello stesso momento non si coprono.
  const placedBlocks = (kind: AudioTrackKind) => {
    const placed = clips.flatMap((clip) => {
      const placement = timeline.placements[clip.id];
      return clip.kind === kind && placement !== undefined ? [{ clip, placement }] : [];
    });
    const { rows, count } = stackRows(
      placed.map(({ clip, placement }) => ({ id: clip.id, ...placement })),
    );
    return {
      count,
      blocks: placed.map(({ clip, placement }) => (
        <SoundBlock
          key={clip.id}
          clip={clip}
          filmS={filmS}
          startS={placement.startS}
          durationS={placement.durationS}
          row={rows[clip.id] ?? 0}
          selected={clip.id === selectedId}
          onSelect={onSelect}
        />
      )),
    };
  };

  return (
    <div className="sound-lanes">
      <div className="sound-ruler" aria-hidden="true">
        {rulerMarks(filmS).map((mark) => (
          <span key={mark}>{formatClock(mark)}</span>
        ))}
      </div>

      {tracks.map((track) => {
        const placed = placedBlocks(track.kind);
        return (
          <Lane
            key={track.id}
            track={track}
            busy={busy}
            rows={placed.count}
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
              <LaneBlocks blocks={placed.blocks} empty={LANE_TEXTS[track.kind].empty} />
            )}
          </Lane>
        );
      })}
    </div>
  );
}

function Lane({
  track,
  busy,
  rows,
  onTrackChange,
  action,
  children,
}: {
  track: AudioTrack;
  busy: boolean;
  /** Quante righe di blocchi servono: la traccia si allunga per mostrarle tutte. */
  rows: number;
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
          label={`Volume di ${label}`}
          volume={track.volume}
          onCommit={(volume) => {
            onTrackChange(track.id, { volume });
          }}
        />
        {action}
      </div>
      <div
        className="sound-lane-blocks"
        style={
          rows > 1 ? { minHeight: `${String(rows * ROW_PX + LANE_PADDING_PX * 2)}px` } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Il volume si salva quando l'utente lascia il cursore, non a ogni spostamento. Il cursore non si spegne
 * mentre si salva: perderebbe il punto, e chi usa la tastiera dovrebbe tornarci a ogni tacca.
 */
function VolumeSlider({
  label,
  volume,
  onCommit,
}: {
  label: string;
  volume: number;
  onCommit: (volume: number) => void;
}) {
  const [value, setValue] = useState(volume);
  useEffect(() => {
    setValue(volume);
  }, [volume]);
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
  row,
  selected,
  onSelect,
}: {
  clip: AudioClip;
  filmS: number;
  startS: number;
  durationS: number;
  row: number;
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
      style={{
        ...placeStyle(startS, durationS, filmS),
        top: `${String(LANE_PADDING_PX + row * ROW_PX)}px`,
      }}
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
