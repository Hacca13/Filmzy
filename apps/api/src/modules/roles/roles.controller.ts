import {
  setRoleServiceBodySchema,
  setRoleTemperatureBodySchema,
  type RoleChangeResult,
  type RolesOverview,
} from '@filmzy/contracts';
import { Body, Controller, Get, Param, Put } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { RolesService } from './roles.service.js';

/** Le rotte di «Chi fa cosa» (T2.7). Nessuna logica: decide il servizio. */
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  overview(): Promise<RolesOverview> {
    return this.roles.overview();
  }

  @Put(':id/service')
  setService(@Param('id') id: string, @Body() body: unknown): Promise<RoleChangeResult> {
    return this.roles.setService(id, parseBody(setRoleServiceBodySchema, body).modelId);
  }

  @Put(':id/temperature')
  setTemperature(@Param('id') id: string, @Body() body: unknown): Promise<RoleChangeResult> {
    return this.roles.setTemperature(id, parseBody(setRoleTemperatureBodySchema, body).value);
  }
}
