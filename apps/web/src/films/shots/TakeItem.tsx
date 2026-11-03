import type { ShotTake } from '@filmzy/contracts';
import { useRef, type ReactNode } from 'react';

import { assetUrl } from '../../api/sheet';
import { Chip } from '../../components/ui';
import { takeCaption, takeText, timeInVideo } from './takes-model';

/**
 * Un take dell'elenco (T4.3, T4.6): il video, chi l'ha fatto, e cosa si può fare con quel video —
 * tenerlo (è quello che la card fa vedere) o ripartire da un suo fotogramma. Il momento è quello a
 * cui l'utente ha messo in pausa il video: lo legge il lettore, e il server lo confronta con la
 * durata vera. `children` porta cosa fare dopo un fallimento, deciso da chi mostra l'elenco.
 */
export function TakeItem({
  take,
  title,
  kept,
  busy,
  onKeep,
  onUseFrame,
  children,
}: {
  take: ShotTake;
  title: string;
  /** È il take che la card fa vedere (scelto, oppure il più recente se nessuno è scelto). */
  kept: boolean;
  /** Un'altra azione sta lavorando: i pulsanti aspettano. */
  busy: boolean;
  onKeep: () => void;
  onUseFrame: (atS: number) => void;
  children?: ReactNode;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ready = take.status === 'succeeded' && take.assetId !== undefined;

  return (
    <li className="attempt">
      <div className="attempt-head">
        <strong>{title}</strong>
        {kept ? <Chip tone="confirmed">Quello tenuto</Chip> : null}
      </div>
      {take.assetId === undefined ? (
        <div className="sheet-placeholder wide">{takeText(take)}</div>
      ) : (
        <video
          ref={video}
          className="take-video"
          controls
          preload="metadata"
          src={assetUrl(take.assetId)}
        />
      )}
      <p className="hint">{takeCaption(take)}</p>
      {ready ? (
        <div className="actions">
          {kept ? null : (
            <button type="button" className="button" disabled={busy} onClick={onKeep}>
              Tieni questo take
            </button>
          )}
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              onUseFrame(timeInVideo(video.current?.currentTime));
            }}
          >
            Usa questo fotogramma come punto di partenza
          </button>
        </div>
      ) : null}
      {children}
    </li>
  );
}
