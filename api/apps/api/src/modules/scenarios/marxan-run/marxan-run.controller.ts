import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { XApiGuard } from '@marxan-api/guards/x-api.guard';
import { MarxanRunService } from './marxan-run.service';

@UseGuards(XApiGuard)
@Controller(`${apiGlobalPrefixes.v1}/marxan-run/scenarios`)
export class MarxanRunController {
  constructor(private readonly service: MarxanRunService) {}

  @Header('Content-Type', 'text/csv')
  @ApiOkResponse({
    schema: {
      type: 'string',
    },
  })
  @ApiOperation({
    description: `Uploaded cost surface data`,
  })
  @Get(`:id/marxan/dat/pu.dat`)
  async getScenarioCostSurface(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.service.getCostSurfaceCsv(id, res);
    return;
  }

  @ApiOperation({ description: `Resolve scenario's input parameter file.` })
  @Get(':id/marxan/dat/input.dat')
  @ApiProduces('text/plain')
  @Header('Content-Type', 'text/plain')
  async getInputParameterFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getInputParameterFile(id);
  }
}
