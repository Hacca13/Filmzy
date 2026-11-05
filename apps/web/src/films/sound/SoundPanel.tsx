import type { AudioClip } from '@filmzy/contracts';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../../api/client';
import {
  fetchSoundEditor,
  setTakeNativeAudio,
  updateTrack,
  type SoundEditor,
} from '../../api/audio';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { formatDuration } from '../model';
import { useWatched } from '../use-watched';
import { AddSoundForm, type AddKind } from './AddSoundForm';
import { AssemblySection } from './AssemblySection';
import { ClipPanel } from './ClipPanel';
import { SoundLanes } from './SoundLanes';
import { SuggestSounds } from './SuggestSounds';
import { formatSceneCount, sceneName, soundIsWorking } from './model';

/** Senza la stesura finale non c'è ancora niente da montare: non è un errore. */
const NO_FINAL = null;

const isWorking = (value: SoundEditor | null) => value !== null && soundIsWorking(value);

/**
 * «Montaggio ed esporta» (T5.6, §3.1): le tracce del film sotto un solo righello. Il suono sta su tracce
 * separate dal video: cambiarlo non rigenera mai le clip. La logica sta nel server (regola 8), che
 * dice dove cade ogni blocco e cosa si può fare; qui si mostra e si chiede. `plansStamp` cambia quando le
 * inquadrature cambiano, così la linea del tempo non resta indietro.
 */
export function SoundPanel({ filmId, plansStamp }: { filmId: string; plansStamp: number }) {
  const load = useCallback(
    async (signal: AbortSignal): Promise<SoundEditor | null> => {
      try {
        return await fetchSoundEditor(filmId, signal);
      } catch (error) {
        if (error instanceof ApiError && error.serverCode === 'not_found') return NO_FINAL;
        throw error;
      }
    },
    [filmId],
  );
  const {
    value,
    problem,
    reload: refresh,
  } = useWatched(load, isWorking, {
    kinds: ['audio_generate', 'take_generate'],
    projectId: filmId,
  });

  const check = useAction();
  const firstStamp = useRef(plansStamp);
  useEffect(() => {
    if (plansStamp === firstStamp.current) return;
    firstStamp.current = plansStamp;
    void refresh();
  }, [plansStamp, refresh]);

  return (
    <section className="panel sound" id="montaggio">
      <h2>Montaggio ed esporta</h2>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {value === undefined ? (
        problem === undefined ? (
          <p className="hint">Un attimo…</p>
        ) : null
      ) : value === NO_FINAL ? (
        <>
          <p className="hint">
            Quando avrai la sceneggiatura finale, qui metti in fila il film e ne curi il suono.
          </p>
          <div className="actions">
            <button
              type="button"
              className="button"
              disabled={check.busy}
              onClick={() => {
                check.run(refresh);
              }}
            >
              Controlla di nuovo
            </button>
          </div>
        </>
      ) : (
        <SoundView filmId={filmId} editor={value} refresh={refresh} />
      )}
    </section>
  );
}

type Side = { mode: 'clip'; clipId: string } | { mode: 'add'; kind: AddKind } | undefined;

function SoundView({
  filmId,
  editor,
  refresh,
}: {
  filmId: string;
  editor: SoundEditor;
  refresh: () => Promise<void>;
}) {
  const { timeline, clips } = editor;
  const [side, setSide] = useState<Side>();
  const action = useAction();
  const selected = side?.mode === 'clip' ? clips.find(({ id }) => id === side.clipId) : undefined;
  // Il suono di una scena che non è nel film non è perso: torna con la scena (D85).
  const orphans = clips.filter(
    ({ id, sceneId }) =>
      timeline.placements[id] === undefined && !timeline.hiddenSceneIds.includes(sceneId),
  );

  const openNew = async (clip: AudioClip) => {
    await refresh();
    setSide({ mode: 'clip', clipId: clip.id });
  };

  return (
    <>
      <AssemblySection filmId={filmId} stamp={editor} onScenesChanged={refresh} />

      <div className="panel-head">
        <div>
          <h3>Montaggio multitraccia</h3>
          <p className="hint">
            {formatSceneCount(timeline.scenes.length)} ·{' '}
            {formatDuration(Math.round(timeline.durationS))}
          </p>
        </div>
      </div>
      <p className="hint">
        Il suono sta su tracce separate dal video: puoi cambiarlo quante volte vuoi senza rifare le
        clip.
      </p>

      <SuggestSounds filmId={filmId} editor={editor} onAccepted={refresh} />

      {orphans.length === 0 ? null : (
        <Notice tone="info" title="Questi suoni hanno perso il loro posto">
          La scena o l’inquadratura è cambiata, quindi non si sentono nel film. Aprili per
          eliminarli.
          <ul className="sound-orphans">
            {orphans.map((clip) => (
              <li key={clip.id}>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setSide({ mode: 'clip', clipId: clip.id });
                  }}
                >
                  {clip.description}
                </button>
              </li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="sound-editor" data-open={side !== undefined}>
        <SoundLanes
          editor={editor}
          selectedId={selected?.id}
          busy={action.busy}
          onSelect={(clipId) => {
            setSide({ mode: 'clip', clipId });
          }}
          onAdd={(kind) => {
            setSide({ mode: 'add', kind });
          }}
          onTrackChange={(trackId, patch) => {
            action.run(async () => {
              await updateTrack(filmId, trackId, patch);
              await refresh();
            });
          }}
          onNativeAudio={(takeId, on) => {
            action.run(async () => {
              await setTakeNativeAudio(filmId, takeId, on);
              await refresh();
            });
          }}
        />

        {selected !== undefined ? (
          <ClipPanel
            key={selected.id}
            filmId={filmId}
            clip={selected}
            placed={timeline.placements[selected.id] !== undefined}
            placeName={sceneName(timeline, selected.sceneId)}
            onChanged={refresh}
            onRemoved={async () => {
              setSide(undefined);
              await refresh();
            }}
            onClose={() => {
              setSide(undefined);
            }}
          />
        ) : side?.mode === 'add' ? (
          <AddSoundForm
            key={side.kind}
            filmId={filmId}
            kind={side.kind}
            editor={editor}
            onAdded={openNew}
            onCancel={() => {
              setSide(undefined);
            }}
          />
        ) : null}
      </div>

      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </>
  );
}
