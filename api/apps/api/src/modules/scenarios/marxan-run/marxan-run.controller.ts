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
import { InputFilesService } from '../input-files';

@UseGuards(XApiGuard)
@Controller(`${apiGlobalPrefixes.v1}/marxan-run/scenarios`)
export class MarxanRunController {
  constructor(private readonly service: InputFilesService) {}

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
    await this.service.readCostSurface(id, res);
    return;
  }

  @ApiOperation({ description: `Resolve scenario's input parameter file.` })
  @Get(':id/marxan/dat/input.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getInputParameterFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getInputParameterFile(id);
  }

  @ApiOperation({ description: `Resolve scenario's puvspr file.` })
  @Get(':id/marxan/dat/puvspr.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getPuvsprDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getPuvsprDatContent(id);
  }

  @ApiOperation({ description: `Resolve scenario's bound file.` })
  @Get(':id/marxan/dat/bound.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getBoundDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getBoundDatContent(id);
  }

  @ApiOperation({ description: `Resolve scenario's spec file.` })
  @Get(':id/marxan/dat/spec.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getSpecDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getSpecDatContent(id);
  }
}
