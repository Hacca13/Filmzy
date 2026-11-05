import type { ExportView } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { exportFileUrl, fetchExport, openExportFolder, startExport } from '../../api/exports';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { useWatched } from '../use-watched';
import {
  exportFailureText,
  exportIsWorking,
  formatLabel,
  openFolderFailureText,
  qualityLabel,
} from './export-model';

/**
 * «Esporta il film» (T5.8, §9): il file finale alla qualità scelta, nella cartella del film. Lavora sul
 * computer dell'utente, quindi non costa niente. Ascolta anche il montaggio: un film nuovo cambia le qualità
 * possibili e rende indietro il file già fatto.
 */
export function ExportSection({ filmId, behind }: { filmId: string; behind: boolean }) {
  const load = useCallback((signal: AbortSignal) => fetchExport(filmId, signal), [filmId]);
  const { value, problem, reload, setValue } = useWatched(load, exportIsWorking, {
    kinds: ['film_export', 'film_assemble'],
    projectId: filmId,
  });
  const starting = useAction();
  const opening = useAction();
  const [chosen, setChosen] = useState<number>();

  return (
    <section className="sheet sound-film" aria-label="Esporta il film">
      <h3>Esporta il film</h3>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {value === undefined ? (
        problem === undefined ? (
          <p className="hint">Un attimo…</p>
        ) : null
      ) : (
        <ExportBody
          filmId={filmId}
          view={value}
          behind={behind}
          chosen={chosen}
          busy={starting.busy}
          opening={opening.busy}
          onChoose={setChosen}
          onStart={(shortSide) => {
            starting.run(async () => {
              try {
                setValue(await startExport(filmId, { shortSide }));
              } catch (error) {
                // Il server dice che non si può o che sta già lavorando: la pagina deve dire lo stesso.
                await reload();
                throw error;
              }
            });
          }}
          onOpenFolder={() => {
            opening.run(() => openExportFolder(filmId), openFolderFailureText);
          }}
        />
      )}
      {starting.problem === undefined ? null : <Notice tone="error">{starting.problem}</Notice>}
      {opening.problem === undefined ? null : <Notice tone="error">{opening.problem}</Notice>}
    </section>
  );
}

/** Quello che si vede dell'esportazione: senza stato, così si prova da solo. */
export function ExportBody({
  filmId,
  view,
  behind,
  chosen,
  busy,
  opening,
  onChoose,
  onStart,
  onOpenFolder,
}: {
  filmId: string;
  view: ExportView;
  /** Dopo l'ultimo montaggio è cambiato qualcosa nel film. */
  behind: boolean;
  chosen: number | undefined;
  busy: boolean;
  opening: boolean;
  onChoose: (shortSide: number) => void;
  onStart: (shortSide: number) => void;
  onOpenFolder: () => void;
}) {
  const { source, latest, file } = view;
  const working = exportIsWorking(view);

  if (source === undefined) {
    return <Notice tone="info">Il film montato non c’è più sul computer: montalo di nuovo.</Notice>;
  }
  // Una scelta di prima può non valere più: un film nuovo può avere altre qualità.
  const quality =
    chosen !== undefined && source.qualities.includes(chosen) ? chosen : source.qualities[0];

  return (
    <>
      <div className="field">
        <label htmlFor="export-quality">Qualità di esportazione</label>
        <select
          id="export-quality"
          value={quality}
          disabled={working}
          onChange={(event) => {
            onChoose(Number(event.target.value));
          }}
        >
          {source.qualities.map((shortSide) => (
            <option key={shortSide} value={shortSide}>
              {qualityLabel(shortSide)}
            </option>
          ))}
        </select>
      </div>
      <dl className="details">
        <div>
          <dt>Formato</dt>
          <dd>{formatLabel(source)}</dd>
        </div>
      </dl>
      {behind ? (
        <p className="hint">Esporti l’ultimo film montato: le modifiche fatte dopo non ci sono.</p>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || working || quality === undefined}
          onClick={() => {
            if (quality !== undefined) onStart(quality);
          }}
        >
          Esporta il film
        </button>
      </div>

      {working ? <p className="hint">Sto esportando il film… Può volerci qualche minuto.</p> : null}
      {latest?.status === 'failed' ? (
        <Notice tone="error">{exportFailureText(latest.errorCode)}</Notice>
      ) : null}

      {file === undefined || working ? null : (
        <div className="sheet export-done">
          <h4>Esportazione completata</h4>
          <p>Il tuo film è pronto da guardare.</p>
          {file.current ? null : (
            <Notice tone="info">
              Questo file viene da un montaggio di prima: esporta di nuovo per avere l’ultimo.
            </Notice>
          )}
          <div className="field">
            <label htmlFor="export-path">Percorso · sola lettura</label>
            <input id="export-path" type="text" readOnly value={file.path} />
          </div>
          <div className="actions">
            <button type="button" className="button" disabled={opening} onClick={onOpenFolder}>
              Apri la cartella
            </button>
            <a className="button" href={exportFileUrl(filmId, file.id)} download>
              Salva una copia…
            </a>
          </div>
        </div>
      )}
    </>
  );
}
