import type { AudioClip, CreateAudioClipBody, SoundSuggestions } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import type { SoundEditor } from '../../api/audio';
import { createAudioClip, estimateSoundSuggestions, suggestSounds } from '../../api/audio';
import { Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { SpendConfirm } from '../../settings/spend/SpendConfirm';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { formatSeconds, suggestionPlace } from './model';

/**
 * «Suggerisci i suoni» (T5.5, D24): il sound designer propone, l'utente accetta o scarta una proposta
 * alla volta. Niente si salva da solo; accettare crea un blocco senza suono, che non costa niente.
 */
export function SuggestSounds({
  filmId,
  editor,
  onAccepted,
}: {
  filmId: string;
  editor: SoundEditor;
  onAccepted: (clip: AudioClip) => Promise<void>;
}) {
  const loadEstimate = useCallback(
    (signal: AbortSignal) => estimateSoundSuggestions(filmId, signal),
    [filmId],
  );
  const estimate = useResource(loadEstimate);
  const [proposed, setProposed] = useState<readonly CreateAudioClipBody[]>();
  const written = useGuardedRun<SoundSuggestions>(({ suggestions }) => {
    setProposed(suggestions);
  });
  const accepting = useAction();
  const busy = written.running || written.raising || accepting.busy;

  const costLabel =
    estimate.state.status === 'ready'
      ? ` · circa ${formatEstimate(estimate.state.data.estimate.estimatedCostUsd)}`
      : '';

  const without = (body: CreateAudioClipBody) =>
    (proposed ?? []).filter((candidate) => candidate !== body);

  return (
    <div className="sound-suggest">
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={busy}
          onClick={() => {
            written.run((spendConfirmed) => suggestSounds(filmId, spendConfirmed));
          }}
        >
          {written.running ? 'Sto ascoltando la storia…' : `Suggerisci i suoni${costLabel}`}
        </button>
      </div>
      {written.problem === undefined ? null : <Notice tone="error">{written.problem}</Notice>}
      {written.breach === undefined ? null : (
        <SpendConfirm
          breach={written.breach}
          busy={busy}
          onProceed={written.proceed}
          onRaise={written.raiseAndRetry}
          onCancel={written.cancel}
        />
      )}
      {accepting.problem === undefined ? null : <Notice tone="error">{accepting.problem}</Notice>}

      {proposed === undefined ? null : proposed.length === 0 ? (
        <p className="hint">Nessuna proposta: per ora la storia sta bene così.</p>
      ) : (
        <ul className="attempts" aria-label="Le proposte">
          {proposed.map((body) => (
            <li
              key={`${body.sceneId}:${body.shotId ?? ''}:${body.description}`}
              className="attempt"
            >
              <div className="attempt-head">
                <strong>{suggestionPlace(editor.timeline, body)}</strong>
                <span className="hint">{formatSeconds(body.durationS)}</span>
              </div>
              <p>{body.description}</p>
              <div className="actions">
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    accepting.run(async () => {
                      await onAccepted(await createAudioClip(filmId, body));
                      setProposed(without(body));
                    });
                  }}
                >
                  Accetta
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    setProposed(without(body));
                  }}
                >
                  Scarta
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
