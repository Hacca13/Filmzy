import type { ModelEntry } from '@filmzy/contracts';

import type { MediaFile, MediaInput } from '../adapters/types.js';
import type { TranslateInput, TranslateIssue } from './types.js';

/**
 * Le parti comuni a tutti i traduttori (architettura §4.7): i controlli che non dipendono dalla
 * famiglia e la costruzione del corpo, che prende i **nomi dei campi dal catalogo**
 * (`request_fields`) invece di averli scritti nel codice — così un fornitore che rinomina un campo
 * si sistema dalle impostazioni, e T1.7 può verificarli senza toccare il codice.
 */

/** Il vocabolario nostro: a sinistra ciò che sappiamo dire, a destra lo dice il catalogo. */
export type RequestFieldName =
  | 'prompt'
  | 'negative_prompt'
  | 'references'
  | 'first_frame'
  | 'last_frame'
  | 'base_image'
  | 'mask'
  | 'variants'
  | 'duration_s'
  | 'resolution'
  | 'aspect_ratio'
  | 'audio';

/** Quali ingressi porta la richiesta, nella forma con cui il catalogo dichiara `input_modes`. */
export function inputModeOf(inputs: readonly MediaInput[]): string {
  const uses = new Set(inputs.map((input) => input.use));
  const hasReferences = uses.has('reference');
  const hasFirst = uses.has('first_frame');
  const hasLast = uses.has('last_frame');

  if (hasFirst && hasLast) return 'first_frame+last_frame';
  if (hasFirst && hasReferences) return 'references+first_frame';
  if (hasFirst) return 'first_frame';
  return 'references';
}

/**
 * I controlli che valgono per ogni famiglia (architettura §4.7, §4.8 punto 1). Le scelte
 * dell'utente sulle immagini sono **requisiti**: se il servizio non accetta quella combinazione si
 * dice, non si declassa in silenzio (D20).
 */
export function commonIssues(input: TranslateInput, model: ModelEntry): TranslateIssue[] {
  const issues: TranslateIssue[] = [];
  if (model.kind !== 'video' && model.kind !== 'image') return issues;

  const references = input.inputs.filter((item) => item.use === 'reference');
  if (references.length > model.capabilities.max_reference_images) {
    issues.push({
      reason: `accetta ${String(model.capabilities.max_reference_images)} immagini di riferimento, qui ce ne sono ${String(references.length)}`,
      field: 'capabilities.max_reference_images',
    });
  }

  if (model.kind !== 'video') return issues;

  const mode = inputModeOf(input.inputs);
  if (!model.capabilities.input_modes.includes(mode as never)) {
    issues.push({
      reason: `non accetta questa combinazione di immagini (${mode})`,
      field: 'capabilities.input_modes',
    });
  }

  if (input.durationS !== undefined) {
    const { min, max } = model.capabilities.durations_s;
    if (input.durationS > max || (min !== undefined && input.durationS < min)) {
      issues.push({
        reason: `gira clip da ${min === undefined ? '' : `${String(min)}–`}${String(max)} secondi, qui ne servono ${String(input.durationS)}`,
        field: 'capabilities.durations_s',
      });
    }
  }

  if (input.characterIds.length > model.capabilities.max_characters) {
    issues.push({
      reason: `tiene ${String(model.capabilities.max_characters)} personaggi in scena, qui ce ne sono ${String(input.characterIds.length)}`,
      field: 'capabilities.max_characters',
    });
  }

  if (input.realFaces === true && model.capabilities.real_faces === 'no') {
    issues.push({ reason: 'non accetta volti di persone reali', field: 'capabilities.real_faces' });
  }

  if (input.minors === true && !model.capabilities.minors) {
    issues.push({ reason: 'non genera minori', field: 'capabilities.minors' });
  }

  return issues;
}

/** Il valore ammesso più vicino a quello chiesto, fra quelli che il modello dichiara. */
export function allowedValue(
  model: ModelEntry,
  param: string,
  wanted: string | number | boolean | undefined,
): string | number | boolean | undefined {
  const spec = model.params?.[param];
  if (spec === undefined || wanted === undefined) return undefined;

  if ('values' in spec) {
    if (spec.values.includes(wanted)) return wanted;
    return spec.values[0];
  }

  if (typeof wanted !== 'number') return undefined;
  const min = spec.min ?? wanted;
  const max = spec.max ?? wanted;
  return Math.min(Math.max(wanted, min), max);
}

/** La durata portata nei limiti del servizio (architettura §4.7 punto 2). */
export function allowedDuration(model: ModelEntry, wanted: number | undefined): number | undefined {
  if (wanted === undefined || model.kind !== 'video') return undefined;
  const { min, max } = model.capabilities.durations_s;
  return Math.min(Math.max(wanted, min ?? wanted), max);
}

/**
 * Un file che entra nella richiesta, come lo si manda al fornitore. Oggi è un `data:` URI: i
 * nostri file stanno sul computer dell'utente e non hanno un indirizzo pubblico. Se un fornitore
 * rifiuterà file grandi scritti così, si passerà al suo deposito (è una delle cose che la prova
 * vera di T1.7 farà vedere).
 */
export function fileAsUri(file: MediaFile): string {
  return `data:${file.contentType};base64,${Buffer.from(file.bytes).toString('base64')}`;
}

/** Il corpo della richiesta, con i nomi dei campi presi dal catalogo. */
export class RequestBody {
  private readonly body: Record<string, unknown> = {};

  constructor(private readonly model: ModelEntry) {}

  /** Scrive il valore se il catalogo dice come si chiama quel campo per questo servizio. */
  set(field: RequestFieldName, value: unknown): this {
    const name = this.nameOf(field);
    if (name === undefined || value === undefined) return this;
    this.body[name] = value;
    return this;
  }

  /** Vero se il catalogo dichiara quel campo: serve a sapere cosa si può mandare. */
  has(field: RequestFieldName): boolean {
    return this.nameOf(field) !== undefined;
  }

  /**
   * Come si chiama quel campo presso il fornitore. Serve a capire quando due usi diversi finiscono
   * nello stesso campo: certi fornitori hanno una lista sola per tutte le immagini.
   */
  nameOf(field: RequestFieldName): string | undefined {
    return this.model.request_fields?.[field];
  }

  build(): Record<string, unknown> {
    return { ...this.body };
  }
}
