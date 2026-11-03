import type { ShotImages } from '@filmzy/contracts';
import { useCallback } from 'react';

import { fetchShotImages, setShotImages } from '../../api/shot-images';
import { assetUrl } from '../../api/sheet';
import { Chip, Notice } from '../../components/ui';
import { useLastReady } from '../../lib/use-last-ready';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useAction } from '../../settings/use-action';
import {
  USE_LABELS,
  candidateCaption,
  reassign,
  uniqueCandidates,
  useOf,
  videoNotice,
  type ImageUse,
} from './images-model';

const NOT_USED = 'none';

const isUse = (value: string): value is ImageUse => value in USE_LABELS;

/**
 * «Imposta le immagini» (T4.2, D20): tra le immagini già fatte per l'inquadratura l'utente sceglie
 * quale è il primo fotogramma («da qui parte»), quale l'ultimo («qui finisce») e quali fanno da
 * ispirazione. È facoltativo: senza scelte decide l'aiuto regista. A ogni scelta il server dice
 * se esiste un servizio video che la accetta; se no, si vede subito, senza spendere. Il server
 * ricontrolla tutto: qui si mostra e si invia (regola 8).
 */
export function ShotImagesSection({
  filmId,
  shotId,
  refreshKey,
  onChanged,
}: {
  filmId: string;
  shotId: string;
  /** Cambia quando ci sono immagini nuove o una scelta fatta altrove: si rilegge. */
  refreshKey: number;
  onChanged: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => fetchShotImages(filmId, shotId, signal),
    // refreshKey non si usa nel corpo: cambia l'identità di `load` e fa rileggere.
    [filmId, shotId, refreshKey],
  );
  const resource = useResource(load);
  const images = useLastReady(resource.state);
  const action = useAction();
  const notice = images === undefined ? undefined : videoNotice(images.videoServices);

  const change = (current: ShotImages, assetId: string, use: ImageUse | undefined) => {
    action.run(async () => {
      resource.setData(
        await setShotImages(filmId, shotId, { images: reassign(current.images, assetId, use) }),
      );
      onChanged();
    });
  };

  return (
    <section className="sheet" aria-label="Imposta le immagini">
      <h5>Imposta le immagini</h5>
      <p className="hint">
        Facoltativo: se non scegli niente, decide l&apos;aiuto regista. Il primo fotogramma è
        l&apos;immagine da cui parte il video, l&apos;ultimo quella in cui finisce,
        l&apos;ispirazione serve solo da esempio.
      </p>

      {resource.state.status === 'error' ? (
        <Notice tone="error">{describeError(resource.state.error)}</Notice>
      ) : null}
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}

      {images === undefined ? (
        <p className="hint">Un attimo…</p>
      ) : (
        <>
          {images.candidates.length === 0 ? (
            <p className="hint">
              Prima crea lo storyboard: le immagini da usare sono le sue varianti.
            </p>
          ) : (
            <div className="use-grid">
              {uniqueCandidates(images.candidates).map((candidate, index) => {
                const selectId = `uso-${shotId}-${candidate.assetId.slice(0, 12)}`;
                const current = useOf(images.images, candidate.assetId);
                const caption = candidateCaption(candidate);
                return (
                  <figure key={candidate.assetId}>
                    <div className="use-picture">
                      <img
                        src={assetUrl(candidate.assetId)}
                        alt={`Immagine ${String(index + 1)} dell'inquadratura`}
                      />
                      {current === undefined ? null : (
                        <span className="use-chip">
                          <Chip tone="confirmed">{USE_LABELS[current]}</Chip>
                        </span>
                      )}
                    </div>
                    {caption === undefined ? null : (
                      <figcaption className="hint">{caption}</figcaption>
                    )}
                    <label htmlFor={selectId}>Come usarla</label>
                    <select
                      id={selectId}
                      value={current ?? NOT_USED}
                      disabled={action.busy}
                      onChange={(event) => {
                        change(
                          images,
                          candidate.assetId,
                          isUse(event.target.value) ? event.target.value : undefined,
                        );
                      }}
                    >
                      <option value={NOT_USED}>Non la uso</option>
                      {(Object.keys(USE_LABELS) as ImageUse[]).map((use) => (
                        <option key={use} value={use}>
                          {USE_LABELS[use]}
                        </option>
                      ))}
                    </select>
                  </figure>
                );
              })}
            </div>
          )}
          {notice === undefined ? null : (
            <>
              <Notice tone="error" title="Non compatibile">
                {notice}
              </Notice>
              <p className="hint">
                Con questa combinazione non parte nessuna ripresa e non si spende niente.
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}
