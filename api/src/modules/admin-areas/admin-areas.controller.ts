import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminAreaResult } from './admin-area.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { BaseServiceResource } from 'types/resource.interface';
import { FetchSpecification, Pagination } from 'nestjs-base-service';

const resource: BaseServiceResource = {
  className: 'AdminArea',
  name: {
    singular: 'admin-area',
    plural: 'admin-areas',
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
  @Get('/countries/:countryId/administrative-areas')
  async findAllAdminAreasInGivenCountry(
    @Pagination() pagination: FetchSpecification,
    @Param('countryId') countryId: string,
  ): Promise<AdminAreaResult[]> {
    const results = await this.service.findAllPaginated(pagination, undefined, {
      countryId,
    });
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find administrative area by id' })
  @ApiOkResponse({ type: AdminAreaResult })
  @Get('/administrative-areas/:id')
  async findOne(@Param('id') id: string): Promise<AdminAreaResult> {
    return await this.service.serialize(await this.service.getById(id));
  }
}
