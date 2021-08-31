import {
  Get,
  Header,
  Controller,
  Logger,
  Param,
  Post,
  Query,
  Res,
  Body,
  BadRequestException,
} from '@nestjs/common';

import {
  PlanningUnitsService,
  PlanningUnitsFilters,
  tileSpecification,
} from './planning-units.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { ShapefileService } from '@marxan/shapefile-converter';
import { ApiConsumesShapefile } from '../../decoratos/shapefile.decorator';
import { ShapefileGeoJSONResponseDTO } from '../../types/shapefile.geojson.response.dto';

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  constructor(
    private service: PlanningUnitsService,
    private shapefileService: ShapefileService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningUnitsController.name);
  }
  @ApiConsumesShapefile()
  @Post('/planning-unit-shapefile')
  async getShapeFile(
    @Body() shapefileInfo: Express.Multer.File,
  ): Promise<ShapefileGeoJSONResponseDTO | BadRequestException> {
    try {
      return await this.shapefileService.transformToGeoJson(shapefileInfo);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiOperation({
    description: 'Get tile for protected areas.',
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
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get(
    '/preview/regular/:planningUnitGridShape/:planningUnitAreakm2/tiles/:z/:x/:y.mvt',
  )
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileSpecification: tileSpecification,
    @Query() PlanningUnitsFilters: PlanningUnitsFilters,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(
      tileSpecification,
      PlanningUnitsFilters,
    );
    return response.send(tile);
  }
}
