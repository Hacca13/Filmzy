import type { ProjectChoice, ShotSpec } from '@filmzy/contracts';

import { assetUrl } from '../../api/sheet';
import { continuityLine, humanize, type Names } from './model';

interface Props {
  shot: ShotSpec;
  movements: readonly ProjectChoice[];
  names: Names;
  busy: boolean;
  onMovement: (movementId: string) => void;
  /** La variante di storyboard scelta: è il riferimento visivo della card, finché non c'è un video. */
  storyboardAssetId?: string | undefined;
  /** La clip del take riuscito più recente (T4.3): se c'è, la card fa vedere quella. */
  clipAssetId?: string | undefined;
  /** Lo storyboard di questa card è aperto sotto la striscia. */
  storyboardOpen: boolean;
  /** Senza, la card non offre lo storyboard: il piano è da rifare e il server lo rifiuterebbe. */
  canStoryboard: boolean;
  onStoryboard: () => void;
}

/**
 * Una card della striscia (T3.9): cosa succede, il piano, la luce, la durata, il movimento di
 * macchina (si sceglie da una lista) e come entra ed esce l'inquadratura, per vedere a colpo
 * d'occhio che una segua l'altra. In cima, la variante di storyboard scelta (T4.1), se c'è.
 */
export function ShotCard({
  shot,
  movements,
  names,
  busy,
  onMovement,
  storyboardAssetId,
  clipAssetId,
  storyboardOpen,
  canStoryboard,
  onStoryboard,
}: Props) {
  const selectId = `movimento-${shot.id}`;
  const current = shot.intent.cameraMovement;
  // Un movimento che non è più tra gli attivi resta visibile, per non cambiare il valore da solo.
  const options = movements.some((movement) => movement.id === current)
    ? movements
    : [...movements, { id: current, label: humanize(current) }];

  return (
    <li className="shot-card">
      {clipAssetId === undefined ? null : (
        <video
          className="shot-frame"
          controls
          muted
          preload="metadata"
          src={assetUrl(clipAssetId)}
          aria-label={`Video dell'inquadratura ${String(shot.order + 1)}`}
        />
      )}
      {clipAssetId !== undefined || storyboardAssetId === undefined ? null : (
        <img
          className="shot-frame"
          src={assetUrl(storyboardAssetId)}
          alt={`Storyboard dell'inquadratura ${String(shot.order + 1)}`}
        />
      )}
      <p className="shot-number">Inquadratura {shot.order + 1}</p>
      <p className="shot-action">{shot.intent.action}</p>
      <p className="hint">
        {humanize(shot.intent.framing)} · {Math.round(shot.intent.durationS)} s ·{' '}
        {shot.intent.emotion}
      </p>
      <p className="hint">Luce: {shot.intent.lighting}</p>
      <label htmlFor={selectId}>Movimento</label>
      <select
        id={selectId}
        value={current}
        disabled={busy}
        onChange={(event) => {
          onMovement(event.target.value);
        }}
      >
        {options.map((movement) => (
          <option key={movement.id} value={movement.id}>
            {movement.label}
          </option>
        ))}
      </select>
      <dl className="shot-continuity">
        <div>
          <dt>Entra</dt>
          <dd>{continuityLine(shot.continuity.entry, names)}</dd>
        </div>
        <div>
          <dt>Esce</dt>
          <dd>{continuityLine(shot.continuity.exit, names)}</dd>
        </div>
      </dl>
      {canStoryboard ? (
        <button
          type="button"
          className="button"
          aria-pressed={storyboardOpen}
          onClick={onStoryboard}
        >
          {storyboardAssetId === undefined ? 'Storyboard' : 'Cambia lo storyboard'}
        </button>
      ) : null}
    </li>
  );
}
