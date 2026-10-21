import { beforeAll, describe, expect, it } from 'vitest';

import type { MediaInput } from '../adapters/types.js';
import type { TroupeConfig } from '../config/load-files.js';
import { loadSeedConfig, modelOf } from '../config/seed.fixtures.js';
import { replacePlaceholders, translator } from './index.js';
import type { TranslateInput } from './types.js';

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

function reference(name: string): MediaInput {
  return {
    use: 'reference',
    file: { fileName: name, contentType: 'image/png', bytes: new Uint8Array([1, 2, 3]) },
  };
}

/** La stessa inquadratura per tutte le famiglie: è il criterio di T1.4. */
function shot(): TranslateInput {
  return {
    role: 'camera_operator',
    modelId: 'un-servizio',
    prompt: 'medium shot of [[char:anna]] and [[char:tomas]] at a table, warm light, slow push-in',
    negativePrompt: 'text, logos',
    inputs: [reference('anna.png'), reference('tomas.png')],
    characterIds: ['anna', 'tomas'],
    durationS: 5,
    params: { resolution: '720p', aspect_ratio: '16:9', audio: false },
    idempotencyKey: 'shot-1:abc',
  };
}

describe('la stessa inquadratura verso tre famiglie (T1.4)', () => {
  it('ognuna cita i personaggi come vuole il fornitore, e i campi vengono dal catalogo', () => {
    // Sintassi dei riferimenti e forma della durata verificate il 21/10/2026 (T1.7): Kling e
    // Seedance vogliono "@Image1" e la durata come testo, Gemini Omni "<IMAGE_REF_0>" e un numero.
    const famiglie = [
      ['kling-o3-standard', 'kling', '@Image1', '5'],
      ['seedance-2', 'seedance', '@Image1', '5'],
      ['gemini-omni-flash', 'gemini_omni', '<IMAGE_REF_0>', 5],
    ] as const;

    for (const [modelId, family, primoToken, durata] of famiglie) {
      const model = modelOf(seed, modelId);
      const request = translator(family).build({ ...shot(), modelId }, model);

      expect(translator(family).check({ ...shot(), modelId }, model)).toEqual([]);
      expect(request.providerInput?.prompt).toContain(primoToken);
      expect(request.providerInput?.prompt).not.toContain('[[char:');
      expect(request.providerInput?.image_urls).toHaveLength(2);
      expect(request.providerInput?.duration).toBe(durata);
      expect(request.providerModel).toBe(model.provider_model);
      expect(request.modelId).toBe(modelId);
    }
  });

  it('nessuno dei tre accetta un prompt negativo: non si manda (T1.7)', () => {
    for (const [modelId, family] of [
      ['kling-o3-standard', 'kling'],
      ['seedance-2', 'seedance'],
      ['gemini-omni-flash', 'gemini_omni'],
    ] as const) {
      const request = translator(family).build({ ...shot(), modelId }, modelOf(seed, modelId));

      expect(request.providerInput?.negative_prompt).toBeUndefined();
      // Resta nella nostra richiesta, perché lo scontrino dice cosa avevamo chiesto.
      expect(request.negativePrompt).toBe('text, logos');
    }
  });

  it('porta la durata nei limiti del servizio, invece di farsi rifiutare', () => {
    const gemini = modelOf(seed, 'gemini-omni-flash'); // il fornitore dichiara 8 secondi
    const request = translator('gemini_omni').build(
      { ...shot(), modelId: 'gemini-omni-flash', durationS: 30 },
      gemini,
    );

    expect(request.providerInput?.duration).toBe(8);
  });

  it('porta la risoluzione a un valore ammesso', () => {
    const seedance = modelOf(seed, 'seedance-2'); // il catalogo dichiara il solo 720p
    const request = translator('seedance').build(
      { ...shot(), modelId: 'seedance-2', params: { resolution: '4k' } },
      seedance,
    );

    expect(request.providerInput?.resolution).toBe('720p');
  });

  it('Kling non ha la risoluzione: non si inventa un campo', () => {
    const kling = modelOf(seed, 'kling-o3-standard');
    const request = translator('kling').build(
      { ...shot(), modelId: 'kling-o3-standard', params: { resolution: '1080p' } },
      kling,
    );

    expect(request.providerInput?.resolution).toBeUndefined();
  });
});

describe('primo e ultimo fotogramma (D20)', () => {
  function frames(): MediaInput[] {
    return [
      { use: 'first_frame', file: reference('primo.png').file },
      { use: 'last_frame', file: reference('ultimo.png').file },
    ];
  }

  it('mette i due fotogrammi nei campi che il catalogo indica', () => {
    // Kling O3 è il solo dei tre che li accetta, sullo stesso punto d'accesso (verificato in T1.7).
    const model = modelOf(seed, 'kling-o3-standard');
    const input: TranslateInput = {
      ...shot(),
      modelId: 'kling-o3-standard',
      inputs: frames(),
      characterIds: [],
    };

    expect(translator('kling').check(input, model)).toEqual([]);
    const request = translator('kling').build(input, model);

    expect(String(request.providerInput?.start_image_url)).toContain('data:image/png;base64,');
    expect(String(request.providerInput?.end_image_url)).toContain('data:image/png;base64,');
  });

  it('un servizio che accetta solo i riferimenti lo dice, invece di declassare (D20)', () => {
    const model = modelOf(seed, 'gemini-omni-flash'); // input_modes: [references]
    const input: TranslateInput = {
      ...shot(),
      modelId: 'gemini-omni-flash',
      inputs: frames(),
      characterIds: [],
    };

    const issues = translator('gemini_omni').check(input, model);
    expect(issues.map((issue) => issue.field)).toContain('capabilities.input_modes');
  });
});

describe('le immagini in un campo lista solo (T1.7)', () => {
  it("l'immagine da modificare va in testa e i riferimenti dopo", () => {
    // Su fal l'editor di immagini ha un campo solo, `image_urls`: senza accodare, la seconda
    // immagine cancellerebbe la prima.
    const model = modelOf(seed, 'nano-banana-2-edit');
    const input: TranslateInput = {
      ...shot(),
      role: 'storyboard_artist',
      modelId: 'nano-banana-2-edit',
      inputs: [
        { use: 'base_image', file: reference('primo-fotogramma.png').file },
        reference('anna.png'),
      ],
      characterIds: ['anna'],
      durationS: undefined,
    };

    expect(translator('image_generic').check(input, model)).toEqual([]);
    const immagini = translator('image_generic').build(input, model).providerInput?.image_urls;

    expect(Array.isArray(immagini)).toBe(true);
    expect(immagini).toHaveLength(2);
  });
});

describe('i controlli che tengono il lavoro fuori dai guai (§4.7, §4.8)', () => {
  it('troppe immagini di riferimento', () => {
    const seedream = modelOf(seed, 'seedream-lite'); // scrive solo da testo: nessuna immagine
    const issues = translator('image_generic').check(
      { ...shot(), role: 'storyboard_artist', modelId: 'seedream-lite' },
      seedream,
    );

    expect(issues.map((issue) => issue.field)).toContain('capabilities.max_reference_images');
  });

  it('troppi personaggi in scena', () => {
    const seedance = modelOf(seed, 'seedance-2'); // ne tiene 2
    const issues = translator('seedance').check(
      { ...shot(), modelId: 'seedance-2', characterIds: ['anna', 'tomas', 'marco'] },
      seedance,
    );

    expect(issues.map((issue) => issue.field)).toContain('capabilities.max_characters');
  });

  it('volti reali dove non si possono usare (D4)', () => {
    const gemini = modelOf(seed, 'gemini-omni-flash'); // real_faces: "no"
    const issues = translator('gemini_omni').check(
      { ...shot(), modelId: 'gemini-omni-flash', realFaces: true },
      gemini,
    );

    expect(issues.map((issue) => issue.field)).toContain('capabilities.real_faces');
  });

  it('una maschera dove il servizio non la accetta (D21)', () => {
    const nano = modelOf(seed, 'nano-banana-2-edit'); // modifica le immagini, ma senza maschera
    const issues = translator('image_generic').check(
      {
        ...shot(),
        role: 'retoucher',
        modelId: 'nano-banana-2-edit',
        inputs: [
          { use: 'base_image', file: reference('set.png').file },
          { use: 'mask', file: reference('maschera.png').file },
        ],
        characterIds: [],
        durationS: undefined,
      },
      nano,
    );

    expect(issues.map((issue) => issue.field)).toContain('capabilities.mask_edit');
  });

  it('un campo che il catalogo non dichiara: non si indovina', () => {
    const nano = modelOf(seed, 'nano-banana-2'); // non dichiara first_frame
    const issues = translator('image_generic').check(
      {
        ...shot(),
        role: 'storyboard_artist',
        modelId: 'nano-banana-2',
        inputs: [{ use: 'first_frame', file: reference('primo.png').file }],
        characterIds: [],
        durationS: undefined,
      },
      nano,
    );

    expect(issues.map((issue) => issue.field)).toContain('request_fields.first_frame');
  });

  it('una famiglia senza traduttore si ferma con un messaggio chiaro', () => {
    expect(() => translator('famiglia-inventata')).toThrow(/Famiglie note/);
  });
});

describe('replacePlaceholders', () => {
  it("numera i personaggi nell'ordine dei riferimenti", () => {
    const prompt = 'a and b: [[char:b]] looks at [[char:a]]';
    const token = (index: number): string => `#${String(index)}`;

    expect(replacePlaceholders(prompt, ['a', 'b'], token)).toBe('a and b: #1 looks at #0');
  });

  it('toglie il segnaposto di un personaggio che non è nei riferimenti', () => {
    expect(replacePlaceholders('x [[char:ignoto]] y', ['anna'], () => '#')).toBe('x y');
  });

  it('le immagini non citano i personaggi: il segnaposto sparisce', () => {
    expect(replacePlaceholders('portrait of [[char:anna]]', ['anna'], () => '')).toBe(
      'portrait of',
    );
  });
});
