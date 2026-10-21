import type { ModelEntry } from '@filmzy/contracts';

import type { MediaRequest } from '../adapters/types.js';
import { ProviderError } from '../provider-error.js';
import { allowedDuration, allowedValue, commonIssues, fileAsUri, RequestBody } from './common.js';
import type { TranslateInput, TranslateIssue, Translator } from './types.js';

/**
 * L'indice dei traduttori (architettura §4.7, §4.12 caso C): una famiglia nuova si aggiunge qui e
 * non tocca le app. Le famiglie si somigliano molto — cambiano i **nomi dei campi**, che stanno nel
 * catalogo, e il modo di citare i personaggi, che sta qui.
 */

/**
 * Come una famiglia cita le immagini di riferimento dentro il prompt. Verificate sulle pagine dei
 * fornitori il 21/10/2026 (T1.7): Kling e Seedance usano `@Image1`, `@Image2`…, Gemini Omni usa
 * `<IMAGE_REF_0>` e conta da zero.
 */
const CHARACTER_TOKENS: Record<string, (index: number) => string> = {
  kling: (index) => `@Image${String(index + 1)}`,
  seedance: (index) => `@Image${String(index + 1)}`,
  gemini_omni: (index) => `<IMAGE_REF_${String(index)}>`,
};

/**
 * Chi vuole la durata scritta come testo. Su fal Kling e Seedance mandano `"8"` (Seedance accetta
 * anche `"auto"`), Gemini Omni un numero: verificato il 21/10/2026 sugli esempi dei fornitori.
 * I nostri scontrini tengono sempre un numero.
 */
const DURATION_AS_TEXT = new Set(['kling', 'seedance']);

/** Le immagini non citano i personaggi: il prompt della scheda li descrive già (§4.2). */
const NO_TOKEN = (): string => '';

function translatorFor(family: string): Translator {
  return {
    family,

    check(input: TranslateInput, model: ModelEntry): TranslateIssue[] {
      const issues = commonIssues(input, model);
      const body = new RequestBody(model);

      if (!body.has('prompt')) {
        issues.push({
          reason: 'il catalogo non dice in quale campo mandare il prompt',
          field: 'request_fields.prompt',
        });
      }

      for (const item of input.inputs) {
        const field =
          item.use === 'reference'
            ? 'references'
            : item.use === 'first_frame'
              ? 'first_frame'
              : item.use === 'last_frame'
                ? 'last_frame'
                : item.use === 'base_image'
                  ? 'base_image'
                  : 'mask';

        if (!body.has(field)) {
          issues.push({
            reason: `il catalogo non dice in quale campo mandare ${describeUse(item.use)}`,
            field: `request_fields.${field}`,
          });
        }
      }

      // Il ritocco con una maschera vera: se il servizio non la accetta non si manda una richiesta
      // peggiore in silenzio (D20). Evidenziare la zona sull'immagine arriva col ritocco (T4.9).
      const mask = input.inputs.find((item) => item.use === 'mask');
      if (mask !== undefined && model.kind === 'image' && model.capabilities.mask_edit !== true) {
        issues.push({ reason: 'non accetta una maschera', field: 'capabilities.mask_edit' });
      }

      if (model.kind === 'image' && input.inputs.some((item) => item.use === 'base_image')) {
        if (model.capabilities.image_edit !== true) {
          issues.push({
            reason: "non sa modificare un'immagine data",
            field: 'capabilities.image_edit',
          });
        }
      }

      return issues;
    },

    build(input: TranslateInput, model: ModelEntry): MediaRequest {
      const token = CHARACTER_TOKENS[family] ?? NO_TOKEN;
      const references = input.inputs.filter((item) => item.use === 'reference');
      const prompt = replacePlaceholders(input.prompt, input.characterIds, token);
      const duration = allowedDuration(model, input.durationS);

      const body = new RequestBody(model)
        .set('prompt', prompt)
        .set('negative_prompt', input.negativePrompt)
        .set(
          'duration_s',
          duration === undefined || !DURATION_AS_TEXT.has(family) ? duration : String(duration),
        )
        .set('resolution', allowedValue(model, 'resolution', input.params.resolution))
        .set('aspect_ratio', allowedValue(model, 'aspect_ratio', input.params.aspect_ratio))
        .set('audio', allowedValue(model, 'audio', input.params.audio))
        .set('variants', allowedValue(model, 'variants', input.params.variants));

      const edited = input.inputs.find((item) => item.use === 'base_image');
      const oneList =
        body.nameOf('references') !== undefined &&
        body.nameOf('base_image') === body.nameOf('references');

      if (oneList) {
        // Un campo lista solo per tutte le immagini (su fal `image_urls`): quella da modificare va
        // in testa, i riferimenti dopo. Altrimenti il secondo file cancellerebbe il primo.
        const all = edited === undefined ? references : [edited, ...references];
        if (all.length > 0) {
          body.set(
            'references',
            all.map((item) => fileAsUri(item.file)),
          );
        }
      } else {
        if (references.length > 0) {
          body.set(
            'references',
            references.map((item) => fileAsUri(item.file)),
          );
        }
        if (edited !== undefined) body.set('base_image', fileAsUri(edited.file));
      }

      for (const use of ['first_frame', 'last_frame', 'mask'] as const) {
        const item = input.inputs.find((candidate) => candidate.use === use);
        if (item !== undefined) body.set(use, fileAsUri(item.file));
      }

      return {
        role: input.role,
        modelId: input.modelId,
        providerModel: model.provider_model,
        prompt,
        negativePrompt: input.negativePrompt,
        inputs: input.inputs,
        // I parametri nostri, con la durata già portata nei limiti: li legge lo scontrino, e chi
        // non parla la lingua del fornitore (il fornitore finto, la stima della spesa).
        params: { ...input.params, ...(duration === undefined ? {} : { duration_s: duration }) },
        idempotencyKey: input.idempotencyKey,
        providerInput: body.build(),
      };
    },
  };
}

/**
 * I segnaposto `[[char:id]]` diventano la sintassi della famiglia, nell'ordine in cui i
 * personaggi stanno nei riferimenti: è l'ordine che il prompt presume (architettura §4.7 punto 2).
 * Un segnaposto di un personaggio che non è nei riferimenti si toglie, perché lasciarlo scritto
 * finirebbe nel prompt come testo.
 */
export function replacePlaceholders(
  prompt: string,
  characterIds: readonly string[],
  token: (index: number) => string,
): string {
  return prompt
    .replaceAll(/\[\[char:([a-zA-Z0-9_-]+)\]\]/g, (_match, id: string) => {
      const index = characterIds.indexOf(id);
      return index === -1 ? '' : token(index);
    })
    .replaceAll(/[ \t]{2,}/g, ' ')
    .trim();
}

const FAMILIES = ['kling', 'seedance', 'gemini_omni', 'image_generic'] as const;

const TRANSLATORS = new Map<string, Translator>(
  FAMILIES.map((family) => [family, translatorFor(family)]),
);

export function translator(family: string | undefined): Translator {
  const found = family === undefined ? undefined : TRANSLATORS.get(family);
  if (found === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `Non c'è un traduttore per la famiglia "${family ?? 'nessuna'}". Famiglie note: ${[...TRANSLATORS.keys()].join(', ')}.`,
      { field: 'family' },
    );
  }
  return found;
}

export const TRANSLATOR_FAMILIES: readonly string[] = [...TRANSLATORS.keys()];

function describeUse(use: string): string {
  if (use === 'reference') return 'le immagini di riferimento';
  if (use === 'first_frame') return 'il primo fotogramma';
  if (use === 'last_frame') return "l'ultimo fotogramma";
  if (use === 'base_image') return "l'immagine da modificare";
  return 'la maschera';
}
