import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  EXPORT_SHORT_SIDES,
  JOB_INTERRUPTED,
  exportJobPayloadSchema,
  type ExportSource,
  type ExportView,
  type ExportedFile,
} from '@filmzy/contracts';
import { projectsDir, type AssemblyStore, type ExportStore, type SheetStore } from '@filmzy/db';
import { MediaError, resizeFilm, scaledSize, videoSize } from '@filmzy/media';
import { ProviderError } from '@filmzy/troupe';
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { assetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { STALE_WORK_MS, isOpenStatus } from '../shots/work.js';
import { exportFileName, fileErrorCode, openFolderCommand, qualitiesFor } from './export-files.js';
import { ASSEMBLY_STORE, EXPORT_STORE } from './tokens.js';

/** Il tipo di lavoro in coda che esporta il film. */
export const EXPORT_JOB_KIND = 'film_export';

/** Il prefisso dei file a metà: ogni giro ha il suo, per riconoscerli e toglierli. */
const WORK_PREFIX = 'lavoro-';

/** Apre una cartella nel programma del sistema. A parte, così i test non aprono finestre. */
@Injectable()
export class FolderOpener {
  open(folder: string): Promise<void> {
    const [command, target] = openFolderCommand(process.platform, folder);
    return new Promise((resolve, reject) => {
      // Conta solo se parte: su Windows explorer.exe esce con 1 anche quando la cartella si è aperta.
      const child = spawn(command, [target], { detached: true, stdio: 'ignore' });
      child.once('error', reject);
      child.once('spawn', () => {
        child.unref();
        resolve();
      });
    });
  }
}

/**
 * L'esportazione (T5.8, architettura §9): dal film montato fa il file finale nella cartella del film, alla
 * qualità scelta. Non chiama nessun fornitore, quindi non costa; dopo un riavvio però non riparte da sola,
 * come ogni altro lavoro (D84). Alla qualità del film non ricodifica: copia, così non perde niente.
 */
@Injectable()
export class ExportService implements OnModuleInit {
  private readonly log = new Logger('Esportazione');
  /** Le misure di un film montato: il nome del file è il suo contenuto, quindi non cambiano mai. */
  private readonly sizes = new Map<string, { width: number; height: number }>();

  constructor(
    @Inject(EXPORT_STORE) private readonly store: ExportStore,
    @Inject(ASSEMBLY_STORE) private readonly assemblies: AssemblyStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly opener: FolderOpener,
  ) {}

  onModuleInit(): void {
    this.runner.register(
      EXPORT_JOB_KIND,
      (job) => this.makeFile(job.payload),
      (job) => this.closeInterrupted(job.payload),
    );
  }

  /** Il programma si è chiuso prima della fine: si chiude, e il file a metà si toglie subito (D84). */
  private async closeInterrupted(rawPayload: unknown): Promise<void> {
    const { projectId, exportId } = exportJobPayloadSchema.parse(rawPayload);
    if (isOpenStatus(this.store.get(exportId)?.export.status)) {
      this.store.finish(exportId, { status: 'failed', errorCode: JOB_INTERRUPTED });
    }
    await this.removeLeftovers(this.folderOf(projectId));
  }

  async view(projectId: string): Promise<ExportView> {
    this.projects.get(projectId);
    this.closeLost(projectId);
    const film = this.assemblies.lastSucceeded(projectId)?.assembly.assetId;
    const source = film === undefined ? undefined : await this.sourceOf(film);
    const file = await this.fileOf(projectId, film);
    const latest = this.store.latest(projectId)?.export;
    return {
      ...(source === undefined ? {} : { source }),
      ...(latest === undefined ? {} : { latest }),
      ...(file === undefined ? {} : { file }),
    };
  }

  /** «Esporta il film»: controlla che si possa, poi mette in coda. Non costa niente. */
  async start(projectId: string, shortSide: number): Promise<ExportView> {
    this.projects.get(projectId);
    const film = this.assemblies.lastSucceeded(projectId)?.assembly.assetId;
    const source = film === undefined ? undefined : await this.sourceOf(film);
    if (film === undefined || source === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'exportSource' } });
    }
    if (!source.qualities.includes(shortSide)) {
      throw domainError(400, 'invalid_request', { details: { field: 'shortSide' } });
    }
    // I controlli stanno qui, dopo le attese e subito prima di aprire il tentativo: un doppio clic ne apre uno.
    this.closeLost(projectId);
    if (this.isWorking(projectId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'exportWorking' } });
    }
    // Un nuovo montaggio toglie il film di prima: non si esporta qualcosa che sta per sparire.
    if (isOpenStatus(this.assemblies.latest(projectId)?.assembly.status)) {
      throw domainError(409, 'invalid_request', { details: { field: 'assemblyWorking' } });
    }

    const started = this.store.start(projectId, { sourceAssetId: film, shortSide });
    try {
      this.runner.enqueue({
        kind: EXPORT_JOB_KIND,
        payload: { projectId, exportId: started.id },
        projectId,
        idempotencyKey: `${EXPORT_JOB_KIND}:${started.id}`,
      });
    } catch (error) {
      // Senza un lavoro il tentativo resterebbe aperto e bloccherebbe il pulsante.
      this.store.finish(started.id, { status: 'failed', errorCode: 'unknown' });
      throw error;
    }
    return this.view(projectId);
  }

  /** Vero se un'esportazione di questo film è ancora aperta: il montaggio deve aspettarla. */
  isWorking(projectId: string): boolean {
    this.closeLost(projectId);
    return isOpenStatus(this.store.latest(projectId)?.export.status);
  }

  /** Dov'è il file di un'esportazione riuscita, per scaricarlo. Altrimenti «non trovato». */
  async download(projectId: string, exportId: string): Promise<{ file: string; name: string }> {
    const stored = this.store.get(exportId);
    if (stored?.projectId !== projectId || stored.fileName === undefined) {
      throw domainError(404, 'not_found');
    }
    const file = await this.existingExport(projectId, stored.fileName);
    if (file === undefined) throw domainError(404, 'not_found');
    return { file, name: stored.fileName };
  }

  /** «Apri la cartella». Se l'utente l'ha tolta si rifà: aprire una cartella che non c'è darebbe un errore. */
  async openFolder(projectId: string): Promise<void> {
    this.projects.get(projectId);
    const folder = this.folderOf(projectId);
    try {
      await mkdir(folder, { recursive: true });
      await this.opener.open(folder);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException | undefined)?.code ?? 'unknown';
      this.log.warn(`La cartella delle esportazioni non si è potuta aprire: ${code}.`);
      throw domainError(500, 'media_failed', { details: { field: 'folder' } });
    }
  }

  private folderOf(projectId: string): string {
    return path.resolve(projectsDir(this.dataDir), projectId, 'esportazioni');
  }

  /** Il film da esportare con le sue qualità; se il file non c'è più o non si legge, niente. */
  private async sourceOf(assetId: string): Promise<ExportSource | undefined> {
    const size = await this.sizeOf(assetId);
    if (size === undefined) return undefined;
    return { ...size, qualities: qualitiesFor(size, EXPORT_SHORT_SIDES) };
  }

  private async sizeOf(assetId: string): Promise<{ width: number; height: number } | undefined> {
    const file = await this.filmFile(assetId);
    if (file === undefined) return undefined;
    const known = this.sizes.get(assetId);
    if (known !== undefined) return known;
    const size = await videoSize(file);
    if (size !== undefined) this.sizes.set(assetId, size);
    return size;
  }

  /** Dov'è il film montato, se c'è davvero: nel registro può esserci ancora, e sul disco non più. */
  private async filmFile(assetId: string): Promise<string | undefined> {
    const file = assetFile(this.files, this.dataDir, assetId)?.file;
    const onDisk = file === undefined ? undefined : await stat(file).catch(() => undefined);
    return onDisk === undefined ? undefined : file;
  }

  /** L'ultimo file riuscito, se c'è ancora nella cartella: l'utente può averlo spostato o tolto. */
  private async fileOf(
    projectId: string,
    film: string | undefined,
  ): Promise<ExportedFile | undefined> {
    const stored = this.store.lastSucceeded(projectId);
    if (stored?.fileName === undefined) return undefined;
    const file = await this.existingExport(projectId, stored.fileName);
    if (file === undefined) return undefined;
    return {
      id: stored.export.id,
      shortSide: stored.export.shortSide,
      path: file,
      current: stored.sourceAssetId === film,
    };
  }

  /** Il percorso di un file esportato, se c'è ed è davvero nella cartella (CLAUDE.md, «Sicuro»). */
  private async existingExport(projectId: string, fileName: string): Promise<string | undefined> {
    const folder = this.folderOf(projectId);
    const file = path.resolve(folder, fileName);
    if (!file.startsWith(folder + path.sep)) return undefined;
    const onDisk = await stat(file).catch(() => undefined);
    return onDisk === undefined ? undefined : file;
  }

  /** Il lavoro in coda: un errore si scrive sul tentativo, e il lavoro finisce lo stesso. */
  private async makeFile(rawPayload: unknown): Promise<void> {
    const { projectId, exportId } = exportJobPayloadSchema.parse(rawPayload);
    const stored = this.store.get(exportId);
    if (stored === undefined) {
      this.log.warn(
        'Esportazione chiesta per un tentativo che non c’è più: lavoro lasciato perdere.',
      );
      return;
    }
    if (!isOpenStatus(stored.export.status)) return;

    const folder = this.folderOf(projectId);
    const work = path.join(folder, `${WORK_PREFIX}${randomUUID()}.mp4`);
    try {
      this.store.finish(exportId, { status: 'running' });
      await mkdir(folder, { recursive: true });
      await this.removeLeftovers(folder, work);

      await this.writeFile(stored.sourceAssetId, stored.export.shortSide, work);
      const fileName = exportFileName(this.projects.get(projectId).title, stored.export.shortSide);
      // Sul nome definitivo solo a file finito: chi apre la cartella non trova mai un film a metà.
      await rename(work, path.join(folder, fileName));
      this.store.finish(exportId, { status: 'succeeded', fileName });
    } catch (error) {
      const errorCode =
        error instanceof MediaError || error instanceof ProviderError
          ? error.code
          : fileErrorCode(error);
      this.log.warn(`Esportazione fallita: ${errorCode}.`);
      this.store.finish(exportId, { status: 'failed', errorCode });
    } finally {
      await rm(work, { force: true }).catch(() => {
        this.log.warn('Il file a metà dell’esportazione non si è potuto togliere.');
      });
    }
  }

  /** Alla qualità del film si copia, senza perdere niente; a una più bassa si rifà il video. */
  private async writeFile(sourceAssetId: string, shortSide: number, output: string): Promise<void> {
    const input = await this.filmFile(sourceAssetId);
    if (input === undefined) {
      throw new ProviderError('not_found', false, 'Il film montato non c’è più.');
    }
    const size = await this.sizeOf(sourceAssetId);
    if (size === undefined) throw new MediaError('ffmpeg_failed', 'Il film montato non si legge.');
    if (shortSide === Math.min(size.width, size.height)) {
      await copyFile(input, output);
      return;
    }
    await resizeFilm({ input, output, ...scaledSize(size, shortSide) });
  }

  /** I file a metà di giri interrotti: se uno è ancora in uso resterà fino al prossimo giro. */
  private async removeLeftovers(folder: string, current?: string): Promise<void> {
    const names = await readdir(folder).catch((): string[] => []);
    await Promise.all(
      names
        .filter((name) => name.startsWith(WORK_PREFIX) && path.join(folder, name) !== current)
        .map((name) =>
          rm(path.join(folder, name), { force: true }).catch(() => {
            // Un ffmpeg sopravvissuto lo tiene aperto: non ferma l'esportazione di adesso.
          }),
        ),
    );
  }

  /** Un tentativo fermo da troppo tempo si è perso: si chiude, o bloccherebbe il pulsante. */
  private closeLost(projectId: string): void {
    const stored = this.store.latest(projectId);
    if (stored === undefined || !isOpenStatus(stored.export.status)) return;
    if (Date.now() - stored.lastActivityAt > STALE_WORK_MS) {
      this.store.finish(stored.export.id, { status: 'failed', errorCode: 'timeout' });
    }
  }
}
