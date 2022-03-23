import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { adminAreaResource, AdminAreaResult } from './admin-area.geo.entity';
import { AdminAreaLevel, AdminAreasService } from './admin-areas.service';
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
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { Request, Response } from 'express';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(adminAreaResource.className)
@Controller(`${apiGlobalPrefixes.v1}`)
export class AdminAreasController {
  constructor(
    public readonly service: AdminAreasService,
    private readonly proxyService: ProxyService,
  ) {}

  @ApiOperation({
    description: 'Find administrative areas within a given country.',
  })
  @ApiOkResponse({
    type: AdminAreaResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @ApiParam({
    name: 'countryId',
    description: 'Parent country of administrative areas',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'level',
    description:
      'Whether to filter for areas of a specific level (1 or 2). By default areas of both level 1 and level 2 areas may be included in the response, if present in the search results.',
    type: Number,
    required: false,
    example: '2',
  })
  @Get('/countries/:countryId/administrative-areas')
  async findAllAdminAreasInGivenCountry(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Param('countryId') countryId: string,
    @Query() { level }: AdminAreaLevel,
  ): Promise<AdminAreaResult[]> {
    const results = await this.service.findAllPaginated({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, countryId, level },
    });
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Find administrative areas within a given country in mvt format.',
  })
  /**
   *@todo Change ApiOkResponse mvt type
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
    description: 'Parent country of administrative areas in guid code',
    type: String,
    required: false,
    example: 'BRA.1_1',
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/administrative-areas/:level/preview/tiles/:z/:x/:y.mvt')
  async proxyAdminAreaTile(@Req() request: Request, @Res() response: Response) {
    console.log('controller');
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({
    description: 'Find administrative areas that are children of a given one.',
  })
  @ApiOkResponse({ type: AdminAreaResult })
  @JSONAPIQueryParams()
  @ApiParam({
    name: 'areaId',
    description: 'Parent admin area (gid)',
    type: String,
    required: true,
  })
  @Get('/administrative-areas/:areaId/subdivisions')
  async findAllChildrenAdminAreas(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Param('areaId') areaId: string,
  ): Promise<AdminAreaResult[]> {
    const results = await this.service.getChildrenAdminAreas(
      areaId,
      fetchSpecification,
    );
    return await this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find administrative area by id' })
  @ApiOkResponse({ type: AdminAreaResult })
  @JSONAPIQueryParams()
  @Get('/administrative-areas/:areaId')
  async findOne(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Param('areaId') areaId: string,
  ): Promise<AdminAreaResult> {
    return await this.service.serialize(
      await this.service.getByLevel1OrLevel2Id(areaId, fetchSpecification),
    );
  }
}
