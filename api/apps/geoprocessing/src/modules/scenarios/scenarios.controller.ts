import { Controller, Get, Param, Res, Query, Logger } from '@nestjs/common';
import {
  ScenariosPUFilters,
  ScenariosService,
  ScenariosTileRequest,
} from './scenarios.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { Response } from 'express';
import { ScenarioComparisonTilesService } from './comparison-difference-tile/comparison-difference-tile.service';
import {
  BaseTilesOpenApi,
  setTileResponseHeadersForSuccessfulRequests,
} from '@marxan/tiles';
import { ScenarioComparisonTileRequest } from './comparison-difference-tile/comparison-difference-tile-request';
import { ScenarioComparisonFilters } from './comparison-difference-tile/dto/scenario-comparison-filter.dto';

@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class ScenariosController {
  private readonly logger: Logger = new Logger(ScenariosController.name);
  constructor(
    public service: ScenariosService,
    private readonly compareTileService: ScenarioComparisonTilesService,
  ) {}

  @BaseTilesOpenApi()
  @ApiOperation({
    description: 'Get tiles for a scenario planning units.',
  })
  @ApiParam({
    name: 'id',
    description: 'scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('/:id/planning-units/tiles/:z/:x/:y.mvt')
  async getPuTile(
    @Param() tileRequest: ScenariosTileRequest,
    @Query() filters: ScenariosPUFilters,
    @Res() response: Response,
  ): Promise<void> {
    const tile = await this.service.findTile(tileRequest, filters);

    setTileResponseHeadersForSuccessfulRequests(response);
    response.send(tile);
  }

  @BaseTilesOpenApi()
  @ApiParam({
    name: 'scenarioIdA',
    description: 'First scenario to be compared',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'scenarioIdB',
    description: 'Second scenario to be compared ',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiOperation({
    description: 'Get tile to compare scenarios within the same project.',
  })
  @Get('/:scenarioIdA/compare/:scenarioIdB/tiles/:z/:x/:y.mvt')
  async getCompareTile(
    @Param() tileRequest: ScenarioComparisonTileRequest,
    @Query() filters: ScenarioComparisonFilters,
    @Res() response: Response,
  ): Promise<void> {
    const tile: Buffer = await this.compareTileService.getScenarioComparisonTile(
      {
        ...tileRequest,
        bbox: filters.bbox,
      },
    );

    setTileResponseHeadersForSuccessfulRequests(response);
    response.send(tile);
  }
}
