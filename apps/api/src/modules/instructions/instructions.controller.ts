import {
  chooseInstructionVersionBodySchema,
  createInstructionVersionBodySchema,
  previewInstructionsBodySchema,
  type CreateInstructionVersionResponse,
  type InstructionText,
  type InstructionsOverview,
  type PreviewInstructionsResponse,
  type RoleInstructions,
} from '@filmzy/contracts';
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { InstructionsService } from './instructions.service.js';

@Controller('instructions')
export class InstructionsController {
  constructor(private readonly instructions: InstructionsService) {}

  @Get()
  overview(): Promise<InstructionsOverview> {
    return this.instructions.overview();
  }

  @Get(':roleId/versions/:version')
  versionText(
    @Param('roleId') roleId: string,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<InstructionText> {
    return this.instructions.versionText(roleId, version);
  }

  @Post(':roleId/preview')
  @HttpCode(200)
  preview(
    @Param('roleId') roleId: string,
    @Body() body: unknown,
  ): Promise<PreviewInstructionsResponse> {
    return this.instructions.preview(roleId, parseBody(previewInstructionsBodySchema, body).text);
  }

  @Post(':roleId/versions')
  @HttpCode(200)
  createVersion(
    @Param('roleId') roleId: string,
    @Body() body: unknown,
  ): Promise<CreateInstructionVersionResponse> {
    const { text, basedOn } = parseBody(createInstructionVersionBodySchema, body);
    return this.instructions.createVersion(roleId, text, basedOn);
  }

  @Put(':roleId/choice')
  choose(@Param('roleId') roleId: string, @Body() body: unknown): Promise<RoleInstructions> {
    return this.instructions.choose(
      roleId,
      parseBody(chooseInstructionVersionBodySchema, body).version,
    );
  }
}
