import type { CharacterSheet, ModelOption } from '@filmzy/contracts';
import { useCallback, useEffect, useState } from 'react';

import {
  assetUrl,
  fetchSheet,
  fetchSheetOptions,
  lockSheet,
  startSheet,
  unlockSheet,
} from '../../api/sheet';
import { ChangeService } from '../../components/ChangeService';
import { generateLabel, selectedOption } from '../../components/change-service';
import { Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { SpendConfirm } from '../../settings/spend/SpendConfirm';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import {
  angleLabel,
  attemptIsComplete,
  attemptLabel,
  imageStatusText,
  sheetIsWorking,
} from './sheet-model';

/** Ogni quanto si guarda a che punto sono le immagini finché lavorano (ms). */
const WATCH_INTERVAL_MS = 1500;

/**
 * La scheda di un personaggio (T3.6): le tre immagini su fondo neutro (fronte, profilo, tre quarti)
 * per ogni tentativo. L'utente sceglie il servizio e vede la stima prima (D36, D30), chiede altri
 * tentativi e **blocca il volto** su quello che gli piace: da lì le tre immagini sono i riferimenti
 * del personaggio per tutto il film.
 */
export function SheetSection({ filmId, characterId }: { filmId: string; characterId: string }) {
  const [sheet, setSheet] = useState<CharacterSheet>();
  const [loadProblem, setLoadProblem] = useState<string>();

  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchSheetOptions(filmId, characterId, signal),
    [filmId, characterId],
  );
  const options = useResource(loadOptions);
  const [modelId, setModelId] = useState<string>();
  const action = useAction();

  const created = useGuardedRun<CharacterSheet>(setSheet);

  // Si legge la scheda all'apertura e, finché qualcosa lavora, ogni poco: l'utente vede le immagini
  // comparire senza dover fare niente.
  const working = sheet === undefined || sheetIsWorking(sheet);
  useEffect(() => {
    if (!working) return undefined;
    const controller = new AbortController();
    const look = () => {
      fetchSheet(filmId, characterId, controller.signal).then(
        (next) => {
          if (!controller.signal.aborted) {
            setSheet(next);
            setLoadProblem(undefined);
          }
        },
        (error: unknown) => {
          if (!controller.signal.aborted) setLoadProblem(describeError(error));
        },
      );
    };
    look();
    const timer = setInterval(look, WATCH_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [filmId, characterId, working]);

  const choices: readonly ModelOption[] | undefined =
    options.state.status === 'ready' ? options.state.data.options : undefined;
  const chosen = choices === undefined ? undefined : selectedOption(choices, modelId);
  const busy = created.running || created.raising || action.busy;

  const change = (task: () => Promise<CharacterSheet>) => {
    action.run(async () => {
      setSheet(await task());
    });
  };

  return (
    <section className="sheet" aria-label="Scheda del personaggio">
      <h5>Scheda del personaggio</h5>
      <p className="hint">
        Tre immagini su fondo neutro: fronte, profilo e tre quarti. Quando ti piace un tentativo,
        blocca il volto: sarà il riferimento di questo personaggio in tutto il film.
      </p>

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || working || chosen === undefined}
          onClick={() => {
            created.run((spendConfirmed) =>
              startSheet(filmId, characterId, {
                ...(modelId === undefined ? {} : { modelId }),
                spendConfirmed,
              }),
            );
          }}
        >
          {created.running
            ? 'Sto preparando…'
            : generateLabel(chosen).replace('Genera', 'Crea la scheda')}
        </button>
        <ChangeService
          options={choices}
          selectedId={chosen?.modelId}
          loading={options.state.status === 'loading'}
          onSelect={setModelId}
        />
      </div>

      {options.state.status === 'error' ? (
        <Notice tone="error">{describeError(options.state.error)}</Notice>
      ) : null}
      {loadProblem === undefined ? null : <Notice tone="error">{loadProblem}</Notice>}
      {created.problem === undefined ? null : <Notice tone="error">{created.problem}</Notice>}
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      {created.breach === undefined ? null : (
        <SpendConfirm
          breach={created.breach}
          busy={busy}
          onProceed={created.proceed}
          onRaise={created.raiseAndRetry}
          onCancel={created.cancel}
        />
      )}

      {sheet === undefined ? null : (
        <ul className="attempts">
          {sheet.attempts.map((attempt) => (
            <li key={attempt.attempt} className="attempt">
              <strong>{attemptLabel(attempt, sheet.lockedAttempt)}</strong>
              <div className="sheet-images">
                {attempt.images.map((image) => (
                  <figure key={image.angle}>
                    {image.assetId === undefined ? (
                      <div className="sheet-placeholder">
                        {imageStatusText(image.status, image.errorCode)}
                      </div>
                    ) : (
                      <img src={assetUrl(image.assetId)} alt={angleLabel(image.angle)} />
                    )}
                    <figcaption className="hint">{angleLabel(image.angle)}</figcaption>
                  </figure>
                ))}
              </div>
              {attempt.attempt === sheet.lockedAttempt ? (
                <div className="actions">
                  <button
                    type="button"
                    className="button"
                    disabled={busy}
                    onClick={() => {
                      change(() => unlockSheet(filmId, characterId));
                    }}
                  >
                    Sblocca il volto
                  </button>
                </div>
              ) : attemptIsComplete(attempt) ? (
                <div className="actions">
                  <button
                    type="button"
                    className="button"
                    disabled={busy}
                    onClick={() => {
                      change(() => lockSheet(filmId, characterId, attempt.attempt));
                    }}
                  >
                    Scegli questo e blocca il volto
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
