import { describe, expect, it } from 'vitest';

import {
  BRUSH,
  canvasBrush,
  needsWords,
  retouchBlocker,
  retouchText,
  toCanvasPoint,
} from './retouch-model';

describe('needsWords', () => {
  it('«togli» non vuole parole; «sostituisci» e «cambia colore» sì', () => {
    expect(needsWords('remove')).toBe(false);
    expect(needsWords('replace')).toBe(true);
    expect(needsWords('recolor')).toBe(true);
  });
});

describe('retouchBlocker', () => {
  it('senza pennello non si può ritoccare, e lo dice', () => {
    expect(retouchBlocker({ painted: false, operation: 'remove', instruction: '' })).toBe(
      'Dipingi la zona da ritoccare.',
    );
  });

  it('«togli» con la zona dipinta può partire, senza parole', () => {
    expect(retouchBlocker({ painted: true, operation: 'remove', instruction: '' })).toBeUndefined();
  });

  it('«sostituisci» e «cambia colore» chiedono le parole, ognuna con la sua frase', () => {
    expect(retouchBlocker({ painted: true, operation: 'replace', instruction: '   ' })).toContain(
      'al posto della zona',
    );
    expect(retouchBlocker({ painted: true, operation: 'recolor', instruction: '' })).toContain(
      'di che colore',
    );
    expect(
      retouchBlocker({ painted: true, operation: 'replace', instruction: 'una lampada' }),
    ).toBeUndefined();
  });
});

describe('retouchText', () => {
  it('dice cosa è stato chiesto, con le parole dell’utente tra virgolette', () => {
    const source = 'a'.repeat(64);

    expect(retouchText({ sourceAssetId: source, operation: 'remove' })).toBe('Ritocco: togli');
    expect(
      retouchText({ sourceAssetId: source, operation: 'replace', instruction: 'una lampada' }),
    ).toBe('Ritocco: sostituisci con «una lampada»');
    expect(
      retouchText({ sourceAssetId: source, operation: 'recolor', instruction: 'blu scuro' }),
    ).toBe('Ritocco: cambia colore in «blu scuro»');
  });
});

describe('dal punto sullo schermo alla tela', () => {
  it('la tela è più grande dello schermo: il punto si scala, partendo dall’angolo dell’immagine', () => {
    const point = toCanvasPoint(
      { x: 150, y: 120 },
      { left: 100, top: 100, width: 200, height: 100 },
      { width: 2000, height: 1000 },
    );

    expect(point).toEqual({ x: 500, y: 200 });
  });

  it('una tela mostrata a misura vera non cambia i numeri, e un riquadro vuoto non rompe niente', () => {
    expect(
      toCanvasPoint(
        { x: 10, y: 20 },
        { left: 0, top: 0, width: 300, height: 200 },
        { width: 300, height: 200 },
      ),
    ).toEqual({ x: 10, y: 20 });
    expect(
      toCanvasPoint(
        { x: 10, y: 20 },
        { left: 0, top: 0, width: 0, height: 0 },
        { width: 300, height: 200 },
      ),
    ).toEqual({ x: 10, y: 20 });
  });

  it('il tratto si allarga come la tela, perché a schermo sia quello scelto', () => {
    expect(canvasBrush(40, 400, 2000)).toBe(200);
    expect(canvasBrush(40, 0, 2000)).toBe(40);
    expect(BRUSH.min).toBeLessThan(BRUSH.initial);
    expect(BRUSH.initial).toBeLessThan(BRUSH.max);
  });
});
