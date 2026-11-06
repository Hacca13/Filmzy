import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { copyFile, mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import {
  FILM_COPY_EXTENSION,
  FILM_COPY_FORMAT_VERSION,
  FILM_COPY_MANIFEST,
  filmCopyManifestSchema,
  type FilmCopyManifest,
  type Project,
} from '@filmzy/contracts';
import {
  filmExists,
  filmHasOpenJobs,
  foreignRowProblem,
  projectsDir,
  readFilmRows,
  writeFilmRows,
  type OpenedDatabase,
} from '@filmzy/db';
import { Inject, Injectable, Logger } from '@nestjs/common';
import yauzl from 'yauzl';
import yazl from 'yazl';

import { domainError } from '../../http/domain-error.js';
import { DATA_DIR, OPENED_DATABASE } from '../database/database.module.js';
import { failureReason, fileErrorCode, titleInName } from '../export/export-files.js';
import { ProjectsService } from '../projects/projects.service.js';

/** Le cartelle del film che non entrano nella copia: il film montato e i file esportati si rifanno gratis. */
const LEFT_OUT = new Set(['montaggio', 'esportazioni', 'esportazioni-in-corso']);

/** L'indice non può pesare più di così: oltre è un file fatto apposta per riempire la memoria. */
const MANIFEST_MAX_BYTES = 200 * 1024 * 1024;

/** Dove arrivano le copie da aprire, e dove si prepara il film prima di metterlo al suo posto. */
const INCOMING_DIR = 'progetti-in-arrivo';

const DEVELOPMENT_VERSION = '0.0.0-sviluppo';

/** Il motivo per cui una copia non si apre, per l'interfaccia. */
const rejected = (field: string) => domainError(400, 'invalid_request', { details: { field } });

/**
 * La copia di un film (T6.3, D92): un file `.filmzy` con le righe del film e i suoi file, da riaprire anche su
 * un altro computer. Le chiavi non ci sono: non stanno nel database (D45). Lavora sul computer, quindi non
 * costa niente.
 */
@Injectable()
export class FilmCopyService {
  private readonly log = new Logger('Copia del film');
  private importing = false;

  constructor(
    @Inject(OPENED_DATABASE) private readonly opened: OpenedDatabase,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly projects: ProjectsService,
  ) {}

  /** «Salva una copia del film»: lo zip si scrive mentre si scarica, senza file in mezzo. */
  async exportFilm(projectId: string): Promise<{ stream: Readable; name: string }> {
    const project = this.projects.get(projectId);
    const manifest: FilmCopyManifest = {
      format: 'filmzy-film',
      formatVersion: FILM_COPY_FORMAT_VERSION,
      schemaVersion: this.opened.schemaVersion,
      appVersion: process.env.FILMZY_APP_VERSION ?? DEVELOPMENT_VERSION,
      exportedAt: new Date().toISOString(),
      projectId,
      tables: readFilmRows(this.opened.db, projectId),
    };

    const zip = new yazl.ZipFile();
    zip.addBuffer(Buffer.from(JSON.stringify(manifest)), FILM_COPY_MANIFEST);
    for (const file of await this.filesOf(projectId, manifest)) {
      // Immagini, video e suoni sono già compressi: comprimerli di nuovo costerebbe tempo e basta.
      zip.addFile(path.join(this.dataDir, file), `files/${file}`, { compress: false });
    }
    zip.end();
    return {
      stream: zip.outputStream as Readable,
      name: `${titleInName(project.title)}${FILM_COPY_EXTENSION}`,
    };
  }

  /**
   * I file del film, come percorsi relativi alla cartella dei dati: quelli della sua cartella, tranne il film
   * montato e i file esportati, e quelli del registro che stanno altrove (due film con la stessa immagine).
   */
  private async filesOf(projectId: string, manifest: FilmCopyManifest): Promise<string[]> {
    const own = path.join(projectsDir(this.dataDir), projectId);
    const entries = await readdir(own, { recursive: true, withFileTypes: true }).catch(() => []);
    const files = new Set<string>();
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const absolute = path.join(entry.parentPath, entry.name);
      const relative = path.relative(own, absolute);
      if (LEFT_OUT.has(relative.split(path.sep)[0] ?? '')) continue;
      files.add(toPosix(path.relative(this.dataDir, absolute)));
    }
    for (const row of manifest.tables.assets ?? []) {
      const stored = typeof row.path === 'string' ? row.path : undefined;
      if (stored === undefined || files.has(stored) || !insideProjects(this.dataDir, stored))
        continue;
      if ((await stat(path.join(this.dataDir, stored)).catch(() => undefined))?.isFile() === true) {
        files.add(stored);
      }
    }
    return [...files].sort();
  }

  /**
   * «Apri un film salvato»: la copia arriva come file, si controlla tutta, e solo alla fine il film va al suo
   * posto. Un film che c'è già si sostituisce solo se l'utente lo chiede.
   */
  async importFilm(body: Readable, { replace }: { replace: boolean }): Promise<Project> {
    if (this.importing) throw rejected('importWorking');
    this.importing = true;
    const incoming = path.join(this.dataDir, INCOMING_DIR);
    const work = path.join(incoming, randomUUID());
    try {
      await mkdir(work, { recursive: true });
      const archive = path.join(work, `copia${FILM_COPY_EXTENSION}`);
      await pipeline(body, createWriteStream(archive));
      return await this.unpack(archive, path.join(work, 'file'), replace);
    } catch (error) {
      if (!isDomainError(error)) {
        this.log.warn(`La copia non si è aperta: ${failureReason(error, this.dataDir)}.`);
        // Il motivo va nel registro: per chi legge basta sapere che non si è aperta, e che il disco può essere pieno.
        throw domainError(500, 'media_failed', {
          details: { field: fileErrorCode(error) === 'disk_full' ? 'diskFull' : 'copy' },
        });
      }
      throw error;
    } finally {
      this.importing = false;
      await rm(work, { recursive: true, force: true }).catch(() => {
        this.log.warn('I file di passaggio della copia non si sono potuti togliere.');
      });
    }
  }

  private async unpack(archive: string, staging: string, replace: boolean): Promise<Project> {
    // Prima l'indice, tutto controllato: nessun file si scrive per una copia che non si può aprire.
    const manifest = await withZip(archive, readManifest);
    const { projectId, tables } = manifest;
    if (manifest.schemaVersion > this.opened.schemaVersion) throw rejected('filmTooNew');
    if (foreignRowProblem(tables, projectId) !== undefined || !isSafeId(projectId)) {
      throw rejected('copyFile');
    }
    const exists = filmExists(this.opened.db, projectId);
    if (exists && !replace) throw rejected('filmExists');
    if (exists && filmHasOpenJobs(this.opened.db, projectId)) throw rejected('filmWorking');

    const files = await withZip(archive, (zip) => extractFiles(zip, staging));
    await this.putInPlace(projectId, staging, files, () => {
      writeFilmRows(this.opened.db, projectId, tables, { replace: exists });
    });
    return this.projects.get(projectId);
  }

  /**
   * Mette i file al loro posto e poi scrive le righe. Se le righe non entrano, torna tutto com'era: il film di
   * prima, se c'era, non si perde.
   */
  private async putInPlace(
    projectId: string,
    staging: string,
    files: readonly string[],
    writeRows: () => void,
  ): Promise<void> {
    const own = path.join(projectsDir(this.dataDir), projectId);
    const stagedOwn = path.join(staging, 'progetti', projectId);
    const aside = `${own}.prima-${randomUUID()}`;
    const hadFolder = (await stat(own).catch(() => undefined)) !== undefined;

    if (hadFolder) await rename(own, aside);
    try {
      await mkdir(path.dirname(own), { recursive: true });
      if ((await stat(stagedOwn).catch(() => undefined)) === undefined) await mkdir(own);
      else await rename(stagedOwn, own);
      // I file di un altro film (la stessa immagine usata da due film) si mettono solo se mancano.
      for (const file of files.filter((name) => !name.startsWith(`progetti/${projectId}/`))) {
        const target = path.join(this.dataDir, file);
        if ((await stat(target).catch(() => undefined)) !== undefined) continue;
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(path.join(staging, file), target);
      }
      writeRows();
    } catch (error) {
      await rm(own, { recursive: true, force: true });
      if (hadFolder) await rename(aside, own);
      throw error;
    }
    if (hadFolder) await rm(aside, { recursive: true, force: true });
  }
}

function isDomainError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'getStatus' in error;
}

/** Un id che diventa una cartella: niente separatori né punti all'inizio. */
function isSafeId(projectId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(projectId);
}

const toPosix = (relative: string) => relative.split(path.sep).join('/');

/** Il percorso sta nella cartella dei film: niente fuori, niente risalite. */
function insideProjects(dataDir: string, relative: string): boolean {
  const root = path.resolve(projectsDir(dataDir));
  const resolved = path.resolve(dataDir, relative);
  return resolved.startsWith(root + path.sep);
}

async function withZip<T>(file: string, use: (zip: yauzl.ZipFile) => Promise<T>): Promise<T> {
  const zip = await openZip(file);
  try {
    return await use(zip);
  } finally {
    zip.close();
  }
}

function openZip(file: string): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(
      file,
      { lazyEntries: true, autoClose: false, strictFileNames: true },
      (error, zip) => {
        if (error !== null) reject(rejected('copyFile'));
        else resolve(zip);
      },
    );
  });
}

/** Le voci dello zip una alla volta. */
async function* entriesOf(zip: yauzl.ZipFile): AsyncGenerator<yauzl.Entry> {
  for (;;) {
    const entry = await new Promise<yauzl.Entry | undefined>((resolve, reject) => {
      const onEntry = (found: yauzl.Entry) => {
        cleanup();
        resolve(found);
      };
      const onEnd = () => {
        cleanup();
        resolve(undefined);
      };
      const onError = () => {
        cleanup();
        reject(rejected('copyFile'));
      };
      const cleanup = () => {
        zip.off('entry', onEntry);
        zip.off('end', onEnd);
        zip.off('error', onError);
      };
      zip.on('entry', onEntry);
      zip.on('end', onEnd);
      zip.on('error', onError);
      zip.readEntry();
    });
    if (entry === undefined) return;
    yield entry;
  }
}

function readStream(zip: yauzl.ZipFile, entry: yauzl.Entry): Promise<Readable> {
  return new Promise((resolve, reject) => {
    zip.openReadStream(entry, (error, stream) => {
      if (error !== null) reject(rejected('copyFile'));
      else resolve(stream);
    });
  });
}

/** L'indice: la prima cosa da leggere, e da controllare prima di scrivere qualsiasi file. */
async function readManifest(zip: yauzl.ZipFile): Promise<FilmCopyManifest> {
  for await (const entry of entriesOf(zip)) {
    if (entry.fileName !== FILM_COPY_MANIFEST) continue;
    if (entry.uncompressedSize > MANIFEST_MAX_BYTES) throw rejected('copyFile');
    const chunks: Buffer[] = [];
    for await (const chunk of await readStream(zip, entry)) chunks.push(chunk as Buffer);
    try {
      return filmCopyManifestSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch {
      throw rejected('copyFile');
    }
  }
  throw rejected('copyFile');
}

/**
 * I file della copia, nella cartella di passaggio. Si accettano solo `files/progetti/...`: un nome che esce
 * dalla cartella, o che non è un file del film, rende la copia non valida.
 */
async function extractFiles(zip: yauzl.ZipFile, staging: string): Promise<string[]> {
  const extracted: string[] = [];
  for await (const entry of entriesOf(zip)) {
    if (entry.fileName === FILM_COPY_MANIFEST || entry.fileName.endsWith('/')) continue;
    if (!entry.fileName.startsWith('files/')) throw rejected('copyFile');
    const relative = entry.fileName.slice('files/'.length);
    const target = path.resolve(staging, relative);
    if (!relative.startsWith('progetti/') || !target.startsWith(path.resolve(staging) + path.sep)) {
      throw rejected('copyFile');
    }
    await mkdir(path.dirname(target), { recursive: true });
    await pipeline(await readStream(zip, entry), createWriteStream(target));
    extracted.push(relative);
  }
  return extracted;
}
