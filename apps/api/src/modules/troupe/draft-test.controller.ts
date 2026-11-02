import type { DraftTestEstimate, DraftTestResult, TestableRoles } from '@filmzy/contracts';
import { Controller, Get, HttpCode, Param, Post, UseFilters } from '@nestjs/common';

import { ProviderErrorFilter } from '../../http/provider-error.filter.js';
import { DraftTestService } from './draft-test.service.js';

/** Le rotte della prova (§4.5 punto 2). Nessuna logica: decide il servizio. */
@Controller('troupe/test')
@UseFilters(ProviderErrorFilter)
export class DraftTestController {
  constructor(private readonly test: DraftTestService) {}

  @Get('roles')
  roles(): TestableRoles {
    return this.test.roles();
  }

  @Post(':roleId/estimate')
  @HttpCode(200)
  estimate(@Param('roleId') roleId: string): Promise<DraftTestEstimate> {
    return this.test.estimate(roleId);
  }

  @Post(':roleId/run')
  @HttpCode(200)
  run(@Param('roleId') roleId: string): Promise<DraftTestResult> {
    return this.test.run(roleId);
  }
}
