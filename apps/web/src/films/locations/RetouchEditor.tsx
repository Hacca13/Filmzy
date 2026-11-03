import {
  RETOUCH_INSTRUCTION_MAX_CHARS,
  RETOUCH_OPERATIONS,
  type LocationImages,
  type RetouchOperation,
} from '@filmzy/contracts';
import { useCallback, useRef, useState, type PointerEvent } from 'react';

import { fetchRetouchOptions, startRetouch } from '../../api/locations';
import { assetUrl } from '../../api/sheet';
import { Notice } from '../../components/ui';
import { GenerateBar, useGeneration } from '../generation';
import {
  BRUSH,
  INSTRUCTION_PLACEHOLDERS,
  OPERATION_LABELS,
  canvasBrush,
  needsWords,
  retouchBlocker,
  toCanvasPoint,
} from './retouch-model';

/** Il colore del pennello sulla tela: la maschera esce piena, e a schermo la tela è trasparente. */
const BRUSH_COLOR = '#ff00ff';

/**
 * Il ritocco col pennello (T4.9, D21): l'utente dipinge la zona dell'immagine, sceglie cosa farne
 * (togli, sostituisci, cambia colore) e, se serve, lo scrive con parole sue. Il pulsante dice la stima
 * e «Cambia servizio» sta accanto (D36). Il lavoro è in coda: finito, il ritocco compare tra i tentativi
 * del luogo e si **sceglie** come riferimento solo se piace. La maschera esce dalla tela alla
 * risoluzione vera dell'immagine; chi la evidenzia e la manda al servizio è il server (regola 8).
 */
export function RetouchEditor({
  filmId,
  locationId,
  assetId,
  onStarted,
  onClose,
}: {
  filmId: string;
  locationId: string;
  assetId: string;
  /** Il ritocco è in coda: chi mostra i tentativi li rilegge. */
  onStarted: (images: LocationImages) => void;
  onClose: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<{ x: number; y: number } | undefined>(undefined);
  const [painted, setPainted] = useState(false);
  const [brush, setBrush] = useState<number>(BRUSH.initial);
  const [operation, setOperation] = useState<RetouchOperation>('remove');
  const [instruction, setInstruction] = useState('');

  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchRetouchOptions(filmId, locationId, assetId, operation, signal),
    [filmId, locationId, assetId, operation],
  );
  const generation = useGeneration<LocationImages>({
    loadOptions,
    start: async (body) => {
      const mask = await maskOf(canvas.current);
      return startRetouch(
        filmId,
        locationId,
        {
          assetId,
          operation,
          ...(needsWords(operation) ? { instruction: instruction.trim() } : {}),
        },
        mask,
        body,
      );
    },
    onStarted: (images) => {
      onStarted(images);
      onClose();
    },
  });
  const blocker = retouchBlocker({ painted, operation, instruction });

  /** Disegna da dove era l'ultimo punto a questo (o un punto solo, al primo tocco). */
  const paint = (
    event: PointerEvent<HTMLCanvasElement>,
    from: { x: number; y: number } | undefined,
  ) => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (element === null || context === null || context === undefined) return undefined;
    const box = element.getBoundingClientRect();
    const to = toCanvasPoint({ x: event.clientX, y: event.clientY }, box, element);

    context.strokeStyle = BRUSH_COLOR;
    context.fillStyle = BRUSH_COLOR;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = canvasBrush(brush, box.width, element.width);
    context.beginPath();
    context.moveTo((from ?? to).x, (from ?? to).y);
    context.lineTo(to.x, to.y);
    context.stroke();
    setPainted(true);
    return to;
  };

  const clear = () => {
    const element = canvas.current;
    element?.getContext('2d')?.clearRect(0, 0, element.width, element.height);
    setPainted(false);
  };

  return (
    <section className="sheet retouch-editor" aria-label="Ritocca l’immagine">
      <div className="panel-head">
        <h5>Ritocca l’immagine</h5>
        <button
          type="button"
          className="icon-button"
          aria-label="Chiudi il ritocco"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="hint">
        Dipingi con il pennello la zona che vuoi cambiare, poi scegli cosa farne. Il resto
        dell’immagine resta com’è.
      </p>

      <div className="retouch-stage">
        <img
          ref={(image) => {
            // Un'immagine già in memoria può essere pronta prima di `onLoad`: la tela si misura subito.
            if (image?.complete === true) sizeCanvas(canvas.current, image);
          }}
          src={assetUrl(assetId)}
          alt="L’immagine da ritoccare"
          onLoad={(event) => {
            sizeCanvas(canvas.current, event.currentTarget);
          }}
        />
        <canvas
          ref={canvas}
          aria-label="Dipingi la zona da ritoccare"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drawing.current = paint(event, undefined);
          }}
          onPointerMove={(event) => {
            if (drawing.current !== undefined) drawing.current = paint(event, drawing.current);
          }}
          onPointerUp={() => {
            drawing.current = undefined;
          }}
          onPointerCancel={() => {
            drawing.current = undefined;
          }}
        />
      </div>

      <div className="retouch-tools">
        <label htmlFor="pennello-spessore">Pennello</label>
        <input
          id="pennello-spessore"
          type="range"
          min={BRUSH.min}
          max={BRUSH.max}
          value={brush}
          onChange={(event) => {
            setBrush(Number(event.target.value));
          }}
        />
        <button type="button" className="button" disabled={!painted} onClick={clear}>
          Cancella il pennello
        </button>
      </div>

      <fieldset className="retouch-operations">
        <legend>Cosa vuoi fare</legend>
        {RETOUCH_OPERATIONS.map((candidate) => (
          <label key={candidate}>
            <input
              type="radio"
              name="ritocco-operazione"
              value={candidate}
              checked={operation === candidate}
              onChange={() => {
                setOperation(candidate);
              }}
            />
            {OPERATION_LABELS[candidate]}
          </label>
        ))}
      </fieldset>

      {needsWords(operation) ? (
        <>
          <label htmlFor="ritocco-parole">
            {operation === 'replace' ? 'Al posto della zona' : 'Il nuovo colore'}
          </label>
          <textarea
            id="ritocco-parole"
            rows={2}
            maxLength={RETOUCH_INSTRUCTION_MAX_CHARS}
            placeholder={INSTRUCTION_PLACEHOLDERS[operation]}
            value={instruction}
            onChange={(event) => {
              setInstruction(event.target.value);
            }}
          />
        </>
      ) : null}

      <GenerateBar generation={generation} createVerb="Ritocca" disabled={blocker !== undefined} />
      {blocker === undefined ? null : <p className="hint">{blocker}</p>}
      <Notice tone="info">
        Quello che scrivi passa dal moderatore e arriva al servizio così com’è. Il ritocco diventa
        il riferimento del luogo solo se lo scegli: le inquadrature già fatte con il luogo di prima
        passano allora in giallo.
      </Notice>
    </section>
  );
}

/** La tela ha la risoluzione vera dell'immagine: il tratto deve cadere nel punto giusto anche dopo il ridimensionamento. */
function sizeCanvas(element: HTMLCanvasElement | null, image: HTMLImageElement): void {
  if (element === null || image.naturalWidth === 0) return;
  // Cambiare la misura svuota la tela: solo se è diversa, per non cancellare il pennello senza motivo.
  if (element.width !== image.naturalWidth) element.width = image.naturalWidth;
  if (element.height !== image.naturalHeight) element.height = image.naturalHeight;
}

/** La tela come file PNG: dipinto è pieno, il resto trasparente. */
function maskOf(element: HTMLCanvasElement | null): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (element === null) {
      reject(new Error('La tela non c’è.'));
      return;
    }
    element.toBlob((blob) => {
      if (blob === null) reject(new Error('La maschera non si è potuta preparare.'));
      else resolve(blob);
    }, 'image/png');
  });
}
