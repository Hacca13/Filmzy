import {
  modelGroupSchema,
  setGroupDefaultBodySchema,
  setMonthlyCapBodySchema,
  setProviderDefaultBodySchema,
  setServicesBodySchema,
  type ConnectionsOverview,
  type ConnectionTestResult,
} from '@filmzy/contracts';
import { Body, Controller, Get, HttpCode, Param, Post, Put, UseFilters } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { parseBody } from '../../http/parse-body.js';
import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { ConnectionsService } from './connections.service.js';

/**
 * Le rotte dei fornitori e dei servizi (T2.7). Nessuna logica: decide il servizio. Ogni modifica
 * risponde con il quadro aggiornato, così l'interfaccia non deve rileggerlo.
 */
@Controller()
@UseFilters(ProviderErrorFilter)
export class ConnectionsController {
  constructor(private readonly connections: ConnectionsService) {}

  @Get('connections')
  overview(): Promise<ConnectionsOverview> {
    return this.connections.overview();
  }

  @Put('connections/:id/services')
  setServices(@Param('id') id: string, @Body() body: unknown): Promise<ConnectionsOverview> {
    return this.connections.setServices(id, parseBody(setServicesBodySchema, body).modelIds);
  }

  @Put('connections/:id/default-service')
  setProviderDefault(@Param('id') id: string, @Body() body: unknown): Promise<ConnectionsOverview> {
    return this.connections.setProviderDefault(
      id,
      parseBody(setProviderDefaultBodySchema, body).modelId,
    );
  }

  @Put('connections/:id/monthly-cap')
  setMonthlyCap(@Param('id') id: string, @Body() body: unknown): Promise<ConnectionsOverview> {
    return this.connections.setMonthlyCap(id, parseBody(setMonthlyCapBodySchema, body).usd);
  }

  /** La prova che non costa: una lettura al fornitore. Se non va, risponde l'errore del dominio. */
  @Post('connections/:id/test')
  @HttpCode(200)
  async test(@Param('id') id: string): Promise<ConnectionTestResult> {
    await this.connections.test(id);
    return { ok: true };
  }

  @Put('groups/:group/default')
  setGroupDefault(
    @Param('group') group: string,
    @Body() body: unknown,
  ): Promise<ConnectionsOverview> {
    const parsedGroup = modelGroupSchema.safeParse(group);
    if (!parsedGroup.success) throw domainError(404, 'not_found');
    return this.connections.setGroupDefault(
      parsedGroup.data,
      parseBody(setGroupDefaultBodySchema, body).connectionId,
    );
  }
}
