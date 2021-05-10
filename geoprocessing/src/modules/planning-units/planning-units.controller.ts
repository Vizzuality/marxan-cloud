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
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

import { apiGlobalPrefixes } from 'src/api.config';
import { uploadOptions } from 'src/utils/file.utils';
import { ShapeFileService } from '../shapefiles/shapefiles.service';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor(public shapefileService: ShapeFileService) {}
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
  @ApiOperation({
    description: 'Upload Zip file containing .shp, .dbj, .prj and .shx files',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('/:id/planning-unit-shapefile')
  async getShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.shapefileService.getGeoJson(file);
  }
}
