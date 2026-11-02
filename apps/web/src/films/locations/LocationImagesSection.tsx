import type { LocationImages, ModelOption } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { assetUrl } from '../../api/sheet';
import {
  chooseLocationImage,
  fetchLocationImages,
  fetchLocationOptions,
  startLocationImages,
} from '../../api/locations';
import { ChangeService } from '../../components/ChangeService';
import { generateLabel, selectedOption } from '../../components/change-service';
import { Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { SpendConfirm } from '../../settings/spend/SpendConfirm';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { useWatched } from '../use-watched';
import { attemptText, imagesAreWorking } from './model';

/**
 * Le immagini del set di un luogo (T3.7, D19): senza persone, più per tentativo. L'utente sceglie
 * il servizio e vede la stima prima (D36, D30), chiede altri tentativi e **sceglie** l'immagine che
 * resta come riferimento del luogo nella Bibbia.
 */
export function LocationImagesSection({
  filmId,
  locationId,
}: {
  filmId: string;
  locationId: string;
}) {
  const loadImages = useCallback(
    (signal: AbortSignal) => fetchLocationImages(filmId, locationId, signal),
    [filmId, locationId],
  );
  const {
    value: images,
    setValue: setImages,
    problem: loadProblem,
    working,
  } = useWatched(loadImages, imagesAreWorking);

  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchLocationOptions(filmId, locationId, signal),
    [filmId, locationId],
  );
  const options = useResource(loadOptions);
  const [modelId, setModelId] = useState<string>();
  const action = useAction();
  const created = useGuardedRun<LocationImages>(setImages);

  const choices: readonly ModelOption[] | undefined =
    options.state.status === 'ready' ? options.state.data.options : undefined;
  const chosen = choices === undefined ? undefined : selectedOption(choices, modelId);
  const busy = created.running || created.raising || action.busy;

  return (
    <section className="sheet" aria-label="Immagini del luogo">
      <h5>Immagini del luogo</h5>
      <p className="hint">
        Immagini del set, senza persone. Scegline una: sarà il riferimento di questo luogo in tutto
        il film.
      </p>

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || working || chosen === undefined}
          onClick={() => {
            created.run((spendConfirmed) =>
              startLocationImages(filmId, locationId, {
                ...(modelId === undefined ? {} : { modelId }),
                spendConfirmed,
              }),
            );
          }}
        >
          {created.running
            ? 'Sto preparando…'
            : generateLabel(chosen).replace('Genera', 'Crea le immagini')}
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
                <div className="sheet-placeholder">{attemptText(attempt)}</div>
              ) : (
                <div className="sheet-images">
                  {attempt.assetIds.map((assetId, index) => (
                    <figure key={assetId}>
                      <img src={assetUrl(assetId)} alt={`Set, immagine ${String(index + 1)}`} />
                      {assetId === images.chosenAssetId ? (
                        <figcaption className="hint">Scelta come riferimento</figcaption>
                      ) : (
                        <button
                          type="button"
                          className="button"
                          disabled={busy}
                          onClick={() => {
                            action.run(async () => {
                              setImages(await chooseLocationImage(filmId, locationId, assetId));
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
