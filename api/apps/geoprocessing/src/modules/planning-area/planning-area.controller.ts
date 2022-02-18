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
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiConsumesShapefile } from '@marxan-geoprocessing/decoratos/shapefile.decorator';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { PlanningAreaDto } from './planning-area.dto';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaSerializer } from './planning-area.serializer';
import { PlanningUnitsGridProcessor } from './planning-units-grid/planning-units-grid.processor';
import { PlanningAreaTilesService, TileSpecification } from './planning-area-tiles/planning-area-tiles.service';
import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/projects/planning-area`)
export class PlanningAreaController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private planningAreaService: PlanningAreaService,
    private planningAreaGridService: PlanningUnitsGridProcessor,
    private planningAreaSerializer: PlanningAreaSerializer,
    private planningAreaTilesService: PlanningAreaTilesService,
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

  @ApiOperation({
    description: 'Get tile for custom planning area within a given country.',
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
    name: 'planningAreaId',
    description: 'Planning unit id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('/:planningAreaId/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileSpecification: TileSpecification,
    @Res() response: Response,
  ): Promise<Response> {
    const tile: Buffer = await this.planningAreaTilesService.findTile(
      tileSpecification,
    );
    return response.send(tile);
  }
}
