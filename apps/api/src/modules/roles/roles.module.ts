import { Module } from '@nestjs/common';

import { ConnectionsModule } from '../connections/connections.module.js';
import { InstructionsModule } from '../instructions/instructions.module.js';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';

@Module({
  imports: [ConnectionsModule, InstructionsModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
