import { setSecretBodySchema, type SecretsView } from '@filmzy/contracts';
import { parseSecretRef } from '@filmzy/troupe';
import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { parseBody } from '../../http/parse-body.js';
import { TroupeConfigService } from '../troupe/troupe-config.service.js';
import { SecretStoreError } from './file-secret-store.js';
import { SecretsService } from './secrets.service.js';

@Controller('secrets')
export class SecretsController {
  constructor(
    private readonly secrets: SecretsService,
    private readonly config: TroupeConfigService,
  ) {}

  @Get()
  list(): SecretsView {
    return this.secrets.view(this.config.currentConfig());
  }

  /** In sola scrittura: la risposta non contiene mai il valore appena salvato. */
  @Put(':name')
  set(@Param('name') name: string, @Body() body: unknown): SecretsView {
    const { value } = parseBody(setSecretBodySchema, body);
    return this.change(name, () => {
      this.secrets.set(name, value);
    });
  }

  @Delete(':name')
  remove(@Param('name') name: string): SecretsView {
    return this.change(name, () => {
      this.secrets.delete(name);
    });
  }

  private change(name: string, action: () => void): SecretsView {
    // Il nome entra in un file: si controlla con la stessa regola dei riferimenti `secret:NOME`.
    if (parseSecretRef(`secret:${name}`) === undefined) {
      throw domainError(400, 'invalid_request', { details: { field: 'name' } });
    }

    try {
      action();
    } catch (error) {
      if (error instanceof SecretStoreError) throw domainError(503, error.code);
      throw error;
    }
    return this.list();
  }
}
