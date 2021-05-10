import {
  Controller,
  Logger,
  Get,
  Req,
  Param,
  UploadedFile,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { apiGlobalPrefixes } from 'src/api.config';
import { uploadOptions } from 'src/utils/file.utils';
import { ShapeFileService } from '../shapefiles/shapefiles.service';

@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor(public shapefileService: ShapeFileService) {}
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('/:id/planning-unit-lock-in')
  async getShapeFile(
    @Param('id') scenarioId: string,
    @UploadedFile() file: any,
  ) {
    const geoJson = this.shapefileService.getGeoJson(file);

    /*  const geoJson = await shapeFileToGeoJson(file.path);
    console.log(geoJson);
    return geoJson; */
    return geoJson;
  }
}
