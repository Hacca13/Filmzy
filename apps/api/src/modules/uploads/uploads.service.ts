import { createHash } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';

import type { UploadedImage, UploadQuery, Uploads } from '@filmzy/contracts';
import { projectsDir, type LocationStore, type SheetStore, type UploadStore } from '@filmzy/db';
import { LocalAssetStore, type ConfigSource, type Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { LOCATION_STORE } from '../locations/tokens.js';
import { registerAssets } from '../media/image-jobs.js';
import { PREFERENCES_STORE } from '../preferences/tokens.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import { readImageBody } from './image-body.js';
import { imageProblems } from './image-checks.js';
import { imageForReading } from './image-for-reading.js';
import { UPLOAD_STORE } from './tokens.js';

/** Come si chiama una foto se chi la carica non le dà un nome. */
const DEFAULT_NAMES = { location: 'Foto del luogo', object: 'Foto dell’oggetto' } as const;

/**
 * Le foto che l'utente carica (T4.8, D19): luoghi e oggetti, **mai persone**. Con la prudenza accesa,
 * un servizio che legge le immagini guarda ogni foto **prima** che venga salvata: se ci sono persone
 * (o un marchio, un personaggio noto, un minore) la foto si rifiuta con `image_rejected` e non resta
 * sul disco. Se il controllo non riesce a rispondere (nessuna chiave, servizio fermo) la foto **non
 * passa**: nessun servizio di riserva e nessun «per questa volta va bene» (regola 6). Con la prudenza
 * spenta, che l'utente sceglie sapendo cosa rischia, la foto si salva senza controllo.
 *
 * Il file si riconosce dai primi byte, non dal tipo dichiarato, e il nome sul disco lo decide il
 * codice (il checksum): niente di ciò che arriva da fuori sceglie un percorso.
 */
@Injectable()
export class UploadsService {
  constructor(
    @Inject(UPLOAD_STORE) private readonly store: UploadStore,
    @Inject(LOCATION_STORE) private readonly locations: LocationStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
    @Inject(TROUPE) private readonly troupe: Pick<Troupe, 'run'>,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(PREFERENCES_STORE) private readonly preferences: { get: () => { imageCheck: boolean } },
    private readonly projects: ProjectsService,
  ) {}

  async list(projectId: string): Promise<Uploads> {
    this.projects.get(projectId);
    return {
      enabled: await this.isEnabled(),
      checking: this.preferences.get().imageCheck,
      uploads: this.store.list(projectId),
    };
  }

  async add(projectId: string, query: UploadQuery, body: unknown): Promise<UploadedImage> {
    const project = this.projects.get(projectId);
    if (!(await this.isEnabled())) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
    this.assertPlace(projectId, query);

    const { bytes, contentType } = readImageBody(body);

    const assetId = createHash('sha256').update(bytes).digest('hex');
    const checking = this.preferences.get().imageCheck;
    const place = { assetId, kind: query.kind, locationId: query.locationId };

    // La stessa foto già caricata per lo stesso posto non si paga di nuovo: se è già controllata, o il
    // controllo è spento, resta quella.
    const known = this.store.find(project.id, place);
    if (known !== undefined && (known.checked || !checking)) return known;

    const description = checking
      ? await this.check(project.id, project.language, assetId, contentType, bytes)
      : undefined;

    const existed = this.files.getAsset(assetId) !== undefined;
    const stored = await new LocalAssetStore(
      path.join(projectsDir(this.dataDir), project.id, 'caricate'),
    ).put({ fileName: assetId, contentType, bytes });
    try {
      registerAssets(this.files, { dataDir: this.dataDir, projectId: project.id }, [stored]);
      return this.store.add({
        projectId: project.id,
        assetId: stored.assetId,
        kind: query.kind,
        ...(query.locationId === undefined ? {} : { locationId: query.locationId }),
        name: query.name ?? DEFAULT_NAMES[query.kind],
        checked: description !== undefined,
        ...(description === undefined ? {} : { description }),
      });
    } catch (error) {
      // Senza il suo record il file non serve a nessuno: non resta sul disco (se era già di altri, sì).
      if (!existed) await rm(stored.path, { force: true });
      throw error;
    }
  }

  private async isEnabled(): Promise<boolean> {
    const loaded = await this.configSource.load();
    return loaded.config?.features.image_upload === true;
  }

  /** Un luogo è di un film; un oggetto non ha luogo. */
  private assertPlace(projectId: string, query: UploadQuery): void {
    if (query.kind === 'object') {
      if (query.locationId !== undefined) {
        throw domainError(400, 'invalid_request', { details: { field: 'locationId' } });
      }
      return;
    }
    const known =
      query.locationId !== undefined &&
      this.locations.list(projectId).some((location) => location.id === query.locationId);
    if (!known) throw domainError(400, 'invalid_request', { details: { field: 'locationId' } });
  }

  /** Fa guardare la foto all'analista; se non va, la rifiuta. Dà la descrizione di ciò che vede. */
  private async check(
    projectId: string,
    language: string,
    assetId: string,
    contentType: string,
    bytes: Buffer,
  ): Promise<string> {
    const image = await imageForReading({ dataDir: this.dataDir, projectId, contentType, bytes });
    const { data } = await this.troupe.run(
      'image_analyst',
      { image: { assetId }, purpose: 'upload', context: null, language },
      { purpose: 'product', projectId },
      [image],
    );

    const problems = imageProblems(data);
    if (problems.length > 0) {
      throw domainError(422, 'image_rejected', { details: { imageProblems: problems } });
    }
    return data.description;
  }
}
