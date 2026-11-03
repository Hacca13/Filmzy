import type { RetouchInfo, RetouchOperation } from '@filmzy/contracts';

/**
 * Le piccole decisioni del ritocco col pennello (T4.9, D21), fuori dai componenti così si provano a
 * parte. Cosa è permesso lo decide il server; qui si dice solo come presentarlo.
 */

export const OPERATION_LABELS: Record<RetouchOperation, string> = {
  remove: 'Togli',
  replace: 'Sostituisci',
  recolor: 'Cambia colore',
};

/** Cosa dice il campo di testo, per le operazioni che vogliono le parole dell'utente. */
export const INSTRUCTION_PLACEHOLDERS: Record<RetouchOperation, string> = {
  remove: '',
  replace: 'Cosa vuoi al posto della zona dipinta? Per esempio «una lampada rossa»',
  recolor: 'Di che colore? Per esempio «blu scuro»',
};

/** «Togli» non vuole parole; le altre due sì. */
export const needsWords = (operation: RetouchOperation): boolean => operation !== 'remove';

/**
 * Perché il pulsante «Ritocca» è spento, in parole semplici; `undefined` se si può premere. Il server
 * ricontrolla tutto: questo evita solo una richiesta che sicuramente non va.
 */
export function retouchBlocker(input: {
  painted: boolean;
  operation: RetouchOperation;
  instruction: string;
}): string | undefined {
  if (!input.painted) return 'Dipingi la zona da ritoccare.';
  if (needsWords(input.operation) && input.instruction.trim() === '') {
    return input.operation === 'replace'
      ? 'Scrivi cosa vuoi al posto della zona dipinta.'
      : 'Scrivi di che colore la vuoi.';
  }
  return undefined;
}

/** «Ritocco: togli», «Ritocco: sostituisci con «una lampada»»: cosa è stato chiesto, per l'intestazione del tentativo. */
export function retouchText(retouch: RetouchInfo): string {
  const words = retouch.instruction === undefined ? '' : ` «${retouch.instruction}»`;
  switch (retouch.operation) {
    case 'remove':
      return 'Ritocco: togli';
    case 'replace':
      return `Ritocco: sostituisci con${words}`;
    case 'recolor':
      return `Ritocco: cambia colore in${words}`;
  }
}

/** Cosa si scrive mentre un ritocco lavora. */
export const RETOUCH_WORKING_TEXT = 'Sto ritoccando l’immagine…';

/** Il pennello: da quanto a quanto si può allargare (px dello schermo), e da dove parte. */
export const BRUSH = { min: 8, max: 120, initial: 40 } as const;

/**
 * Dal punto sullo schermo al punto sulla tela, che ha la risoluzione vera dell'immagine: la tela è
 * mostrata più piccola (o più grande) di quanto sia, e il tratto deve cadere dove l'utente ha puntato.
 */
export function toCanvasPoint(
  point: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  canvas: { width: number; height: number },
): { x: number; y: number } {
  const scaleX = box.width === 0 ? 1 : canvas.width / box.width;
  const scaleY = box.height === 0 ? 1 : canvas.height / box.height;
  return { x: (point.x - box.left) * scaleX, y: (point.y - box.top) * scaleY };
}

/** Lo spessore del tratto sulla tela, perché a schermo sia quello scelto con il cursore. */
export function canvasBrush(brushPx: number, boxWidth: number, canvasWidth: number): number {
  return boxWidth === 0 ? brushPx : brushPx * (canvasWidth / boxWidth);
}
