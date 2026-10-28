import path from 'node:path';

import type { SheetStore } from '@filmzy/db';
import { Controller, Get, Inject, Module, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

import { domainError } from '../../http/domain-error.js';
import { CastModule } from '../cast/cast.module.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';

/** L'id di un file è il suo checksum (sha256): solo lettere e cifre esadecimali, 64 in tutto. */
const ASSET_ID = /^[0-9a-f]{64}$/;

/**
 * I file dei film (T3.6): le immagini si aprono da qui (`GET /api/assets/:assetId`). Si serve solo
 * ciò che sta nel registro dei file, e il percorso si controlla prima di aprirlo: un id che non è
 * un checksum, o un percorso che esce dalla cartella dei dati, dà «non trovato» (CLAUDE.md,
 * «Sicuro, anche se gira in locale»).
 */
@Controller('assets')
class AssetsController {
  constructor(
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
  ) {}

  @Get(':assetId')
  serve(@Param('assetId') assetId: string, @Res() response: Response): void {
    const record = ASSET_ID.test(assetId) ? this.files.getAsset(assetId) : undefined;
    if (record === undefined) throw domainError(404, 'not_found');

    const root = path.resolve(this.dataDir);
    const file = path.resolve(root, record.path);
    if (!file.startsWith(root + path.sep)) throw domainError(404, 'not_found');

    // Il nome del file è il suo contenuto: non cambia mai, quindi si può tenere in memoria.
    response.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    response.type(record.contentType);
    response.sendFile(file, (error) => {
      if (error !== undefined && !response.headersSent) response.status(404).end();
    });
  }
}

@Module({ imports: [CastModule], controllers: [AssetsController] })
export class AssetsModule {}
