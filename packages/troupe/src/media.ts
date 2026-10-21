import { randomUUID } from 'node:crypto';

import type { GenerationContext, GenerationReceipt } from '@filmzy/contracts';

import { mediaAdapterFor } from './adapters/index.js';
import type { MediaStatus } from './adapters/types.js';
import type { AssetStore, StoredAsset } from './assets.js';
import { configHash, hashRoleConfig } from './config/hash.js';
import type { SecretSources } from './config/secrets.js';
import type { ConfigSource } from './config/source.js';
import { mediaCostUsd } from './cost.js';
import { ProviderError } from './provider-error.js';
import type { ReceiptSink } from './receipts.js';
import { route } from './router.js';
import type { TranslateInput } from './translators/types.js';

/**
 * I lavori lunghi (architettura §4.1, §7): `submit` manda in coda e lascia uno scontrino aperto,
 * `collect` lo chiude quando il fornitore ha finito, copiando i file nella cartella del progetto.
 *
 * Qui non c'è nessuna attesa attiva: chi chiama decide quando richiedere lo stato — la coda
 * dell'app in M4, un ciclo semplice nel bench. Un lavoro ripetuto non conta due volte, perché la
 * chiave di idempotenza sta nello scontrino (§7).
 */

export interface MediaJob {
  receiptId: string;
  providerRequestId: string;
  modelId: string;
  modelLabel: string;
  estimatedCostUsd: number | undefined;
}

export interface CollectedMedia {
  state: 'queued' | 'running' | 'succeeded' | 'failed';
  assets?: StoredAsset[];
  receipt: GenerationReceipt;
  error?: ProviderError;
}

export interface MediaRunnerOptions {
  configSource: ConfigSource;
  assets: AssetStore;
  receiptSink?: ReceiptSink;
  secrets?: SecretSources;
  now?: () => Date;
}

export interface MediaRunner {
  submit(
    role: string,
    request: Omit<TranslateInput, 'modelId'>,
    ctx: GenerationContext,
  ): Promise<MediaJob>;
  collect(receiptId: string): Promise<CollectedMedia>;
}

interface OpenJob {
  receipt: GenerationReceipt;
  providerRequestId: string;
  connectionId: string;
  poll: (providerRequestId: string) => Promise<MediaStatus>;
  startedAt: number;
  pricing: Parameters<typeof mediaCostUsd>[0];
}

export function createMediaRunner(options: MediaRunnerOptions): MediaRunner {
  const now = options.now ?? (() => new Date());
  const open = new Map<string, OpenJob>();

  return {
    async submit(role, request, ctx) {
      const loaded = await options.configSource.load();
      if (loaded.config === undefined) {
        throw new ProviderError(
          'config_invalid',
          false,
          `La configurazione non si è caricata: ${loaded.issues.map((issue) => issue.message).join(' ')}`,
          { role },
        );
      }

      const chosen = route({
        roleId: role,
        config: loaded.config,
        ...(loaded.settings === undefined ? {} : { settings: loaded.settings }),
        request,
        ...(ctx.modelId === undefined ? {} : { chosenModelId: ctx.modelId }),
      });

      const providerRequest = chosen.translator.build(
        { ...request, modelId: chosen.modelId },
        chosen.model,
      );

      const adapter = mediaAdapterFor({
        connectionId: chosen.model.connection,
        connection: chosen.connection,
        ...(options.secrets === undefined ? {} : { secrets: options.secrets }),
      });

      const receipt: GenerationReceipt = {
        id: randomUUID(),
        role: role as GenerationReceipt['role'],
        purpose: ctx.purpose,
        ...(ctx.projectId === undefined ? {} : { projectId: ctx.projectId }),
        ...(ctx.shotId === undefined ? {} : { shotId: ctx.shotId }),
        releaseId: loaded.releaseId,
        roleConfigHash: hashRoleConfig(loaded.config, role) ?? '',
        modelId: chosen.modelId,
        modelLabel: chosen.model.label,
        connectionId: chosen.model.connection,
        providerModel: chosen.model.provider_model,
        params: request.params,
        inputHash: configHash(providerRequest.providerInput),
        idempotencyKey: request.idempotencyKey,
        status: 'queued',
        attempts: 1,
        estimatedCostUsd: chosen.estimatedCostUsd ?? 0,
        createdAt: now().toISOString(),
      };
      await options.receiptSink?.write(receipt);

      const { providerRequestId } = await adapter.submit(providerRequest);
      const running: GenerationReceipt = { ...receipt, status: 'running', providerRequestId };
      await options.receiptSink?.write(running);

      open.set(receipt.id, {
        receipt: running,
        providerRequestId,
        connectionId: chosen.model.connection,
        poll: (id) => adapter.poll(id),
        startedAt: now().getTime(),
        pricing: chosen.model.pricing,
      });

      return {
        receiptId: receipt.id,
        providerRequestId,
        modelId: chosen.modelId,
        modelLabel: chosen.model.label,
        estimatedCostUsd: chosen.estimatedCostUsd,
      };
    },

    async collect(receiptId) {
      const job = open.get(receiptId);
      if (job === undefined) {
        throw new ProviderError(
          'not_found',
          false,
          `Non c'è nessun lavoro aperto con lo scontrino "${receiptId}".`,
        );
      }

      const status = await job.poll(job.providerRequestId);

      if (status.state === 'failed') {
        const closed: GenerationReceipt = {
          ...job.receipt,
          status: 'failed',
          errorCode: status.code,
          durationMs: now().getTime() - job.startedAt,
        };
        await options.receiptSink?.write(closed);
        open.delete(receiptId);

        return {
          state: 'failed',
          receipt: closed,
          error: new ProviderError(status.code, status.retryable, status.message, {
            role: job.receipt.role,
            modelId: job.receipt.modelId,
            connectionId: job.connectionId,
          }),
        };
      }

      if (status.state !== 'succeeded') {
        // Ancora in coda o in lavorazione: lo scontrino resta aperto.
        return { state: status.state, receipt: job.receipt };
      }

      // I file si copiano subito: le URL del fornitore scadono (regola d'oro 11).
      const assets = await Promise.all(status.files.map((file) => options.assets.put(file)));
      const closed: GenerationReceipt = {
        ...job.receipt,
        status: 'succeeded',
        ...(status.usage === undefined ? {} : { usage: status.usage }),
        ...(mediaCostUsd(job.pricing, status.usage) === undefined
          ? {}
          : { actualCostUsd: mediaCostUsd(job.pricing, status.usage) }),
        durationMs: now().getTime() - job.startedAt,
      };
      await options.receiptSink?.write(closed);
      open.delete(receiptId);

      return { state: 'succeeded', assets, receipt: closed };
    },
  };
}
