import { Controller, Req, Res, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { apiGlobalPrefixes } from 'api.config';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';
// import { ProxyAdminAreaLevel  } from 'modules/admin-areas/admin-areas.service'

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('AdminArea vector tile proxy')
@Controller(`${apiGlobalPrefixes.v1}`)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @ApiOperation({
    description:
      'Find administrative areas within a given country in mvt format.',
  })
  /**
   *@todo Change ApiOkResponse mvt type
   */
  @ApiOkResponse({
    type: 'mvt',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
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
  @ApiParam({
    name: 'level',
    description:
      'Specific level to filter the administrative areas (0, 1 or 2)',
    type: Number,
    required: true,
    example: '1',
  })
  /**
   *@todo parse level from admin areas entity
   *@todo add level validation here in proxy service. Duplicated on the geoprocessing api.
   */
  @Get('/administrative-areas/:level/preview/tiles/:z/:x/:y.mvt')
  async proxyTile(
    // @Param() level: ProxyAdminAreaLevel,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }
}
