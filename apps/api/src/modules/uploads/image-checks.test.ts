import { describe, expect, it } from 'vitest';

import { detectImageType, imageProblems } from './image-checks.js';

const bytes = (...values: number[]) => new Uint8Array(values);

describe('detectImageType', () => {
  it('riconosce PNG, JPEG e WebP dai primi byte', () => {
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe(
      'image/png',
    );
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0))).toBe('image/jpeg');
    expect(
      detectImageType(
        bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50),
      ),
    ).toBe('image/webp');
  });

  it('non si fida del nome: un SVG, un testo, un programma o un file vuoto non sono immagini', () => {
    const text = (value: string) => new TextEncoder().encode(value);

    expect(detectImageType(text('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeUndefined();
    expect(detectImageType(text('<script>alert(1)</script>'))).toBeUndefined();
    expect(detectImageType(bytes(0x4d, 0x5a, 0x90, 0))).toBeUndefined();
    expect(detectImageType(bytes())).toBeUndefined();
  });

  it('un RIFF che non è WebP (un audio WAV) non passa', () => {
    expect(
      detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45)),
    ).toBeUndefined();
  });

  it('un file troppo corto per avere la firma non passa', () => {
    expect(detectImageType(bytes(0x89, 0x50))).toBeUndefined();
    expect(detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2))).toBeUndefined();
  });
});

describe('imageProblems', () => {
  it('una foto pulita non ha motivi per essere rifiutata', () => {
    expect(imageProblems({ containsPeople: false, flags: [] })).toEqual([]);
  });

  it('una persona è un motivo, anche da sola', () => {
    expect(imageProblems({ containsPeople: true, flags: [] })).toEqual(['people']);
  });

  it('le segnalazioni note diventano il loro motivo, nell’ordine di sempre e senza ripetizioni', () => {
    expect(
      imageProblems({
        containsPeople: true,
        flags: ['minor', 'brand', 'brand', 'known_character'],
      }),
    ).toEqual(['people', 'brand', 'known_character', 'minor']);
  });

  it('una segnalazione che non conosciamo rifiuta lo stesso, come «altro»', () => {
    expect(imageProblems({ containsPeople: false, flags: ['gun'] })).toEqual(['other']);
    expect(imageProblems({ containsPeople: false, flags: ['gun', 'explicit'] })).toEqual([
      'explicit',
      'other',
    ]);
  });
});
