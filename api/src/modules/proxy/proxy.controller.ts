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

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Vector tile proxy')
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
  @ApiQuery({
    name: 'guid',
    description: 'Parent country of administrative areas in ISO code',
    type: String,
    required: false,
    example: 'BRA.1_1',
  })
  @Get('/administrative-areas/:level/preview/tiles/:z/:x/:y.mvt')
  async proxyAdminAreaTile(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({
    description: 'Get tile for protected areas.',
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
  @ApiQuery({
    name: 'id',
    description: 'Id of WDPA area',
    type: String,
    required: false,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('/protected-areas/preview/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({
    description: 'Get tile for a feature by id.',
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
    name: 'id',
    description: 'Specific id of the feature',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/features/:id/preview/tiles/:z/:x/:y.mvt')
  async proxyFeaturesTile(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({
    description: 'Get planning unit geometries.',
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
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project',
    type: Array,
    required: false,
    example: [-1, 40, 1, 42],
  })
  @ApiQuery({
    name: 'planningUnitGridShape',
    description: 'Planning unit grid shape',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'planningUnitAreakm2',
    description: 'Planning unit area in km2',
    type: Number,
    required: false,
  })
  @Get('/planning-units/preview/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreasTile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }
}
