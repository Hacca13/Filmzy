import { MOODBOARD_NOTES_MAX_CHARS, type MoodboardView } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { fetchMoodboard, saveMoodboardPart } from '../../api/moodboard';
import { Chip, Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useAction } from '../../settings/use-action';
import {
  addColor,
  canAddColor,
  changeColor,
  partOf,
  removeColor,
  samePart,
  type PartText,
} from './palette';

const WHOLE_FILM = 'film';

/**
 * «Moodboard» (T4.10, D37): facoltativo ma consigliato. Colori, consigli (luce, colore, macchina,
 * ritmo) e, nei passi dopo, immagini di riferimento: per tutto il film, o per una scena che ha
 * un'atmosfera sua. Senza moodboard il film funziona come prima. Si corregge sempre a mano.
 */
export function MoodboardPanel({ filmId }: { filmId: string }) {
  const load = useCallback((signal: AbortSignal) => fetchMoodboard(filmId, signal), [filmId]);
  const { state, setData } = useResource(load);
  const [target, setTarget] = useState(WHOLE_FILM);

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const view = state.data;
  // Spenta, la funzione non si offre.
  if (!view.enabled) return null;

  const sceneId = target === WHOLE_FILM ? undefined : target;
  return (
    <section className="panel moodboard" aria-label="Moodboard">
      <h2>Moodboard</h2>
      <p className="hint">
        Facoltativo, ma consigliato: i colori e l’atmosfera del film aiutano a tenerlo coerente.
        Vale per tutto il film; una scena con un’atmosfera sua può avere una parte propria.
      </p>

      {view.scenes.length === 0 ? null : (
        <>
          <label htmlFor="moodboard-per">Per</label>
          <select
            id="moodboard-per"
            value={target}
            onChange={(event) => {
              setTarget(event.target.value);
            }}
          >
            <option value={WHOLE_FILM}>Tutto il film</option>
            {view.scenes.map((scene) => (
              <option key={scene.sceneId} value={scene.sceneId}>
                {`Scena ${String(scene.number)} · ${scene.heading}`}
              </option>
            ))}
          </select>
        </>
      )}

      <PartEditor key={target} filmId={filmId} view={view} sceneId={sceneId} onSaved={setData} />
    </section>
  );
}

/** I colori e i consigli di una parte, da modificare e salvare. */
function PartEditor({
  filmId,
  view,
  sceneId,
  onSaved,
}: {
  filmId: string;
  view: MoodboardView;
  sceneId: string | undefined;
  onSaved: (view: MoodboardView) => void;
}) {
  const saved = partOf(view.moodboard, sceneId);
  const [draft, setDraft] = useState<PartText>(saved);
  const [justSaved, setJustSaved] = useState(false);
  const action = useAction();
  const unchanged = samePart(draft, saved);
  const idBase = sceneId ?? WHOLE_FILM;

  const edit = (next: PartText) => {
    setDraft(next);
    setJustSaved(false);
  };

  return (
    <div className="moodboard-part">
      {sceneId === undefined ? null : (
        <p className="hint">
          Se la scena non ha una parte sua, vale quella del film. Lasciala vuota per tornare a
          quella.
        </p>
      )}

      <fieldset className="moodboard-palette">
        <legend>Colori</legend>
        {draft.palette.length === 0 ? (
          <p className="hint">Nessun colore. Aggiungine fino a otto.</p>
        ) : null}
        {draft.palette.map((color, index) => (
          <div key={index} className="palette-row">
            <input
              type="color"
              aria-label={`Colore ${String(index + 1)}`}
              value={color.hex}
              onChange={(event) => {
                edit({
                  ...draft,
                  palette: changeColor(draft.palette, index, { hex: event.target.value }),
                });
              }}
            />
            <input
              type="text"
              aria-label={`Nome del colore ${String(index + 1)}`}
              placeholder="Un nome, se vuoi (per esempio «ambra»)"
              maxLength={40}
              value={color.name ?? ''}
              onChange={(event) => {
                edit({
                  ...draft,
                  palette: changeColor(draft.palette, index, { name: event.target.value }),
                });
              }}
            />
            <button
              type="button"
              className="button"
              onClick={() => {
                edit({ ...draft, palette: removeColor(draft.palette, index) });
              }}
            >
              Togli
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button"
          disabled={!canAddColor(draft.palette)}
          onClick={() => {
            edit({ ...draft, palette: addColor(draft.palette) });
          }}
        >
          Aggiungi un colore
        </button>
      </fieldset>

      <label htmlFor={`moodboard-consigli-${idBase}`}>Consigli</label>
      <textarea
        id={`moodboard-consigli-${idBase}`}
        rows={4}
        maxLength={MOODBOARD_NOTES_MAX_CHARS}
        placeholder="Luce, colore, macchina da presa, ritmo… con parole tue."
        value={draft.notes}
        onChange={(event) => {
          edit({ ...draft, notes: event.target.value });
        }}
      />

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={action.busy || unchanged}
          onClick={() => {
            action.run(async () => {
              const next = await saveMoodboardPart(filmId, {
                ...(sceneId === undefined ? {} : { sceneId }),
                palette: [...draft.palette],
                notes: draft.notes,
              });
              onSaved(next);
              setJustSaved(true);
            });
          }}
        >
          Salva
        </button>
        {justSaved ? <Chip tone="confirmed">Salvato</Chip> : null}
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </div>
  );
}
