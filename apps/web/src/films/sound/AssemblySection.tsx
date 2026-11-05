import type { AssemblyScene, AssemblyView } from '@filmzy/contracts';
import { useCallback, useEffect, useRef } from 'react';

import { fetchAssembly, setAssemblyScene, startAssembly } from '../../api/assembly';
import { assetUrl } from '../../api/sheet';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { formatDuration } from '../model';
import { useWatched } from '../use-watched';
import { EarlierFilms } from './EarlierFilms';
import { ExportSection } from './ExportSection';
import { assemblyFailureText, assemblyIsWorking, filmLengthLine, gapText } from './assembly-model';

/**
 * «Il tuo film» (T5.7, §9): mette in fila i video scelti, mixa le tracce e aggiunge i titoli con la
 * dicitura AI. Lavora sul computer dell'utente, quindi non costa niente e si può rifare quante volte si
 * vuole. `stamp` cambia quando cambia qualcosa nel film: si rilegge se il film montato è rimasto indietro.
 * `onScenesChanged` avvisa le tracce: seguono le scene spuntate (D85).
 */
export function AssemblySection({
  filmId,
  stamp,
  onScenesChanged,
}: {
  filmId: string;
  stamp: unknown;
  onScenesChanged: () => Promise<void>;
}) {
  const load = useCallback((signal: AbortSignal) => fetchAssembly(filmId, signal), [filmId]);
  const { value, problem, reload, setValue } = useWatched(load, assemblyIsWorking, {
    kinds: ['film_assemble', 'film_export'],
    projectId: filmId,
  });
  const action = useAction();

  const firstStamp = useRef(stamp);
  useEffect(() => {
    if (stamp === firstStamp.current) return;
    firstStamp.current = stamp;
    void reload();
  }, [stamp, reload]);

  return (
    <>
      <section className="sheet sound-film" aria-label="Il tuo film">
        <h3>Il tuo film</h3>
        {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
        {value === undefined ? (
          problem === undefined ? (
            <p className="hint">Un attimo…</p>
          ) : null
        ) : (
          <AssemblyBody
            view={value}
            busy={action.busy}
            onToggleScene={(sceneNumber, included) => {
              action.run(async () => {
                try {
                  setValue(await setAssemblyScene(filmId, sceneNumber, { included }));
                  await onScenesChanged();
                } catch (error) {
                  // Il server dice che non si può, o che sta lavorando: l'elenco deve dire lo stesso.
                  await reload();
                  throw error;
                }
              });
            }}
            onStart={() => {
              action.run(async () => {
                try {
                  setValue(await startAssembly(filmId));
                } catch (error) {
                  // Il server dice che manca qualcosa o che sta già lavorando: l'elenco deve dire lo stesso.
                  await reload();
                  throw error;
                }
              });
            }}
          />
        )}
        {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      </section>
      {value === undefined || value.earlier.length === 0 ? null : (
        <EarlierFilms filmId={filmId} films={value.earlier} onRemoved={reload} />
      )}
      {value?.film === undefined ? null : (
        <ExportSection
          filmId={filmId}
          behind={!value.upToDate}
          mounting={assemblyIsWorking(value)}
        />
      )}
    </>
  );
}

/** Una scena nell'elenco: con la spunta, oppure con cosa le manca e il modo di andarci. */
function SceneRow({
  scene,
  locked,
  onToggle,
}: {
  scene: AssemblyScene;
  locked: boolean;
  onToggle: (included: boolean) => void;
}) {
  const { sceneNumber, heading, durationS, previewAssetId, included, gap } = scene;
  const name = `Scena ${String(sceneNumber)} · ${heading}`;
  return (
    <li className="film-scene" data-included={included} data-ready={gap === undefined}>
      <label>
        <input
          type="checkbox"
          checked={included}
          disabled={locked || gap !== undefined}
          aria-label={name}
          onChange={(event) => {
            onToggle(event.target.checked);
          }}
        />
        {previewAssetId === undefined ? (
          <span className="film-scene-preview" />
        ) : (
          <video
            className="film-scene-preview"
            muted
            preload="metadata"
            aria-hidden="true"
            // Il primo fotogramma può essere nero: si guarda un attimo dopo.
            src={`${assetUrl(previewAssetId)}#t=0.1`}
          />
        )}
        <span className="film-scene-text">
          <span className="film-scene-name">{name}</span>
          {gap === undefined ? null : <span className="hint">{gapText(gap)}</span>}
          {gap === undefined && !included ? <span className="chip">Tolta da te</span> : null}
        </span>
      </label>
      {gap === undefined ? (
        <span className="hint">{formatDuration(Math.round(durationS))}</span>
      ) : (
        <button
          type="button"
          className="button"
          onClick={() => {
            document
              .getElementById(`scena-${String(sceneNumber)}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Vai alla scena
        </button>
      )}
    </li>
  );
}

/** Quello che si vede del montaggio: senza stato, così si prova da solo. */
export function AssemblyBody({
  view,
  busy,
  onToggleScene,
  onStart,
}: {
  view: AssemblyView;
  busy: boolean;
  onToggleScene: (sceneNumber: number, included: boolean) => void;
  onStart: () => void;
}) {
  const { latest, film, scenes, titles, upToDate, exportWorking } = view;
  const working = assemblyIsWorking(view);
  const made = film?.assetId;
  const noneTicked = !scenes.some((scene) => scene.included);

  return (
    <>
      {made === undefined ? null : (
        <video className="take-video" controls preload="metadata" src={assetUrl(made)} />
      )}
      {made !== undefined && !upToDate && !working ? (
        <Notice tone="info">
          Dopo questo montaggio hai cambiato qualcosa: monta di nuovo per vederlo nel film.
        </Notice>
      ) : null}
      {working ? <p className="hint">Sto montando il film… Può volerci qualche minuto.</p> : null}
      {exportWorking ? (
        <p className="hint">Il film si sta esportando: potrai montarlo quando ha finito.</p>
      ) : null}
      {latest?.status === 'failed' ? (
        <Notice tone="error">{assemblyFailureText(latest.errorCode)}</Notice>
      ) : null}

      <dl className="details">
        <div>
          <dt>Titolo</dt>
          <dd>{titles.title}</dd>
        </div>
        {titles.cast === undefined ? null : (
          <div>
            <dt>Titoli di coda</dt>
            <dd>{titles.cast}</dd>
          </div>
        )}
        <div>
          <dt>Dicitura</dt>
          <dd>{titles.aiNotice}</dd>
        </div>
      </dl>

      <h4>Le scene del film</h4>
      {scenes.length === 0 ? (
        <p className="hint">La storia non ha ancora nessuna scena.</p>
      ) : (
        <>
          <p className="hint">
            Scegli quali scene entrano nel film. Una scena tolta non si cancella: la rimetti quando
            vuoi, con i suoi video e i suoi suoni.
          </p>
          <ul className="film-scenes">
            {scenes.map((scene) => (
              <SceneRow
                key={scene.sceneNumber}
                scene={scene}
                locked={busy || working}
                onToggle={(included) => {
                  onToggleScene(scene.sceneNumber, included);
                }}
              />
            ))}
          </ul>
          <p className="hint">{filmLengthLine(view)}</p>
        </>
      )}
      {scenes.length > 0 && noneTicked && !working ? (
        <p className="hint">Scegli almeno una scena.</p>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="button"
          {...(made !== undefined && upToDate ? {} : { 'data-kind': 'primary' })}
          disabled={busy || working || exportWorking || noneTicked}
          onClick={onStart}
        >
          {working ? 'Montaggio in corso' : made === undefined ? 'Monta il film' : 'Monta di nuovo'}
        </button>
      </div>
      <p className="hint">Lavora sul tuo computer: non costa niente e non rifà i video.</p>
    </>
  );
}
