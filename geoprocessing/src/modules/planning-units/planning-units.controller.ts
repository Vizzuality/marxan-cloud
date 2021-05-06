import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { PlanningUnitsService } from './planning-units.service';
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
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @ApiQuery({
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: false,
  })
  @Get('/planning-units/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileRequest: TileRequest,
    @Query('bbox') bbox: number[],
    @Query('planningUnitGridShape') planningUnitGridShape: string,
    @Query('planningUnitAreakm2') planningUnitAreakm2: number,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(tileRequest);
    return response.send(tile);
  }
}
