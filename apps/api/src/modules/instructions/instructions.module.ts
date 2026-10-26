import { Module } from '@nestjs/common';

import { InstructionsController } from './instructions.controller.js';
import { InstructionsService } from './instructions.service.js';

@Module({
  controllers: [InstructionsController],
  providers: [InstructionsService],
})
export class InstructionsModule {}
