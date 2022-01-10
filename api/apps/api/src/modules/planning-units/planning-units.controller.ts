import { Controller, UseGuards, Req, Res, Get } from '@nestjs/common';
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
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { Request, Response } from 'express';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Planning units')
@Controller(`${apiGlobalPrefixes.v1}/planning-units`)
export class PlanningUnitsController {
  constructor(private readonly proxyService: ProxyService) {}

  @ApiOperation({
    description: 'Get planning unit geometries.',
  })
  /**
   *@reference https://docs.ogc.org/per/19-069.html#_openapi_example_for_vector_tiles
   */
  @ApiOkResponse({
    description: 'Binary protobuffer mvt tile',
    type: String,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
    type: Number,
    required: true,
    example: '5',
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
    example: '5',
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
    example: '5',
  })
  @ApiParam({
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: true,
    example: 'square',
  })
  @ApiParam({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: true,
    example: 100,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get(
    '/preview/regular/:planningUnitGridShape/:planningUnitAreakm2/tiles/:z/:x/:y.mvt',
  )
  async proxyProtectedAreasTile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }
}
