import { UPLOAD_MAX_BYTES } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { checkingHint, fileProblem, nameOf, workingText } from './uploads-model';

const file = (extra: Partial<{ name: string; type: string; size: number }> = {}) => ({
  name: 'stanza.jpg',
  type: 'image/jpeg',
  size: 2_000_000,
  ...extra,
});

describe('fileProblem', () => {
  it('PNG, JPEG e WebP di peso normale vanno', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
      expect(fileProblem(file({ type }))).toBeUndefined();
    }
    expect(fileProblem(file({ size: UPLOAD_MAX_BYTES }))).toBeUndefined();
  });

  it('un file che non è una foto, o è un SVG, non parte nemmeno', () => {
    for (const type of ['image/svg+xml', 'application/pdf', 'video/mp4', '']) {
      expect(fileProblem(file({ type })), type).toContain('PNG, JPEG o WebP');
    }
  });

  it('un file vuoto o troppo grande lo dice con parole semplici', () => {
    expect(fileProblem(file({ size: 0 }))).toContain('vuoto');
    expect(fileProblem(file({ size: UPLOAD_MAX_BYTES + 1 }))).toContain('fino a 12 MB');
  });
});

describe('nameOf', () => {
  it('il nome della foto è quello del file senza estensione', () => {
    expect(nameOf('La stanza di Anna.jpg')).toBe('La stanza di Anna');
    expect(nameOf('archivio.vecchio.png')).toBe('archivio.vecchio');
  });

  it('senza un nome vero, o troppo lungo, il server decide o il nome si taglia', () => {
    expect(nameOf('.png')).toBeUndefined();
    expect(nameOf('   .jpg')).toBeUndefined();
    expect(nameOf(`${'a'.repeat(120)}.png`)).toHaveLength(80);
  });
});

describe('i testi del caricamento', () => {
  it('mentre lavora dice se la foto si sta controllando o solo salvando', () => {
    expect(workingText(true)).toBe('Sto controllando la foto…');
    expect(workingText(false)).toBe('Sto salvando la foto…');
  });

  it('con il controllo acceso dice che una copia va al servizio; spento, dove riaccenderlo', () => {
    expect(checkingHint(true)).toContain('Una copia della foto viene inviata');
    expect(checkingHint(false)).toContain('Impostazioni › Prudenza');
  });

  it('non usa parole tecniche', () => {
    for (const text of [checkingHint(true), checkingHint(false), workingText(true)]) {
      for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
        expect(text.toLowerCase()).not.toContain(word);
      }
    }
  });
});
