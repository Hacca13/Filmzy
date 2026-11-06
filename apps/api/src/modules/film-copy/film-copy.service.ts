import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
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
  assetRowsByIds,
  filmExists,
  filmHasOpenJobs,
  foreignRowProblem,
  projectsDir,
  readFilmRows,
  upgradeFilmRows,
  writeFilmRows,
  type FilmRow,
  type OpenedDatabase,
} from '@filmzy/db';
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
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

/** Il motivo per cui una copia non si salva o non si apre, per l'interfaccia. */
const rejected = (field: string) => domainError(400, 'invalid_request', { details: { field } });

/**
 * La copia di un film (T6.3, D92): un file `.filmzy` con le righe del film e i suoi file, da riaprire anche su
 * un altro computer. Le chiavi non ci sono: non stanno nel database (D45). Lavora sul computer, quindi non
 * costa niente.
 */
@Injectable()
export class FilmCopyService implements OnModuleInit {
  private readonly log = new Logger('Copia del film');
  private importing = false;

  constructor(
    @Inject(OPENED_DATABASE) private readonly opened: OpenedDatabase,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly projects: ProjectsService,
  ) {}

  /** Un'apertura interrotta da un programma chiuso di colpo: all'avvio nessuna è in corso, si toglie. */
  async onModuleInit(): Promise<void> {
    await rm(path.join(this.dataDir, INCOMING_DIR), { recursive: true, force: true }).catch(
      (error: unknown) => {
        this.log.warn(
          `Una copia aperta a metà non si è potuta togliere: ${failureReason(error, this.dataDir)}.`,
        );
      },
    );
  }

  /** Con un lavoro aperto la copia porterebbe con sé un'immagine o un video a metà: prima si aspetta che finisca. */
  checkExport(projectId: string): Project {
    const project = this.projects.get(projectId);
    if (filmHasOpenJobs(this.opened.db, projectId)) throw rejected('filmWorking');
    return project;
  }

  /** «Salva una copia del film»: lo zip si scrive mentre si scarica, senza file in mezzo. */
  async exportFilm(projectId: string): Promise<{ stream: Readable; name: string }> {
    const project = this.checkExport(projectId);
    const files = await this.filesOf(projectId);
    const tables = readFilmRows(this.opened.db, projectId);
    const manifest: FilmCopyManifest = {
      format: 'filmzy-film',
      formatVersion: FILM_COPY_FORMAT_VERSION,
      schemaVersion: this.opened.schemaVersion,
      appVersion: process.env.FILMZY_APP_VERSION ?? DEVELOPMENT_VERSION,
      exportedAt: new Date().toISOString(),
      projectId,
      tables: { ...tables, assets: this.assetRowsOf(projectId, files, tables.assets ?? []) },
    };

    const zip = new yazl.ZipFile();
    const output = zip.outputStream as Readable;
    // Un file tolto mentre la copia si scrive: senza chi ascolta, l'errore chiuderebbe il programma.
    zip.on('error', (error: unknown) => {
      this.log.warn(`La copia non si è potuta scrivere: ${failureReason(error, this.dataDir)}.`);
      output.destroy(error instanceof Error ? error : undefined);
    });
    zip.addBuffer(Buffer.from(JSON.stringify(manifest)), FILM_COPY_MANIFEST);
    for (const file of files) {
      // Immagini, video e suoni sono già compressi: comprimerli di nuovo costerebbe tempo e basta.
      zip.addFile(path.join(this.dataDir, file), `files/${file}`, { compress: false });
    }
    zip.end();
    return { stream: output, name: `${titleInName(project.title)}${FILM_COPY_EXTENSION}` };
  }

  /** I file della cartella del film, come percorsi relativi alla cartella dei dati, tranne quelli che si rifanno. */
  private async filesOf(projectId: string): Promise<string[]> {
    const own = path.join(projectsDir(this.dataDir), projectId);
    const entries = await readdir(own, { recursive: true, withFileTypes: true }).catch(
      (error: unknown) => {
        // Un film senza ancora nessun file non ha la cartella: la copia ha solo le righe.
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
      },
    );
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(entry.parentPath, entry.name))
      .filter((absolute) => !LEFT_OUT.has(path.relative(own, absolute).split(path.sep)[0] ?? ''))
      .map((absolute) => path.relative(this.dataDir, absolute).split(path.sep).join('/'))
      .sort();
  }

  /**
   * Le righe dei file che sono nella copia. Il nome di un file è il suo contenuto: se un altro film aveva già lo
   * stesso, la riga è di quel film e punta alla sua cartella. Nella copia diventa di questo film e punta al file
   * nella sua cartella, perché l'altro film non viaggia con lui.
   */
  private assetRowsOf(
    projectId: string,
    files: readonly string[],
    own: readonly FilmRow[],
  ): FilmRow[] {
    const inCopy = new Set(files);
    const kept = own.filter((row) => typeof row.path === 'string' && inCopy.has(row.path));
    const keptIds = new Set(kept.map((row) => row.id));
    const fileById = new Map<string, string>();
    for (const file of files) {
      const id = path.posix.parse(file).name;
      if (!keptIds.has(id) && !fileById.has(id)) fileById.set(id, file);
    }
    const shared = assetRowsByIds(this.opened.db, [...fileById.keys()]).map((row) => ({
      ...row,
      path: fileById.get(row.id as string),
      project_id: projectId,
      // Lo scontrino è dell'altro film, che nella copia non c'è.
      generation_id: null,
    }));
    return [...kept, ...shared];
  }

  /**
   * «Apri un film salvato»: la copia arriva come file, si controlla tutta, e solo alla fine il film va al suo
   * posto. Un film che c'è già non si tocca: per la prima versione non si sostituisce (D92).
   */
  async importFilm(body: Readable): Promise<Project> {
    if (this.importing) throw rejected('importWorking');
    this.importing = true;
    const work = path.join(this.dataDir, INCOMING_DIR, randomUUID());
    try {
      await mkdir(work, { recursive: true });
      const archive = path.join(work, `copia${FILM_COPY_EXTENSION}`);
      await pipeline(body, createWriteStream(archive));
      return await this.unpack(archive, path.join(work, 'file'));
    } catch (error) {
      if (!isDomainError(error)) {
        this.log.warn(`La copia non si è aperta: ${failureReason(error, this.dataDir)}.`);
        // Il motivo va nel registro: per chi legge basta sapere che non si è aperta, e se il disco è pieno.
        throw domainError(500, 'media_failed', {
          details: { field: isDiskFull(error) ? 'diskFull' : 'copy' },
        });
      }
      throw error;
    } finally {
      this.importing = false;
      await rm(work, { recursive: true, force: true }).catch((error: unknown) => {
        this.log.warn(
          `I file di passaggio della copia non si sono potuti togliere: ${failureReason(error, this.dataDir)}.`,
        );
      });
    }
  }

  private async unpack(archive: string, staging: string): Promise<Project> {
    // Prima l'indice, tutto controllato: nessun file si scrive per una copia che non si può aprire.
    const manifest = await withZip(archive, readManifest);
    const { projectId } = manifest;
    if (manifest.schemaVersion > this.opened.schemaVersion) throw rejected('filmTooNew');
    if (!isSafeId(projectId) || foreignRowProblem(manifest.tables, projectId) !== undefined) {
      throw rejected('copyFile');
    }
    if (filmExists(this.opened.db, projectId)) throw rejected('filmExists');
    const tables = this.upgraded(manifest);

    await withZip(archive, (zip) => extractFiles(zip, staging, projectId));
    await this.putInPlace(projectId, path.join(staging, 'progetti', projectId), () => {
      try {
        writeFilmRows(this.opened.db, tables);
      } catch (error) {
        // Righe che questo programma non accetta: la copia è rovinata. Il disco pieno resta disco pieno.
        if (isDiskFull(error)) throw error;
        throw rejected('copyFile');
      }
    });
    return this.projects.get(projectId);
  }

  /**
   * Una copia di una versione vecchia passa per gli stessi aggiornamenti dei dati veri (D94). Righe che non entrano
   * nello schema della sua versione vogliono dire una copia rovinata; il disco pieno resta disco pieno. Il
   * controllo si rifà sulle righe aggiornate: una migrazione non deve poter portare fuori dal film.
   */
  private upgraded(manifest: FilmCopyManifest): Readonly<Record<string, readonly FilmRow[]>> {
    let tables: Readonly<Record<string, readonly FilmRow[]>>;
    try {
      tables = upgradeFilmRows(this.opened, manifest);
    } catch (error) {
      if (isDiskFull(error)) throw error;
      throw rejected('copyFile');
    }
    if (foreignRowProblem(tables, manifest.projectId) !== undefined) throw rejected('copyFile');
    return tables;
  }

  /**
   * Mette la cartella del film al suo posto e poi scrive le righe. Se le righe non entrano, torna tutto com'era.
   * Una cartella rimasta senza il suo film (un'apertura interrotta di colpo) si mette da parte durante il lavoro.
   */
  private async putInPlace(
    projectId: string,
    stagedOwn: string,
    writeRows: () => void,
  ): Promise<void> {
    const own = path.join(projectsDir(this.dataDir), projectId);
    const aside = (await exists(own)) ? `${own}.prima-${randomUUID()}` : undefined;
    if (aside !== undefined) await rename(own, aside);
    try {
      await mkdir(path.dirname(own), { recursive: true });
      if (await exists(stagedOwn)) await rename(stagedOwn, own);
      else await mkdir(own);
      writeRows();
    } catch (error) {
      await this.putBack(own, aside);
      throw error;
    }
    if (aside !== undefined) {
      await rm(aside, { recursive: true, force: true }).catch((error: unknown) => {
        this.log.warn(`Una cartella vecchia è rimasta: ${failureReason(error, this.dataDir)}.`);
      });
    }
  }

  private async putBack(own: string, aside: string | undefined): Promise<void> {
    try {
      await rm(own, { recursive: true, force: true });
      if (aside !== undefined) await rename(aside, own);
    } catch (error) {
      // Il motivo che conta è l'errore di prima, che arriva all'utente: questo serve solo a capire dopo.
      this.log.warn(
        `La cartella del film non è tornata com'era: ${failureReason(error, this.dataDir)}.`,
      );
    }
  }
}

function isDomainError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'getStatus' in error;
}

function isDiskFull(error: unknown): boolean {
  return (
    fileErrorCode(error) === 'disk_full' ||
    (error as NodeJS.ErrnoException | undefined)?.code === 'SQLITE_FULL'
  );
}

/** Un errore del disco di questo computer, non della copia: quelli di yauzl non hanno la chiamata di sistema. */
function isFileSystemError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'syscall' in error;
}

/** Un id che diventa una cartella: niente separatori né punti all'inizio. */
function isSafeId(projectId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(projectId);
}

const exists = async (target: string) => (await stat(target).catch(() => undefined)) !== undefined;

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

/** Un dato rovinato dentro lo zip rende la copia non valida; un problema del disco resta quello che è. */
async function fromCopy<T>(step: () => Promise<T>): Promise<T> {
  try {
    return await step();
  } catch (error) {
    if (isDomainError(error) || isFileSystemError(error)) throw error;
    throw rejected('copyFile');
  }
}

/** L'indice: la prima cosa da leggere, e da controllare prima di scrivere qualsiasi file. */
async function readManifest(zip: yauzl.ZipFile): Promise<FilmCopyManifest> {
  for await (const entry of entriesOf(zip)) {
    if (entry.fileName !== FILM_COPY_MANIFEST) continue;
    if (entry.uncompressedSize > MANIFEST_MAX_BYTES) throw rejected('copyFile');
    return fromCopy(async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of await readStream(zip, entry)) chunks.push(chunk as Buffer);
      return filmCopyManifestSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    });
  }
  throw rejected('copyFile');
}

/**
 * I file della copia, nella cartella di passaggio. Si accettano solo quelli della cartella del film: un nome
 * che esce, o che è di un altro film, rende la copia non valida.
 */
async function extractFiles(zip: yauzl.ZipFile, staging: string, projectId: string): Promise<void> {
  const folder = path.resolve(staging, 'progetti', projectId);
  for await (const entry of entriesOf(zip)) {
    if (entry.fileName === FILM_COPY_MANIFEST || entry.fileName.endsWith('/')) continue;
    const relative = entry.fileName.slice('files/'.length);
    const target = path.resolve(staging, relative);
    if (
      !entry.fileName.startsWith(`files/progetti/${projectId}/`) ||
      !target.startsWith(folder + path.sep)
    ) {
      throw rejected('copyFile');
    }
    await mkdir(path.dirname(target), { recursive: true });
    await fromCopy(async () => {
      await pipeline(await readStream(zip, entry), createWriteStream(target));
    });
  }
}
