import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import {
  ScenariosPUFilters,
  ScenariosService,
  ScenariosTileRequest,
} from './scenarios.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import {
  ApiOperation,
  ApiParam,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class ScenariosController {
  private readonly logger: Logger = new Logger(ScenariosController.name);
  constructor(public service: ScenariosService) {}

  @ApiOperation({
    description: 'Get tiles for a scenario planning units.',
  })
  @ApiParam({
    name: 'id',
    description: 'scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 12',
    type: Number,
    required: true,
    example: 5,
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
    example: 10,
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
    example: 10,
  })
  @Get('/:id/planning-units/tiles/:z/:x/:y.mvt')
  @ApiOkResponse({
    description: 'Binary protobuffer mvt tile',
    type: String,
  })
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileRequest: ScenariosTileRequest,
    @Query() scenariosPuFilters: ScenariosPUFilters,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(
      tileRequest,
      scenariosPuFilters,
    );
    return response.send(tile);
  }
}
