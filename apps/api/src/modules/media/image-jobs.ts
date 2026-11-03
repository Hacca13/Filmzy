import path from 'node:path';

import type { GenerationReceipt, ModelOption, StartSheetBody } from '@filmzy/contracts';
import type { SheetStore } from '@filmzy/db';
import {
  enforceSpend,
  ProviderError,
  renderSections,
  resolveInstructions,
  type InstructionsSource,
  type MediaRunner,
  type SpendGuard,
  type StoredAsset,
  type TroupeConfig,
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

/**
 * Quante varianti chiede il ruolo: il numero scritto nella sua configurazione se è un intero
 * positivo, altrimenti `fallback`. Un valore strano (zero, negativo, con la virgola) non arriva al
 * servizio: la stima e la spesa seguirebbero un numero che nessuno ha scelto.
 */
export function variantsOf(config: TroupeConfig, role: string, fallback: number): number {
  const configured = config.roles[role]?.params?.variants;
  return typeof configured === 'number' && Number.isInteger(configured) && configured > 0
    ? configured
    : fallback;
}

export interface ChooseServiceArgs {
  role: string;
  /** I servizi adatti alla richiesta, con la stima di tutto il lavoro. */
  options: readonly ModelOption[];
  /** Il servizio scelto dall'utente, se diverso dal predefinito, e la conferma del limite di spesa. */
  body: StartSheetBody;
  config: TroupeConfig;
  spend: SpendGuard;
  projectId: string;
}

/**
 * Il servizio che farà il lavoro: quello scelto dall'utente o, se non ha scelto, il predefinito. Il
 * servizio scelto è un requisito: se non è adatto non si passa a un altro (D36). Si controllano
 * anche i limiti di spesa, **prima** di mettere il lavoro in coda (D30).
 */
export async function chooseMediaService(args: ChooseServiceArgs): Promise<ModelOption> {
  const { role, options, body, config, projectId } = args;
  const chosen =
    body.modelId === undefined
      ? (options.find((option) => option.isDefault) ?? options[0])
      : options.find((option) => option.modelId === body.modelId);
  if (chosen === undefined) throw domainError(409, 'no_eligible_model', { details: { role } });

  const connectionId = config.models[chosen.modelId]?.connection;
  if (connectionId === undefined) {
    throw domainError(422, 'config_invalid', { details: { modelId: chosen.modelId } });
  }
  await enforceSpend(
    args.spend,
    {
      purpose: 'product',
      projectId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    },
    { role, connectionId, modelId: chosen.modelId, estimatedCostUsd: chosen.estimatedCostUsd },
  );
  return chosen;
}

export interface WaitedMedia {
  assets: StoredAsset[];
  receipt: GenerationReceipt;
}

/** Quanto aspettare un lavoro: gli intervalli e il numero di volte che si chiede, prima di rinunciare. */
export interface WaitOptions {
  intervalMs: number;
  maxPolls: number;
}

/** Un video ci mette minuti, non secondi: si chiede più di rado e si aspetta più a lungo (circa 20 minuti). */
export const VIDEO_WAIT: WaitOptions = { intervalMs: 3000, maxPolls: 400 };

/**
 * Aspetta che il servizio abbia finito e restituisce i file già copiati nella cartella del film. Se
 * il lavoro fallisce lancia l'errore del servizio (col suo codice); se non finisce in tempo, un
 * `timeout` da riprovare. Per un'immagine bastano i valori di partenza.
 */
export async function waitForMedia(
  media: MediaRunner,
  receiptId: string,
  wait: WaitOptions = { intervalMs: POLL_INTERVAL_MS, maxPolls: MAX_POLLS },
): Promise<WaitedMedia> {
  for (let poll = 0; poll < wait.maxPolls; poll += 1) {
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
    await new Promise((resolve) => setTimeout(resolve, wait.intervalMs));
  }
  throw new ProviderError('timeout', true, 'Il file non è arrivato in tempo.');
}

/** Registra i file di un lavoro: il percorso è relativo alla cartella dei dati, così si sposta. */
export function registerAssets(
  store: Pick<SheetStore, 'registerAsset'>,
  options: { dataDir: string; projectId: string; generationId?: string },
  assets: readonly StoredAsset[],
): void {
  for (const asset of assets) {
    store.registerAsset({
      id: asset.assetId,
      path: path.relative(options.dataDir, asset.path).replaceAll('\\', '/'),
      contentType: asset.contentType,
      bytes: asset.bytes,
      projectId: options.projectId,
      ...(options.generationId === undefined ? {} : { generationId: options.generationId }),
    });
  }
}
