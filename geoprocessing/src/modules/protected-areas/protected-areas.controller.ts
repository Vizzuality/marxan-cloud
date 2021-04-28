import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { ProtectedAreasService } from './protected-areas.service';
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
export class ProtectedAreasController<T> {
  private readonly logger: Logger = new Logger(ProtectedAreasController.name);
  constructor(public service: ProtectedAreasService) {}

  @ApiOperation({
    description: 'Get tile for administrative areas within a given country.',
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
    name: 'wdpaid',
    description: 'Parent country of administrative areas in ISO code',
    type: String,
    required: false,
    example: 'BRA.1',
  })
  @Get('/protected-areas/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  // @Header('Content-Encoding', 'gzip, deflate')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileRequest: TileRequest,
    @Query('wdpaid') wdpaid: string,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(tileRequest);
    return response.send(tile);
  }
}
