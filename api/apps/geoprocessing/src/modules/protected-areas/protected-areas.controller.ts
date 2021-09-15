import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

import { TileRequest, TilesOpenApi } from '@marxan/tiles';

import { ProtectedAreasFilters } from './dto/protected-areas-filter.dto';
import { ProtectedAreasTilesService } from './protected-areas-tiles.service';

@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  constructor(private readonly tileService: ProtectedAreasTilesService) {}

  @TilesOpenApi()
  @ApiOperation({
    description: 'Get tile for protected areas.',
  })
  @Get('/preview/tiles/:z/:x/:y.mvt')
  async getTile(
    @Param() tileRequest: TileRequest,
    @Query() protectedAreasFilters: ProtectedAreasFilters,
    @Res() response: Response,
  ): Promise<void> {
    const tile: Buffer = await this.tileService.getProtectedAreaTile({
      ...tileRequest,
      protectedAreaId: protectedAreasFilters.id,
      bbox: protectedAreasFilters.bbox,
    });
    response.send(tile);
  }

  @TilesOpenApi()
  @ApiParam({
    name: 'projectId',
    description: 'Project ID to include its Protected Areas',
    type: Number,
    required: true,
  })
  @ApiOperation({
    description: 'Get tile for protected areas, including given ProjectID.',
  })
  @Get(':projectId/preview/tiles/:z/:x/:y.mvt')
  async getTileForProject(
    @Param() tileRequest: TileRequest,
    @Query() protectedAreasFilters: ProtectedAreasFilters,
    @Res() response: Response,
  ): Promise<void> {
    const tile: Buffer = await this.tileService.getProtectedAreaTile({
      ...tileRequest,
      protectedAreaId: protectedAreasFilters.id,
      bbox: protectedAreasFilters.bbox,
    });
    response.send(tile);
  }
}
