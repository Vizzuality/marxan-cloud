import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

import { Response } from 'express';
import { setTileResponseHeadersForSuccessfulRequests } from '@marxan/tiles';
import {
  CostSurfaceService,
  CostSurfaceTileRequest,
} from '@marxan-geoprocessing/modules/cost-surface/cost-surface.service';

@Controller(`${apiGlobalPrefixes.v1}/cost-surfaces`)
export class CostSurfaceController {
  private readonly logger: Logger = new Logger(CostSurfaceController.name);

  constructor(public service: CostSurfaceService) {}

  @ApiOperation({
    description: 'Get tile for a cost surface by id.',
  })
  @Get(':costSurfaceId/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  async getTile(
    @Param() TileSpecification: CostSurfaceTileRequest,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.service.findTile(TileSpecification);
    setTileResponseHeadersForSuccessfulRequests(response);
    return response.send(tile);
  }
}
