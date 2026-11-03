import type { SheetOptions, StartSheetBody } from '@filmzy/contracts';

import { assetUrl } from '../api/sheet';
import { Chip, Notice, ToneIcon } from '../components/ui';
import { useAction } from '../settings/use-action';
import { FailureActions } from './FailureActions';
import { GenerateBar, useGeneration } from './generation';
import { attemptWho, attemptsAreWorking, describeAttempt, type ImageSet } from './image-attempts';
import type { LiveFilter } from './use-live-jobs';
import { useOnIncrease } from './use-on-increase';
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
  /** Cosa si scrive sotto l'immagine scelta. */
  chosenText?: string;
  /** Dopo una scelta riuscita: chi mostra anche il riferimento altrove lo rilegge. */
  onChosen?: () => void;
  /** Quando un tentativo finisce con delle immagini nuove: chi le offre altrove le rilegge. */
  onSettled?: () => void;
  /** Che lavoro fa queste immagini e a cosa si riferisce (T4.4): il server avvisa quando cambia, senza controlli continui. */
  live?: LiveFilter;
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
  chosenText = 'Scelta come riferimento',
  onChosen,
  onSettled,
  live,
}: Props<T>) {
  const {
    value: images,
    setValue: setImages,
    problem: loadProblem,
    working,
  } = useWatched(load, attemptsAreWorking, live);

  // Un tentativo che finisce porta immagini nuove: lo si dice a chi le offre altrove.
  useOnIncrease(images?.attempts.filter((item) => item.status === 'succeeded').length, onSettled);

  const generation = useGeneration<T>({ loadOptions, start, onStarted: setImages });
  const action = useAction();
  const busy = generation.busy || action.busy;
  // Solo l'ultimo tentativo offre cosa fare dopo un fallimento: quelli di prima sono storia.
  const latestAttempt =
    images === undefined ? undefined : Math.max(0, ...images.attempts.map((item) => item.attempt));

  return (
    <section className="sheet" aria-label={title}>
      <h5>{title}</h5>
      <p className="hint">{hint}</p>

      <GenerateBar
        generation={generation}
        createVerb={createVerb}
        disabled={working}
        otherBusy={action.busy}
      >
        {loadProblem === undefined ? null : <Notice tone="error">{loadProblem}</Notice>}
        {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      </GenerateBar>

      {images === undefined ? null : (
        <ul className="attempts">
          {images.attempts.map((attempt) => (
            <li key={attempt.attempt} className="attempt">
              <div className="attempt-head">
                <strong>{`Tentativo ${String(attempt.attempt)}`}</strong>
                {attemptWho(attempt) === '' ? null : (
                  <span className="hint">{attemptWho(attempt)}</span>
                )}
              </div>
              {attempt.assetIds.length === 0 ? (
                <div
                  className={wide ? 'sheet-placeholder wide' : 'sheet-placeholder'}
                  data-tone={attempt.status === 'failed' ? 'error' : undefined}
                >
                  {attempt.status === 'failed' ? <ToneIcon tone="error" size={26} /> : null}
                  {describeAttempt(attempt, workingText)}
                </div>
              ) : (
                <div className={wide ? 'sheet-images wide' : 'sheet-images'}>
                  {attempt.assetIds.map((assetId, index) => (
                    <figure key={assetId} data-chosen={assetId === images.chosenAssetId}>
                      <img
                        src={assetUrl(assetId)}
                        alt={`${imageLabel}, immagine ${String(index + 1)}`}
                      />
                      {assetId === images.chosenAssetId ? (
                        <figcaption>
                          <Chip tone="confirmed">{chosenText}</Chip>
                        </figcaption>
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
              {attempt.status === 'failed' && attempt.attempt === latestAttempt ? (
                <FailureActions
                  code={attempt.errorCode}
                  generation={generation}
                  busy={busy || working}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
