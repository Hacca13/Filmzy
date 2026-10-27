import {
  publishBodySchema,
  restoreBodySchema,
  saveDraftBodySchema,
  type ConfigDiff,
  type DraftView,
  type PublishResponse,
  type ReleaseList,
} from '@filmzy/contracts';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { parseBody } from '../../http/parse-body.js';
import { TroupeConfigService } from './troupe-config.service.js';

/**
 * Le rotte della bozza e della pubblicazione (§4.5). Nessuna logica: decide il servizio, qui si
 * controlla l'ingresso e si traduce l'esito in una risposta.
 */
@Controller('troupe')
export class TroupeConfigController {
  constructor(private readonly config: TroupeConfigService) {}

  @Get('draft')
  async getDraft(): Promise<DraftView> {
    return this.orNotFound(await this.config.draftView());
  }

  @Put('draft')
  async putDraft(@Body() body: unknown): Promise<DraftView> {
    const { config } = parseBody(saveDraftBodySchema, body);
    return this.orNotFound(await this.config.editDraft(config));
  }

  @Delete('draft')
  async deleteDraft(): Promise<DraftView> {
    return this.orNotFound(await this.config.discardDraft());
  }

  @Post('draft/reset')
  @HttpCode(200)
  async resetDraft(): Promise<DraftView> {
    const view = await this.config.resetDraftToSeed();
    if (view === undefined) throw domainError(500, 'config_invalid');
    return view;
  }

  @Post('publish')
  @HttpCode(200)
  async publish(@Body() body: unknown): Promise<PublishResponse> {
    const { note } = parseBody(publishBodySchema, body);
    return this.config.publishDraft(note);
  }

  @Get('draft/diff')
  draftDiff(): ConfigDiff {
    return this.config.draftDiff();
  }

  @Get('releases')
  releases(): ReleaseList {
    return this.config.releaseList();
  }

  @Get('releases/:id/diff')
  releaseDiff(@Param('id') id: string): ConfigDiff {
    const diff = this.config.releaseDiff(id);
    if (diff === undefined) throw domainError(404, 'not_found');
    return diff;
  }

  @Post('releases/:id/restore')
  @HttpCode(200)
  async restore(@Param('id') id: string, @Body() body: unknown): Promise<PublishResponse> {
    const result = await this.config.restoreRelease(id, parseBody(restoreBodySchema, body).note);
    // Una release che non c'è è un 404, non una pubblicazione rifiutata coi suoi problemi.
    if (result.release === undefined && result.issues.some((issue) => issue.code === 'not_found')) {
      throw domainError(404, 'not_found');
    }
    return result;
  }

  /** Senza bozza né release non c'è niente da mostrare: all'avvio il seme lo evita. */
  private orNotFound(view: DraftView | undefined): DraftView {
    if (view === undefined) throw domainError(404, 'not_found');
    return view;
  }
}
