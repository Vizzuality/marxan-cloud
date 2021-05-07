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
import { uploadOptions, unzipShapefile } from 'src/utils/file.utils';

@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class PlanningUnitsController {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor() {}
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('/:id/planning-unit-lock-in')
  async getShapeFile(
    @Param('id') scenarioId: string,
    @UploadedFile() file: any,
  ) {
    this.logger.log('GEOPROCESSING PLANNING UNITS CONTROLLER');

    console.log(file);
  }
}
