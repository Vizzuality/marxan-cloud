import {
  Controller,
  Logger,
  Param,
  UploadedFile,
  Post,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
/* import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'; */

import { apiGlobalPrefixes } from 'src/api.config';
import { uploadOptions } from 'src/utils/file.utils';

import { ShapeFileService } from '../shapefiles/shapefiles.service';
import { ApiConsumesShapefile } from '../../decoratos/shapefile.decorator';
import { ShapefileGeoJSONResponseDTO } from '../shapefiles/dto/shapefile.geojson.response.dto';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  constructor(
    public shapefileService: ShapeFileService,
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
}
