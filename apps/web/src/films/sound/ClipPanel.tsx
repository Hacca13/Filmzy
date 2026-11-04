import type { AudioClip, AudioVariant, UpdateAudioClipBody } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import {
  chooseAudioVariant,
  fetchAudioOptions,
  removeAudioClip,
  startAudioVariant,
  updateAudioClip,
  uploadAudioVariant,
} from '../../api/audio';
import { assetUrl } from '../../api/sheet';
import { Chip, Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { FailureActions } from '../FailureActions';
import { GenerateBar, useGeneration } from '../generation';
import { AudioFilePicker } from './AudioFilePicker';
import { TRACK_LABELS, clipIsWorking, describeAudioError, variantText } from './model';

/**
 * Il pannello del blocco (T5.6, D24): com'è il suono, «Genera» con «Cambia servizio», «Cambia» fra le
 * varianti, «Carica un file» ed «Elimina». Cambiare un suono non tocca mai il video. Chi lo mostra gli
 * dà una `key` per clip: cambiando blocco, il testo non ancora salvato non passa al blocco nuovo.
 */
export function ClipPanel({
  filmId,
  clip,
  placed,
  placeName,
  onChanged,
  onRemoved,
  onClose,
}: {
  filmId: string;
  clip: AudioClip;
  /** Ha un posto nel film: senza, non si genera e si può solo togliere. */
  placed: boolean;
  placeName: string;
  onChanged: () => Promise<void>;
  onRemoved: () => Promise<void>;
  onClose: () => void;
}) {
  const action = useAction();
  const fields = useClipFields(clip);
  const generated = clip.source === 'generated';
  const running = (work: () => Promise<unknown>, then: () => Promise<void> = onChanged) => {
    action.run(async () => {
      await work();
      await then();
    }, describeAudioError);
  };

  return (
    <aside className="sound-panel" aria-label="Il suono scelto">
      <div className="panel-head">
        <p className="hint">
          {placeName} · {TRACK_LABELS[clip.kind]}
        </p>
        <button type="button" className="icon-button" aria-label="Chiudi" onClick={onClose}>
          ×
        </button>
      </div>

      {placed ? null : (
        <Notice tone="info" title="Ha perso il suo posto">
          La scena o l’inquadratura è cambiata: questo suono non si sente nel film. Puoi eliminarlo.
        </Notice>
      )}

      <div className="field">
        <label htmlFor={`suono-${clip.id}`}>Com’è questo suono?</label>
        <textarea
          id={`suono-${clip.id}`}
          rows={3}
          value={fields.description}
          onChange={(event) => {
            fields.setDescription(event.target.value);
          }}
        />
      </div>
      {clip.kind === 'music' ? (
        <div className="field">
          <label htmlFor={`atmosfera-${clip.id}`}>Atmosfera (facoltativa)</label>
          <input
            id={`atmosfera-${clip.id}`}
            value={fields.mood}
            onChange={(event) => {
              fields.setMood(event.target.value);
            }}
          />
        </div>
      ) : (
        <div className="field">
          <label htmlFor={`partenza-${clip.id}`}>Parte al secondo</label>
          <input
            id={`partenza-${clip.id}`}
            type="number"
            min={0}
            step={0.1}
            value={fields.startS}
            onChange={(event) => {
              fields.setStartS(event.target.value);
            }}
          />
        </div>
      )}
      {generated ? (
        <div className="field">
          <label htmlFor={`durata-${clip.id}`}>Durata in secondi</label>
          <input
            id={`durata-${clip.id}`}
            type="number"
            min={0.1}
            step={0.5}
            value={fields.durationS}
            onChange={(event) => {
              fields.setDurationS(event.target.value);
            }}
          />
        </div>
      ) : null}
      {fields.patch === undefined ? null : (
        <div className="actions">
          <button
            type="button"
            className="button"
            disabled={action.busy || !fields.valid}
            onClick={() => {
              const { patch } = fields;
              if (patch !== undefined) running(() => updateAudioClip(filmId, clip.id, patch));
            }}
          >
            Salva
          </button>
        </div>
      )}
      {fields.valid ? null : (
        <Notice tone="error">Scrivi com’è il suono e controlla i secondi.</Notice>
      )}

      {generated ? (
        // La stima dipende dalla durata: con una durata nuova si rilegge il prezzo giusto.
        <GenerateSection
          key={clip.durationS}
          filmId={filmId}
          clip={clip}
          placed={placed}
          patch={fields.valid ? fields.patch : undefined}
          blocked={!fields.valid}
          otherBusy={action.busy}
          onChanged={onChanged}
        />
      ) : null}

      <VariantList
        clip={clip}
        busy={action.busy}
        onChoose={(variantId) => {
          running(() => chooseAudioVariant(filmId, clip.id, variantId));
        }}
      />

      <UploadSection
        busy={action.busy}
        onPick={(file) => {
          running(() => uploadAudioVariant(filmId, clip.id, file));
        }}
      />

      <RemoveSection
        busy={action.busy}
        hasWork={clip.variants.some(({ modelId }) => modelId !== undefined)}
        onRemove={() => {
          running(() => removeAudioClip(filmId, clip.id), onRemoved);
        }}
      />

      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </aside>
  );
}

/** I campi del pannello, e cosa è cambiato rispetto a ciò che è salvato. */
function useClipFields(clip: AudioClip) {
  const [description, setDescription] = useState(clip.description);
  const [mood, setMood] = useState(clip.mood ?? '');
  const [startS, setStartS] = useState(String(clip.startS));
  const [durationS, setDurationS] = useState(String(clip.durationS));

  const start = Number(startS);
  const duration = Number(durationS);
  const valid =
    description.trim() !== '' &&
    startS.trim() !== '' &&
    Number.isFinite(start) &&
    start >= 0 &&
    durationS.trim() !== '' &&
    Number.isFinite(duration) &&
    duration > 0;

  const patch: UpdateAudioClipBody = {
    ...(description.trim() === clip.description ? {} : { description: description.trim() }),
    ...(mood.trim() === (clip.mood ?? '') ? {} : { mood: mood.trim() === '' ? null : mood.trim() }),
    ...(start === clip.startS ? {} : { startS: start }),
    ...(duration === clip.durationS ? {} : { durationS: duration }),
  };

  return {
    description,
    setDescription,
    mood,
    setMood,
    startS,
    setStartS,
    durationS,
    setDurationS,
    valid,
    patch: Object.keys(patch).length === 0 ? undefined : patch,
  };
}

function GenerateSection({
  filmId,
  clip,
  placed,
  patch,
  blocked,
  otherBusy,
  onChanged,
}: {
  filmId: string;
  clip: AudioClip;
  placed: boolean;
  patch: UpdateAudioClipBody | undefined;
  blocked: boolean;
  otherBusy: boolean;
  onChanged: () => Promise<void>;
}) {
  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchAudioOptions(filmId, clip.id, signal),
    [filmId, clip.id],
  );
  const generation = useGeneration<AudioClip>({
    loadOptions,
    // Si genera quello che l'utente vede: il testo non ancora salvato si salva prima.
    start: async (body) => {
      if (patch !== undefined) await updateAudioClip(filmId, clip.id, patch);
      return startAudioVariant(filmId, clip.id, body);
    },
    onStarted: () => {
      onChanged().catch(() => {
        // Il lavoro è partito: l'evento del server o il controllo periodico rileggeranno comunque.
      });
    },
  });
  const working = clipIsWorking(clip);
  const [latest] = clip.variants;

  return (
    <div className="sound-generate">
      <GenerateBar
        generation={generation}
        createVerb="Genera"
        disabled={working || !placed || blocked}
        otherBusy={otherBusy}
      />
      {latest?.status === 'failed' ? (
        <FailureActions
          code={latest.errorCode}
          generation={generation}
          busy={generation.busy || working}
        />
      ) : null}
    </div>
  );
}

/** «Cambia»: le varianti da ascoltare, dalla più recente. Il video non cambia. */
export function VariantList({
  clip,
  busy,
  onChoose,
}: {
  clip: AudioClip;
  busy: boolean;
  onChoose: (variantId: string) => void;
}) {
  if (clip.variants.length === 0) return null;
  return (
    <section className="sheet" aria-label="Cambia">
      <h5>Cambia</h5>
      <ul className="attempts">
        {clip.variants.map((variant, index) => (
          <VariantItem
            key={variant.id}
            variant={variant}
            title={`Variante ${String(clip.variants.length - index)}`}
            inUse={variant.id === clip.chosenVariantId}
            busy={busy}
            onChoose={onChoose}
          />
        ))}
      </ul>
    </section>
  );
}

function VariantItem({
  variant,
  title,
  inUse,
  busy,
  onChoose,
}: {
  variant: AudioVariant;
  title: string;
  inUse: boolean;
  busy: boolean;
  onChoose: (variantId: string) => void;
}) {
  const ready = variant.status === 'succeeded' && variant.assetId !== undefined;
  return (
    <li className="attempt">
      <div className="attempt-head">
        <strong>{title}</strong>
        {inUse ? <Chip tone="confirmed">In uso</Chip> : null}
      </div>
      {ready ? <audio controls preload="none" src={assetUrl(variant.assetId ?? '')} /> : null}
      <p className="hint">{variantText(variant)}</p>
      {ready && !inUse ? (
        <div className="actions">
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              onChoose(variant.id);
            }}
          >
            Scegli
          </button>
        </div>
      ) : null}
    </li>
  );
}

function UploadSection({ busy, onPick }: { busy: boolean; onPick: (file: File) => void }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={busy}
          onClick={() => {
            setOpen(true);
          }}
        >
          Carica un file
        </button>
      </div>
    );
  }
  return (
    <AudioFilePicker
      label="Scegli il file"
      disabled={busy}
      onPick={(file) => {
        setOpen(false);
        onPick(file);
      }}
      onCancel={() => {
        setOpen(false);
      }}
    />
  );
}

/** «Elimina» chiede conferma se ci sono suoni generati: si sono pagati, e con la clip si perdono. */
function RemoveSection({
  busy,
  hasWork,
  onRemove,
}: {
  busy: boolean;
  hasWork: boolean;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="sound-remove">
        <p className="hint">Le varianti generate non si potranno più scegliere. Il video resta.</p>
        <div className="actions">
          <button type="button" className="button" disabled={busy} onClick={onRemove}>
            Elimina davvero
          </button>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              setConfirming(false);
            }}
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="actions">
      <button
        type="button"
        className="button"
        disabled={busy}
        onClick={() => {
          if (hasWork) setConfirming(true);
          else onRemove();
        }}
      >
        Elimina
      </button>
    </div>
  );
}
