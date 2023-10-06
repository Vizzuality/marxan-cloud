import {
  Controller,
  Get,
  Header,
  Logger,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BBox } from 'geojson';

import { Response } from 'express';
import { setTileResponseHeadersForSuccessfulRequests } from '@marxan/tiles';
import { CostSurfaceService, CostSurfaceTileRequest } from "@marxan-geoprocessing/modules/cost-surface/cost-surface.service";

@Controller(`${apiGlobalPrefixes.v1}/cost-surfaces`)
export class FeaturesController {
  private readonly logger: Logger = new Logger(FeaturesController.name);

  constructor(public service: CostSurfaceService) {}

  @ApiOperation({
    description: 'Get tile for a cost surface by id.',
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
    description: 'Specific id of the cost surface',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get(':projectId/cost-surface/:costSurfaceId/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  async getTile(
    @Param() TileSpecification: CostSurfaceTileRequest,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.service.findTile(
      TileSpecification
    );
    setTileResponseHeadersForSuccessfulRequests(response);
    return response.send(tile);
  }
}
