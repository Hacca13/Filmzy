import type { AssemblyView } from '@filmzy/contracts';
import { useCallback, useEffect, useRef } from 'react';

import { fetchAssembly, startAssembly } from '../../api/assembly';
import { assetUrl } from '../../api/sheet';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { useWatched } from '../use-watched';
import { ExportSection } from './ExportSection';
import { assemblyFailureText, assemblyIsWorking, gapText } from './assembly-model';

/**
 * «Il tuo film» (T5.7, §9): mette in fila i video scelti, mixa le tracce e aggiunge i titoli con la
 * dicitura AI. Lavora sul computer dell'utente, quindi non costa niente e si può rifare quante volte si
 * vuole. `stamp` cambia quando cambia qualcosa nel film: si rilegge se il film montato è rimasto indietro.
 */
export function AssemblySection({ filmId, stamp }: { filmId: string; stamp: unknown }) {
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

/** Quello che si vede del montaggio: senza stato, così si prova da solo. */
export function AssemblyBody({
  view,
  busy,
  onStart,
}: {
  view: AssemblyView;
  busy: boolean;
  onStart: () => void;
}) {
  const { latest, film, gaps, titles, upToDate, exportWorking } = view;
  const working = assemblyIsWorking(view);
  const made = film?.assetId;

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

      {gaps.length === 0 ? null : (
        <div>
          <p className="hint">Per montare il film manca ancora:</p>
          <ul className="sound-orphans">
            {gaps.map((gap) => (
              <li key={`${String(gap.sceneNumber ?? 0)}:${gap.kind}`}>{gapText(gap)}</li>
            ))}
          </ul>
        </div>
      )}

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

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || working || exportWorking || gaps.length > 0}
          onClick={onStart}
        >
          {made === undefined ? 'Monta il film' : 'Monta di nuovo'}
        </button>
      </div>
      <p className="hint">Lavora sul tuo computer: non costa niente e non rifà i video.</p>
    </>
  );
}
