import {
  Get,
  Header,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { apiGlobalPrefixes } from 'src/api.config';
import { uploadOptions } from 'src/utils/file.utils';

import { ShapeFileService } from '../shapefiles/shapefiles.service';
import { ApiConsumesShapefile } from '../../decoratos/shapefile.decorator';
import { ShapefileGeoJSONResponseDTO } from '../shapefiles/dto/shapefile.geojson.response.dto';

import { PlanningUnitsService } from './planning-units.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TileRequest } from 'src/modules/tile/tile.service';

import { Response } from 'express';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
@Controller(`${apiGlobalPrefixes.v1}`)
export class PlanningUnitsController<T> {
  constructor(
    private service: PlanningUnitsService,
    private shapefileService: ShapeFileService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningUnitsController.name);
  }
  @ApiConsumesShapefile()
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('/:id/planning-unit-shapefile')
  async getShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ShapefileGeoJSONResponseDTO> {
    return this.shapefileService.getGeoJson(file);
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
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @ApiQuery({
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: false,
  })
  @Get('/preview/tiles/:z/:x/:y.mvt')
  @ApiBadRequestResponse()
  @Header('Content-Type', 'application/x-protobuf')
  @Header('Content-Disposition', 'attachment')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Content-Encoding', 'gzip')
  async getTile(
    @Param() tileRequest: TileRequest,
    @Query('bbox') bbox: number[],
    @Query('planningUnitGridShape') planningUnitGridShape: string,
    @Query('planningUnitAreakm2') planningUnitAreakm2: number,
    @Res() response: Response,
  ): Promise<Object> {
    const tile: Buffer = await this.service.findTile(tileRequest);
    return response.send(tile);
  }
}
