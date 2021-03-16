import { Controller, Get, Param } from '@nestjs/common';
// import { AdminAreasResult } from './admin-areas.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { apiGlobalPrefixes } from 'api.config';
import {
  // ApiBearerAuth,
  // ApiForbiddenResponse,
  // ApiOkResponse,
  ApiOperation,
  ApiParam,
  // ApiQuery,
  // ApiTags,
  // ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller(`${apiGlobalPrefixes.v1}`)
export class AdminAreasController {
  constructor(public service: AdminAreasService) {}

  //{z}/{x}/{y}
  @ApiOperation({
    description: 'Get tile for administrative areas within a given country.',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
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
  @Get('/wdpa/tiles/:z/:x/:y')
  async getTile(
    @Param('z') z: number,
    @Param('x') x: number,
    @Param('y') y: number,
  ): Promise<void> {
    await this.service.findTile(z, x, y);
  }
}
