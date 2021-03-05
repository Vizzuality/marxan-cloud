import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminAreaResult } from './admin-area.geo.entity';
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
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { BaseServiceResource } from 'types/resource.interface';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

const resource: BaseServiceResource = {
  className: 'AdminArea',
  name: {
    singular: 'admin_area',
    plural: 'admin_areas',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
@Controller(`${apiGlobalPrefixes.v1}`)
export class AdminAreasController {
  constructor(public readonly service: AdminAreasService) {}

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
    example: '?level=2',
  })
  @Get('/countries/:countryId/administrative-areas')
  async findAllAdminAreasInGivenCountry(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Param('countryId') countryId: string,
    @Query(
      'level',
      new ParseIntPipe(),
      new ValidationPipe({ expectedType: AdminAreaLevel }),
    )
    level: AdminAreaLevel,
  ): Promise<AdminAreaResult[]> {
    const results = await this.service.findAllPaginated(
      fetchSpecification,
      undefined,
      {
        countryId,
        level,
      },
    );
    return this.service.serialize(results.data, results.metadata);
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
      fetchSpecification,
      areaId,
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
      await this.service.getByLevel1OrLevel2Id(fetchSpecification, areaId),
    );
  }
}
