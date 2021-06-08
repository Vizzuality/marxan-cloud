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
  ProtectedAreasService,
  ProtectedAreasFilters,
} from './protected-areas.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TileRequest } from '@marxan-geoprocessing/modules/tile/tile.service';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  private readonly logger: Logger = new Logger(ProtectedAreasController.name);
  constructor(public service: ProtectedAreasService) {}

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
    name: 'id',
    description: 'Id of WDPA area',
    type: String,
    required: false,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/preview/tiles/:z/:x/:y.mvt')
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
    @Param() tileRequest: TileRequest,
    @Query() protectedAreasFilters: ProtectedAreasFilters,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(tileRequest, protectedAreasFilters);
    return response.send(tile);
  }
}
