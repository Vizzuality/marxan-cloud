import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ApiConsumesShapefile } from '@marxan-geoprocessing/decoratos/shapefile.decorator';
import { apiGlobalPrefixes } from '@marxan-geoprocessing/api.config';
import { PlanningAreaDto } from './planning-area.dto';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaSerializer } from './planning-area.serializer';

@Controller(`${apiGlobalPrefixes.v1}/projects/planning-area`)
export class PlanningAreaController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private planningAreaService: PlanningAreaService,
    private planningAreaSerializer: PlanningAreaSerializer,
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
}
