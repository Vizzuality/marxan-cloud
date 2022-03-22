import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Logger,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiConsumesShapefile } from '@marxan-geoprocessing/decoratos/shapefile.decorator';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { PlanningAreaDto } from './planning-area.dto';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaSerializer } from './planning-area.serializer';
import { PlanningUnitsGridProcessor } from './planning-units-grid/planning-units-grid.processor';
import {
  PlanningAreaTilesService,
  TileSpecification,
} from './planning-area-tiles/planning-area-tiles.service';
import { PlanningAreaGridTilesService } from './planning-units-grid/planning-area-grid-tiles.service';
import { Response } from 'express';
import {
  setTileResponseHeadersForSuccessfulRequests,
  TilesOpenApi,
} from '@marxan/tiles';

@Controller(`${apiGlobalPrefixes.v1}/projects/planning-area`)
export class PlanningAreaController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private planningAreaService: PlanningAreaService,
    private planningAreaGridService: PlanningUnitsGridProcessor,
    private planningAreaSerializer: PlanningAreaSerializer,
    private planningAreaTilesService: PlanningAreaTilesService,
    private planningAreaGridTilesService: PlanningAreaGridTilesService,
  ) {}

  @ApiConsumesShapefile()
  @ApiOkResponse({ type: PlanningAreaDto })
  @Post('shapefile')
  async getPlanningAreaFromShapefile(
    @Body() shapefileInfo: Express.Multer.File,
  ): Promise<PlanningAreaDto> {
    try {
      const result = await this.planningAreaService.save(shapefileInfo);
      return this.planningAreaSerializer.serialize(result);
    } catch (error) {
      this.logger.error(
        'failed to create a planning area from shapefile: ' + error.message,
      );
      throw new BadRequestException();
    }
  }

  @ApiConsumesShapefile()
  @ApiOkResponse({ type: PlanningAreaDto })
  @Post('shapefile/grid')
  async getPlanningAreaFromGridShapefile(
    @Body() shapefileInfo: Express.Multer.File,
  ): Promise<PlanningAreaDto> {
    try {
      const result = await this.planningAreaGridService.save(shapefileInfo);
      return this.planningAreaSerializer.serialize(result);
    } catch (error) {
      this.logger.error(
        'failed to create a planning area from grid shapefile: ' +
          error.message,
      );
      throw new BadRequestException();
    }
  }

  @TilesOpenApi()
  @ApiOperation({
    description: 'Get preview tile for selected custom planning area',
  })
  @ApiParam({
    name: 'planningAreaId',
    description: 'Planning unit id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('/:planningAreaId/preview/tiles/:z/:x/:y.mvt')
  async getTile(
    @Param() tileSpecification: TileSpecification,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.planningAreaTilesService.findTile(
      tileSpecification,
    );
    setTileResponseHeadersForSuccessfulRequests(response);
    return response.send(tile);
  }

  @TilesOpenApi()
  @ApiOperation({
    description: 'Get preview tile for selected custom planning area grid',
  })
  @ApiParam({
    name: 'planningAreaId',
    description: 'Planning unit id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('/:planningAreaId/grid/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  async getGridTile(
    @Param() tileSpecification: TileSpecification,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.planningAreaGridTilesService.findTile(
      tileSpecification,
    );
    setTileResponseHeadersForSuccessfulRequests(response);
    return response.send(tile);
  }
}
