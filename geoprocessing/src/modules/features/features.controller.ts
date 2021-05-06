import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { FeatureService } from './features.service';
import { apiGlobalPrefixes } from 'src/api.config';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TileSpecification } from './features.service';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}`)
export class FeaturesController<T> {
  private readonly logger: Logger = new Logger(FeaturesController.name);
  constructor(public service: FeatureService) {}

  @ApiOperation({
    description: 'Get tile for a feature by id.',
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
    name: 'id',
    description:
      'Specific id of the feature',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42]
  })
  @Get('/features/:id/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() TileSpecification: TileSpecification,
    @Query('bbox') bbox: number[],
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(TileSpecification);
    return response.send(tile);
  }
}
