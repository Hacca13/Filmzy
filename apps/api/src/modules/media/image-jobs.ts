import path from 'node:path';

import type { GenerationReceipt } from '@filmzy/contracts';
import type { SheetStore } from '@filmzy/db';
import {
  ProviderError,
  renderSections,
  resolveInstructions,
  type InstructionsSource,
  type MediaRunner,
  type StoredAsset,
} from '@filmzy/troupe';

import { domainError } from '../../http/domain-error.js';

/**
 * Le parti che ogni lavoro di immagine ha in comune (T3.6, T3.7): il prompt da un modello di testo,
 * l'attesa del servizio e la registrazione dei file nella cartella del film. Chi genera immagini
 * (schede, luoghi, più avanti storyboard) le usa invece di riscriverle.
 */

/** Ogni quanto si chiede al servizio a che punto è un lavoro (ms). Pochi secondi di lavoro: basta. */
const POLL_INTERVAL_MS = 500;

/** Quante volte si chiede prima di rinunciare: oltre dieci minuti un lavoro non è più in corso. */
const MAX_POLLS = 1200;

export interface PromptArgs {
  instructions: InstructionsSource;
  role: string;
  /** Le istruzioni indicate dalla release per il ruolo, e quelle scelte dall'utente in «Chi fa cosa». */
  releaseRef?: string | undefined;
  userRef?: string | undefined;
  /** I dati che il modello di testo legge (personaggio, luogo, stile…). */
  input: unknown;
}

/**
 * Il prompt di un ruolo immagine: è un modello di testo, senza LLM (architettura §4.4). Un modello
 * che non produce niente è una configurazione sbagliata, non un errore dell'utente.
 */
export async function renderImagePrompt(args: PromptArgs): Promise<string> {
  const resolved = await resolveInstructions(args.instructions, {
    fallbackId: args.role,
    ...(args.releaseRef === undefined ? {} : { releaseRef: args.releaseRef }),
    ...(args.userRef === undefined ? {} : { userRef: args.userRef }),
  });
  const rendered = await renderSections(resolved.sections, args.input);
  const prompt = rendered.prompt ?? '';
  if (prompt === '') throw domainError(422, 'config_invalid', { details: { role: args.role } });
  return prompt;
}

export interface WaitedMedia {
  assets: StoredAsset[];
  receipt: GenerationReceipt;
}

/**
 * Aspetta che il servizio abbia finito e restituisce i file già copiati nella cartella del film. Se
 * il lavoro fallisce lancia l'errore del servizio (col suo codice); se non finisce in tempo, un
 * `timeout` da riprovare.
 */
export async function waitForMedia(media: MediaRunner, receiptId: string): Promise<WaitedMedia> {
  for (let poll = 0; poll < MAX_POLLS; poll += 1) {
    const collected = await media.collect(receiptId);
    if (collected.state === 'failed') {
      throw (
        collected.error ??
        new ProviderError('provider_unavailable', true, 'Il servizio non ha prodotto il file.')
      );
    }
    if (collected.state === 'succeeded' && collected.assets !== undefined) {
      return { assets: collected.assets, receipt: collected.receipt };
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new ProviderError('timeout', true, 'Il file non è arrivato in tempo.');
}

/** Registra i file di un lavoro: il percorso è relativo alla cartella dei dati, così si sposta. */
export function registerAssets(
  store: Pick<SheetStore, 'registerAsset'>,
  options: { dataDir: string; projectId: string; generationId: string },
  assets: readonly StoredAsset[],
): void {
  for (const asset of assets) {
    store.registerAsset({
      id: asset.assetId,
      path: path.relative(options.dataDir, asset.path).replaceAll('\\', '/'),
      contentType: asset.contentType,
      bytes: asset.bytes,
      projectId: options.projectId,
      generationId: options.generationId,
    });
  }
}
