import type { AudioClip } from '@filmzy/contracts';
import { useState } from 'react';

import type { SoundEditor } from '../../api/audio';
import { createAudioClip, uploadAudioClip } from '../../api/audio';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { AudioFilePicker } from './AudioFilePicker';
import {
  describeAudioError,
  formatSeconds,
  sceneName,
  scenesWithoutMusic,
  shotName,
  shotsForEffects,
} from './model';

const DEFAULT_EFFECT_S = 2;

export type AddKind = 'dialogue' | 'music' | 'sfx';

const TITLES: Record<AddKind, string> = {
  dialogue: 'Una registrazione',
  music: 'Una musica',
  sfx: 'Un effetto',
};

/**
 * Un blocco nuovo sulla traccia (T5.6). Musica ed effetti nascono senza suono e non costano niente:
 * «Genera» sta nel pannello che si apre dopo. Una registrazione è un file dell'utente (D27).
 */
export function AddSoundForm({
  filmId,
  kind,
  editor,
  onAdded,
  onCancel,
}: {
  filmId: string;
  kind: AddKind;
  editor: SoundEditor;
  onAdded: (clip: AudioClip) => Promise<void>;
  onCancel: () => void;
}) {
  const { timeline, clips } = editor;
  const scenes = kind === 'music' ? scenesWithoutMusic(timeline, clips) : timeline.scenes;
  const shots = shotsForEffects(timeline);
  const action = useAction();

  const [sceneId, setSceneId] = useState(scenes[0]?.sceneId ?? '');
  const [shotId, setShotId] = useState(shots[0]?.shotId ?? '');
  const [description, setDescription] = useState('');
  const [startS, setStartS] = useState('0');

  const scene = scenes.find((candidate) => candidate.sceneId === sceneId);
  const shot = shots.find((candidate) => candidate.shotId === shotId);
  const text = description.trim();
  const start = Number(startS);
  const startValid = startS.trim() !== '' && Number.isFinite(start) && start >= 0;

  // Dice perché non si può aggiungere, se è così: sono le regole del server, viste prima di chiedere.
  const unavailable =
    kind === 'music' && scenes.length === 0
      ? 'Ogni scena ha già la sua musica: per cambiarla apri il suo blocco.'
      : kind === 'sfx' && shots.length === 0
        ? 'Gli effetti si agganciano alle inquadrature: pensa prima quelle di una scena.'
        : kind === 'dialogue' && scenes.length === 0
          ? 'Scrivi prima la sceneggiatura finale.'
          : undefined;

  const add = () => {
    action.run(async () => {
      if (kind === 'music' && scene !== undefined) {
        await onAdded(
          await createAudioClip(filmId, {
            kind: 'music',
            sceneId: scene.sceneId,
            durationS: scene.durationS,
            description: text,
          }),
        );
      } else if (kind === 'sfx' && shot !== undefined) {
        await onAdded(
          await createAudioClip(filmId, {
            kind: 'sfx',
            sceneId: shot.sceneId,
            shotId: shot.shotId,
            startS: start,
            durationS: DEFAULT_EFFECT_S,
            description: text,
          }),
        );
      }
    }, describeAudioError);
  };

  const upload = (file: File) => {
    if (scene === undefined) return;
    action.run(async () => {
      await onAdded(
        await uploadAudioClip(
          filmId,
          { kind: 'dialogue', sceneId: scene.sceneId, startS: start, description: text },
          file,
        ),
      );
    }, describeAudioError);
  };

  return (
    <aside className="sound-panel" aria-label="Un suono nuovo">
      <div className="panel-head">
        <h4>{TITLES[kind]}</h4>
        <button type="button" className="icon-button" aria-label="Chiudi" onClick={onCancel}>
          ×
        </button>
      </div>

      {unavailable !== undefined ? (
        <Notice tone="info">{unavailable}</Notice>
      ) : (
        <>
          {kind === 'sfx' ? (
            <div className="field">
              <label htmlFor="suono-inquadratura">Inquadratura</label>
              <select
                id="suono-inquadratura"
                value={shotId}
                onChange={(event) => {
                  setShotId(event.target.value);
                }}
              >
                {shots.map((candidate) => (
                  <option key={candidate.shotId} value={candidate.shotId}>
                    {shotName(timeline, candidate)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="suono-scena">Scena</label>
              <select
                id="suono-scena"
                value={sceneId}
                onChange={(event) => {
                  setSceneId(event.target.value);
                }}
              >
                {scenes.map((candidate) => (
                  <option key={candidate.sceneId} value={candidate.sceneId}>
                    {sceneName(timeline, candidate.sceneId)} · {formatSeconds(candidate.durationS)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="suono-descrizione">
              {kind === 'dialogue' ? 'Che cos’è? (per riconoscerla)' : 'Com’è questo suono?'}
            </label>
            <textarea
              id="suono-descrizione"
              rows={3}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
          </div>

          {kind === 'music' ? null : (
            <div className="field">
              <label htmlFor="suono-partenza">Parte al secondo</label>
              <input
                id="suono-partenza"
                type="number"
                min={0}
                step={0.1}
                value={startS}
                onChange={(event) => {
                  setStartS(event.target.value);
                }}
              />
            </div>
          )}

          {kind === 'dialogue' ? (
            <AudioFilePicker
              label="Carica una registrazione"
              disabled={action.busy || text === '' || !startValid}
              onPick={upload}
            />
          ) : (
            <div className="actions">
              <button
                type="button"
                className="button"
                data-kind="primary"
                disabled={action.busy || text === '' || !startValid}
                onClick={add}
              >
                Aggiungi
              </button>
            </div>
          )}
        </>
      )}

      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </aside>
  );
}
