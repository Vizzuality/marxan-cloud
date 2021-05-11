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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { apiGlobalPrefixes } from 'src/api.config';
import { uploadOptions } from 'src/utils/file.utils';
import { ShapefileGeoJSONResponseDTO } from '../shapefiles/dto/shapefile.geojson.response.dto';
import { ShapeFileService } from '../shapefiles/shapefiles.service';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor(public shapefileService: ShapeFileService) {}
  @ApiOperation({
    description: 'Upload Zip file containing .shp, .dbj, .prj and .shx files',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    type: ShapefileGeoJSONResponseDTO,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('/:id/planning-unit-shapefile')
  async getShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ShapefileGeoJSONResponseDTO> {
    return this.shapefileService.getGeoJson(file);
  }
}
