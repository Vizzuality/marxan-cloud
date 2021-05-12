import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { PlanningUnitsService, PlanningUnitsFilters, tileSpecification } from './planning-units.service';
import { apiGlobalPrefixes } from 'src/api.config';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TileRequest } from 'src/modules/tile/tile.service';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}`)
export class PlanningUnitsController<T> {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor(public service: PlanningUnitsService) {}

  @ApiOperation({
    description: 'Get tile for protected areas.',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 12',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/planning-units/preview/regular/:planningUnitGridShape/:planningUnitAreakm2/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileSpecification: tileSpecification,
    @Query() PlanningUnitsFilters: PlanningUnitsFilters,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(tileSpecification, PlanningUnitsFilters);
    return response.send(tile);
  }
}
