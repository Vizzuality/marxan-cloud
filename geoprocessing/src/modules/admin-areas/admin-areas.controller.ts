import { Controller, Get, Param, Header, Res } from '@nestjs/common';
import { AdminAreasService } from './admin-areas.service';
import { apiGlobalPrefixes } from 'src/api.config';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { Tile } from 'src/modules/tile/tile.service';
import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}`)
export class AdminAreasController {
  constructor(public service: AdminAreasService) {}

  @ApiOperation({
    description: 'Get tile for administrative areas within a given country.',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
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
    name: 'level',
    description:
      'Specific level to filter the administrative areas (0, 1 or 2)',
    type: Number,
    required: true,
  })
  @Get('/administrative-areas/:level/preview/tiles/:z/:x/:y.mvt')
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  // @Header('Content-Encoding', 'gzip')
  // @Header('Content-Type', 'application/vnd.mapbox-vector-tile')
  async getTile(
    @Param('z') z: number,
    @Param('x') x: number,
    @Param('y') y: number,
    @Param('table') table: string,
    @Param('geometry') geometry: string,
    @Param('extent') extent: number,
    @Param('buffer') buffer: number,
    @Param('maxZoomLevel') maxZoomLevel: number,
    @Param('customQuery') customQuery: string,
    @Param('attributes') attributes: string,
    @Res() response: Response,
  ): Promise<any> {
    // Promise<tile>
    const tile: Tile = await this.service.findTile(
      z,
      x,
      y,
      table,
      geometry,
      extent,
      buffer,
      maxZoomLevel,
      customQuery,
      attributes,
    );

    if (tile.res >= 0 && tile.data) {
      response.send(tile.data);
    } else {
      response.send(JSON.stringify(tile));
    }
    return response;
  }
}
