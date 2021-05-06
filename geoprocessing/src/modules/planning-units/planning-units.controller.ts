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

@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class PlanningUnitsController {
  private readonly logger: Logger = new Logger(PlanningUnitsController.name);
  constructor() {}
  @UseInterceptors(FileInterceptor('file'))
  @Post('/:id/planning-unit-lock-in')
  async getShapeFile(
    @Param('id') scenarioId: string,
    @UploadedFile() file: any,
  ) {
    this.logger.log('GEOPROCESSING PLANNING UNITS CONTROLLER');
    this.logger.log(scenarioId);
    this.logger.log(file.buffer.toString());
    return true;
  }
}
