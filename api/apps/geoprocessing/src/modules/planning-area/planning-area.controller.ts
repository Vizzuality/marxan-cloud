import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ApiConsumesShapefile } from '@marxan-geoprocessing/decoratos/shapefile.decorator';
import { PlanningAreaService } from '@marxan-geoprocessing/modules/planning-area/planning-area.service';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { PlanningAreaDto } from './planning-area.dto';

@Controller(`${apiGlobalPrefixes.v1}/projects/planning-area`)
export class PlanningAreaController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private planningAreaService: PlanningAreaService) {}

  @ApiConsumesShapefile()
  @ApiOkResponse({ type: PlanningAreaDto })
  @Post('shapefile')
  async getPlanningAreaFromShapefile(
    @Body() shapefileInfo: Express.Multer.File,
  ): Promise<PlanningAreaDto> {
    try {
      return plainToClass<PlanningAreaDto, PlanningAreaDto>(
        PlanningAreaDto,
        await this.planningAreaService.save(shapefileInfo),
      );
    } catch (error) {
      this.logger.error(
        'failed to create a planning area from shapefile: ' + error.message,
      );
      throw new BadRequestException();
    }
  }
}
