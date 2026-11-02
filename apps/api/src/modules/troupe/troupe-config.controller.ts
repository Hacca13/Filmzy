import {
  publishBodySchema,
  saveDraftBodySchema,
  type DraftView,
  type PublishResponse,
} from '@filmzy/contracts';
import { Body, Controller, Delete, Get, HttpCode, Post, Put } from '@nestjs/common';

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

  /** Senza bozza né release non c'è niente da mostrare: all'avvio il seme lo evita. */
  private orNotFound(view: DraftView | undefined): DraftView {
    if (view === undefined) throw domainError(404, 'not_found');
    return view;
  }
}
