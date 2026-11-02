import type { ModelOption, SheetOptions, StartSheetBody } from '@filmzy/contracts';
import { useState } from 'react';

import { assetUrl } from '../api/sheet';
import { ChangeService } from '../components/ChangeService';
import { generateLabel, selectedOption } from '../components/change-service';
import { Notice } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from '../settings/messages';
import { SpendConfirm } from '../settings/spend/SpendConfirm';
import { useGuardedRun } from '../settings/spend/use-guarded-run';
import { useAction } from '../settings/use-action';
import { attemptsAreWorking, describeAttempt, type ImageSet } from './image-attempts';
import { useWatched } from './use-watched';

interface Props<T extends ImageSet> {
  /** Il titolo e il suo spiegone: cosa sono le immagini e a cosa serve sceglierne una. */
  title: string;
  hint: string;
  /** Il pulsante che le crea: «Crea le immagini», seguito dalla stima del servizio. */
  createVerb: string;
  /** Cosa si sta disegnando mentre il lavoro è in corso: «Sto disegnando il set…». */
  workingText: string;
  /** Come si chiamano le immagini per chi non le vede: «Set» → «Set, immagine 2». */
  imageLabel: string;
  /** Le immagini larghe (16:9) invece che alte come una scheda. */
  wide?: boolean;
  /** `load` e `loadOptions` devono essere stabili (`useCallback`): rileggono quando cambiano. */
  load: (signal: AbortSignal) => Promise<T>;
  loadOptions: (signal: AbortSignal) => Promise<SheetOptions>;
  start: (body: StartSheetBody) => Promise<T>;
  choose: (assetId: string) => Promise<T>;
  /** Dopo una scelta riuscita: chi mostra anche il riferimento altrove lo rilegge. */
  onChosen?: () => void;
}

/**
 * Immagini fatte a tentativi con un servizio a scelta (luoghi T3.7, storyboard T4.1): l'utente
 * sceglie il servizio e vede la stima prima (D36, D30), chiede altri tentativi mentre vede i
 * risultati comparire da soli, e **sceglie** l'immagine che resta come riferimento. La logica sta
 * nel server (regola 8): qui si mostra e si invia.
 */
export function ImageAttemptsSection<T extends ImageSet>({
  title,
  hint,
  createVerb,
  workingText,
  imageLabel,
  wide = false,
  load,
  loadOptions,
  start,
  choose,
  onChosen,
}: Props<T>) {
  const {
    value: images,
    setValue: setImages,
    problem: loadProblem,
    working,
  } = useWatched(load, attemptsAreWorking);

  const options = useResource(loadOptions);
  const [modelId, setModelId] = useState<string>();
  const action = useAction();
  const created = useGuardedRun<T>(setImages);

  const choices: readonly ModelOption[] | undefined =
    options.state.status === 'ready' ? options.state.data.options : undefined;
  const chosen = choices === undefined ? undefined : selectedOption(choices, modelId);
  const busy = created.running || created.raising || action.busy;

  return (
    <section className="sheet" aria-label={title}>
      <h5>{title}</h5>
      <p className="hint">{hint}</p>

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || working || chosen === undefined}
          onClick={() => {
            created.run((spendConfirmed) =>
              start({ ...(modelId === undefined ? {} : { modelId }), spendConfirmed }),
            );
          }}
        >
          {created.running
            ? 'Sto preparando…'
            : generateLabel(chosen).replace('Genera', createVerb)}
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

      {images === undefined ? null : (
        <ul className="attempts">
          {images.attempts.map((attempt) => (
            <li key={attempt.attempt} className="attempt">
              <strong>{`Tentativo ${String(attempt.attempt)}`}</strong>
              {attempt.assetIds.length === 0 ? (
                <div className={wide ? 'sheet-placeholder wide' : 'sheet-placeholder'}>
                  {describeAttempt(attempt, workingText)}
                </div>
              ) : (
                <div className={wide ? 'sheet-images wide' : 'sheet-images'}>
                  {attempt.assetIds.map((assetId, index) => (
                    <figure key={assetId}>
                      <img
                        src={assetUrl(assetId)}
                        alt={`${imageLabel}, immagine ${String(index + 1)}`}
                      />
                      {assetId === images.chosenAssetId ? (
                        <figcaption className="hint">Scelta come riferimento</figcaption>
                      ) : (
                        <button
                          type="button"
                          className="button"
                          disabled={busy}
                          onClick={() => {
                            action.run(async () => {
                              setImages(await choose(assetId));
                              onChosen?.();
                            });
                          }}
                        >
                          Scegli questa
                        </button>
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
