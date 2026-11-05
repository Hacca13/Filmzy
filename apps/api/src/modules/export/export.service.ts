import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
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
import { existingAssetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { isLostWork, isOpenStatus } from '../shots/work.js';
import {
  exportFileName,
  failureReason,
  fileErrorCode,
  launch,
  openFolderCommand,
  qualitiesFor,
  removeEntries,
} from './export-files.js';
import { ASSEMBLY_STORE, EXPORT_STORE } from './tokens.js';

/** Il tipo di lavoro in coda che esporta il film. */
export const EXPORT_JOB_KIND = 'film_export';

/** Apre una cartella nel programma del sistema. A parte, così i test non aprono finestre. */
@Injectable()
export class FolderOpener {
  open(folder: string): Promise<void> {
    const [command, target] = openFolderCommand(process.platform, folder);
    // Su Windows explorer.exe esce con 1 anche quando la cartella si è aperta.
    return launch(command, [target], { ignoreExitCode: process.platform === 'win32' });
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
    await removeEntries(this.workDirOf(projectId), () => true);
  }

  async view(projectId: string): Promise<ExportView> {
    this.projects.get(projectId);
    this.closeLost(projectId);
    const film = this.filmOf(projectId);
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
    const film = this.filmOf(projectId);
    const source = film === undefined ? undefined : await this.sourceOf(film);
    // Durante l'attesa un montaggio può aver finito e tolto questo film: si riparte da quello nuovo.
    if (this.filmOf(projectId) !== film) return this.start(projectId, shortSide);
    if (film === undefined || source === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'exportSource' } });
    }
    if (!source.qualities.includes(shortSide)) {
      throw domainError(400, 'invalid_request', { details: { field: 'shortSide' } });
    }
    // I controlli stanno qui, dopo le attese e subito prima di aprire il tentativo: un doppio clic ne apre uno.
    if (this.isWorking(projectId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'exportWorking' } });
    }
    // Un nuovo montaggio toglie il film di prima: non si esporta qualcosa che sta per sparire.
    const mounting = this.assemblies.latest(projectId);
    if (
      mounting !== undefined &&
      isOpenStatus(mounting.assembly.status) &&
      !isLostWork(mounting.lastActivityAt)
    ) {
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
      this.log.warn(`La cartella non si è potuta aprire: ${failureReason(error, this.dataDir)}.`);
      throw domainError(500, 'media_failed', { details: { field: 'folder' } });
    }
  }

  private filmOf(projectId: string): string | undefined {
    return this.assemblies.lastSucceeded(projectId)?.assembly.assetId;
  }

  private folderOf(projectId: string): string {
    return path.resolve(projectsDir(this.dataDir), projectId, 'esportazioni');
  }

  /**
   * I file a metà stanno a parte: chi apre la cartella non deve trovare un film incompleto, e fra i file
   * finiti, che prendono il nome dal titolo, non si potrebbe distinguerli. Stesso disco: spostarli è immediato.
   */
  private workDirOf(projectId: string): string {
    return path.resolve(projectsDir(this.dataDir), projectId, 'esportazioni-in-corso');
  }

  /** Il film da esportare con le sue qualità. Se non c'è più o non si legge, niente: lo dice l'interfaccia. */
  private async sourceOf(assetId: string): Promise<ExportSource | undefined> {
    const file = await existingAssetFile(this.files, this.dataDir, assetId);
    if (file === undefined) return undefined;
    try {
      const size = await this.sizeOf(assetId, file);
      return size === undefined
        ? undefined
        : { ...size, qualities: qualitiesFor(size, EXPORT_SHORT_SIDES) };
    } catch (error) {
      if (!(error instanceof MediaError)) throw error;
      this.log.warn(`Il film montato non si legge: ${failureReason(error, this.dataDir)}.`);
      return undefined;
    }
  }

  private async sizeOf(
    assetId: string,
    file: string,
  ): Promise<{ width: number; height: number } | undefined> {
    const known = this.sizes.get(assetId);
    if (known !== undefined) return known;
    const size = await videoSize(file);
    if (size !== undefined) this.sizes.set(assetId, size);
    return size;
  }

  /** L'ultimo file riuscito che c'è ancora nella cartella: l'utente può aver spostato o tolto gli altri. */
  private async fileOf(
    projectId: string,
    film: string | undefined,
  ): Promise<ExportedFile | undefined> {
    for (const stored of this.store.succeeded(projectId)) {
      const file =
        stored.fileName === undefined
          ? undefined
          : await this.existingExport(projectId, stored.fileName);
      if (file !== undefined) {
        return {
          id: stored.export.id,
          shortSide: stored.export.shortSide,
          path: file,
          current: stored.sourceAssetId === film,
        };
      }
    }
    return undefined;
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
    const workDir = this.workDirOf(projectId);
    const work = path.join(workDir, `${randomUUID()}.mp4`);
    let replacing = false;
    try {
      this.store.finish(exportId, { status: 'running' });
      await Promise.all([mkdir(folder, { recursive: true }), mkdir(workDir, { recursive: true })]);
      // Si lavora un'esportazione alla volta per film: ciò che c'è è di un giro interrotto.
      await removeEntries(workDir, () => true);

      await this.writeFile(stored.sourceAssetId, stored.export.shortSide, work);
      const fileName = exportFileName(this.projects.get(projectId).title, stored.export.shortSide);
      replacing = true;
      await rename(work, path.join(folder, fileName));
      this.store.finish(exportId, { status: 'succeeded', fileName });
    } catch (error) {
      const errorCode =
        error instanceof MediaError || error instanceof ProviderError
          ? error.code
          : fileErrorCode(error, replacing);
      this.log.warn(`Esportazione fallita: ${failureReason(error, this.dataDir)}.`);
      this.store.finish(exportId, { status: 'failed', errorCode });
    } finally {
      await rm(work, { force: true }).catch(() => {
        this.log.warn('Il file a metà dell’esportazione non si è potuto togliere.');
      });
    }
  }

  /** Alla qualità del film si copia, senza perdere niente; a una più bassa si rifà il video. */
  private async writeFile(sourceAssetId: string, shortSide: number, output: string): Promise<void> {
    const input = await existingAssetFile(this.files, this.dataDir, sourceAssetId);
    if (input === undefined) {
      throw new ProviderError('not_found', false, 'Il film montato non c’è più.');
    }
    const size = await this.sizeOf(sourceAssetId, input);
    if (size === undefined) throw new MediaError('ffmpeg_failed', 'Il film montato non si legge.');
    if (shortSide === Math.min(size.width, size.height)) {
      await copyFile(input, output);
      return;
    }
    await resizeFilm({ input, output, ...scaledSize(size, shortSide) });
  }

  /** Un tentativo fermo da troppo tempo si è perso: si chiude, o bloccherebbe il pulsante. */
  private closeLost(projectId: string): void {
    const stored = this.store.latest(projectId);
    if (stored === undefined || !isOpenStatus(stored.export.status)) return;
    if (isLostWork(stored.lastActivityAt)) {
      this.store.finish(stored.export.id, { status: 'failed', errorCode: 'timeout' });
    }
  }
}
