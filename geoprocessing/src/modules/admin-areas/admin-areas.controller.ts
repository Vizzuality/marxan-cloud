import { Controller, Get, Param, Header, Res } from '@nestjs/common';
// import { AdminAreasResult } from './admin-areas.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { apiGlobalPrefixes } from 'api.config';
import {
  // ApiBearerAuth,
  // ApiForbiddenResponse,
  // ApiOkResponse,
  ApiOperation,
  ApiParam,
  // ApiQuery,
  // ApiTags,
  // ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Tile } from 'modules/tile/tile.service';
import { logger } from 'app.module';
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
    );

    if (tile.res >= 0 && tile.data) {
      response.send(tile.data); //.toString('base64')
      // {
      //   statusCode: 200,
      //   headers: {
      //     'Content-Type': 'application/vnd.mapbox-vector-tile',
      //     'Content-Encoding':"gzip" ,
      //     'access-control-allow-origin': '*'
      //  },
      //   body: tile.data.toString('base64'),
      //   isBase64Encoded: true
      // }
    } else {
      response.send(JSON.stringify(tile));
      // {
      //   statusCode: 500,
      //   headers: {
      //       'Content-Type': 'text/html',
      //       'access-control-allow-origin': '*',
      //       'Content-Encoding': 'identity'
      //   },
      //   body: JSON.stringify(tile),
      //   isBase64Encoded: false
      // }
    }
    // logger.debug(tile.data)
    // logger.debug(tile.data?.toString('base64'))
    return response; //Promise.resolve(response)
  }
  // ): Promise<Tile> {
  //   return await this.service.findTile(
  //     z,
  //     x,
  //     y,
  //     table,
  //     geometry,
  //     extent,
  //     buffer,
  //     maxZoomLevel,
  //   );
  // }
}
