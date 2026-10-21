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
 * Come una famiglia cita le immagini di riferimento dentro il prompt. Le sintassi vanno verificate
 * sulla documentazione dei fornitori prima di spendere (T1.7): finché gli id sono segnaposto, il
 * catalogo tiene quei servizi in `testing` e le chiamate reali restano bloccate (§4.6 punto 7).
 */
const CHARACTER_TOKENS: Record<string, (index: number) => string> = {
  kling: (index) => `@Image${String(index + 1)}`,
  seedance: (index) => `<<<element_${String(index + 1)}>>>`,
  gemini_omni: (index) => `<IMAGE_REF_${String(index)}>`,
};

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
        .set('duration_s', duration)
        .set('resolution', allowedValue(model, 'resolution', input.params.resolution))
        .set('aspect_ratio', allowedValue(model, 'aspect_ratio', input.params.aspect_ratio))
        .set('audio', allowedValue(model, 'audio', input.params.audio))
        .set('variants', allowedValue(model, 'variants', input.params.variants));

      if (references.length > 0) {
        body.set(
          'references',
          references.map((item) => fileAsUri(item.file)),
        );
      }
      for (const use of ['first_frame', 'last_frame', 'base_image', 'mask'] as const) {
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
        params: input.params,
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
