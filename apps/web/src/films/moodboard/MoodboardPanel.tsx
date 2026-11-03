import {
  MOODBOARD_NOTES_MAX_CHARS,
  type MoodboardRun,
  type MoodboardView,
  type MoodReference,
} from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import {
  fetchMoodboard,
  fetchMoodboardOptions,
  generateMoodboard,
  removeMoodboardReference,
  saveMoodboardPart,
} from '../../api/moodboard';
import { assetUrl } from '../../api/sheet';
import { Chip, Notice, ToneIcon } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { failureText } from '../failure';
import { GenerateBar, useGeneration } from '../generation';
import { useWatched } from '../use-watched';
import {
  addColor,
  canAddColor,
  changeColor,
  partOf,
  referencesOf,
  removeColor,
  runIsWorking,
  samePart,
  type PartText,
} from './palette';

const WHOLE_FILM = 'film';

/**
 * «Moodboard» (T4.10, D37): facoltativo ma consigliato. Colori, consigli (luce, colore, macchina,
 * ritmo) e immagini di riferimento: per tutto il film, o per una scena che ha un'atmosfera sua.
 * Senza moodboard il film funziona come prima. Si può scrivere a mano o farlo creare («Crea il
 * moodboard», con la stima e «Cambia servizio» come ogni generazione), e si corregge sempre. Mentre
 * le immagini arrivano la pagina si aggiorna da sola.
 */
export function MoodboardPanel({ filmId }: { filmId: string }) {
  const load = useCallback((signal: AbortSignal) => fetchMoodboard(filmId, signal), [filmId]);
  const {
    value: view,
    setValue,
    problem,
  } = useWatched(load, runIsWorking, {
    kinds: ['moodboard_images'],
    projectId: filmId,
  });
  const [target, setTarget] = useState(WHOLE_FILM);

  if (view === undefined) {
    return problem === undefined ? (
      <p className="hint">Un attimo…</p>
    ) : (
      <Notice tone="error">{problem}</Notice>
    );
  }
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

      <PartEditor key={target} filmId={filmId} view={view} sceneId={sceneId} onChange={setValue} />
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </section>
  );
}

/** I colori, i consigli e le immagini di una parte: da modificare, salvare o far creare. */
function PartEditor({
  filmId,
  view,
  sceneId,
  onChange,
}: {
  filmId: string;
  view: MoodboardView;
  sceneId: string | undefined;
  onChange: (view: MoodboardView) => void;
}) {
  const saved = partOf(view.moodboard, sceneId);
  const [draft, setDraft] = useState<PartText>(saved);
  const [justSaved, setJustSaved] = useState(false);
  const action = useAction();
  const unchanged = samePart(draft, saved);
  const idBase = sceneId ?? WHOLE_FILM;
  const working = runIsWorking(view);

  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchMoodboardOptions(filmId, sceneId, signal),
    [filmId, sceneId],
  );
  const generation = useGeneration<MoodboardView>({
    loadOptions,
    start: (body) =>
      generateMoodboard(filmId, { ...(sceneId === undefined ? {} : { sceneId }), ...body }),
    // Colori e consigli nuovi sostituiscono quelli di prima: la bozza in modifica riparte da lì.
    onStarted: (next) => {
      onChange(next);
      setDraft(partOf(next.moodboard, sceneId));
      setJustSaved(false);
    },
  });

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

      <section className="sheet" aria-label="Crea il moodboard">
        <h5>Fallo creare a Filmzy</h5>
        <p className="hint">
          Propone i colori e i consigli (che sostituiscono quelli di questa parte) e crea alcune
          immagini di riferimento. Poi puoi correggere tutto a mano.
        </p>
        <GenerateBar generation={generation} createVerb="Crea il moodboard" disabled={working} />
        <RunState run={view.run} sceneId={sceneId} />
      </section>

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
              onChange(next);
              setJustSaved(true);
            });
          }}
        >
          Salva
        </button>
        {justSaved ? <Chip tone="confirmed">Salvato</Chip> : null}
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}

      <References
        references={referencesOf(view.moodboard, sceneId)}
        busy={action.busy}
        onRemove={(referenceId) => {
          action.run(async () => {
            onChange(await removeMoodboardReference(filmId, referenceId));
          });
        }}
      />
    </div>
  );
}

/** Come sta andando l'ultima richiesta di immagini, se riguarda questa parte. */
function RunState({
  run,
  sceneId,
}: {
  run: MoodboardRun | undefined;
  sceneId: string | undefined;
}) {
  if (run === undefined || run.sceneId !== sceneId) return null;
  if (run.status === 'queued' || run.status === 'running') {
    return <Chip tone="info">{`Sto creando le immagini… (${String(run.images)} fatte)`}</Chip>;
  }
  if (run.status === 'failed') {
    return (
      <div className="sheet-placeholder wide" data-tone="error">
        <ToneIcon tone="error" size={26} />
        {failureText(run.errorCode)}
      </div>
    );
  }
  return null;
}

/** Le immagini di riferimento di una parte: cosa mostrano, i loro colori e se entrano solo per l'analisi. */
function References({
  references,
  busy,
  onRemove,
}: {
  references: readonly MoodReference[];
  busy: boolean;
  onRemove: (referenceId: string) => void;
}) {
  if (references.length === 0) return null;
  return (
    <section className="moodboard-references" aria-label="Immagini di riferimento">
      <h5>Immagini di riferimento</h5>
      <div className="use-grid">
        {references.map((reference, index) => (
          <figure key={reference.id ?? reference.assetId}>
            <div className="use-picture">
              <img src={assetUrl(reference.assetId)} alt={`Riferimento ${String(index + 1)}`} />
              {reference.analysisOnly ? (
                <span className="use-chip">
                  <Chip tone="info">Solo per l’analisi</Chip>
                </span>
              ) : null}
            </div>
            <div className="palette-dots" aria-label="Colori dell’immagine">
              {reference.palette.map((color) => (
                <span
                  key={color.hex}
                  className="palette-dot"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
            <figcaption className="hint">{reference.description}</figcaption>
            {reference.id === undefined ? null : (
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() => {
                  if (reference.id !== undefined) onRemove(reference.id);
                }}
              >
                Togli
              </button>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
