import {
  Controller,
  Get,
  Param,
  Header,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { AdminAreasService } from './admin-areas.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TileSpecification, AdminAreasFilters } from './admin-areas.service';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/administrative-areas`)
export class AdminAreasController {
  private readonly logger: Logger = new Logger(AdminAreasController.name);
  constructor(public service: AdminAreasService) {}

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
  @ApiParam({
    name: 'level',
    description:
      'Specific level to filter the administrative areas (0, 1 or 2)',
    type: Number,
    required: true,
    example: '1',
  })
  @ApiQuery({
    name: 'guid',
    description: 'Parent country of administrative areas in ISO code',
    type: String,
    required: false,
    example: 'BRA.1_1',
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/:level/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileSpecification: TileSpecification,
    @Query() adminAreasFilters: AdminAreasFilters,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.service.findTile(
      tileSpecification,
      adminAreasFilters,
    );
    return response.send(tile);
  }
}
