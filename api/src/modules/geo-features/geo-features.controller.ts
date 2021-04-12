import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { geoFeatureResource, GeoFeatureResult } from './geo-feature.geo.entity';
import { GeoFeaturesService } from './geo-features.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(geoFeatureResource.className)
@Controller(
  `${apiGlobalPrefixes.v1}/${geoFeatureResource.moduleControllerPrefix}`,
)
export class GeoFeaturesController {
  constructor(public readonly service: GeoFeaturesService) {}

  @ApiOperation({
    description: 'Find all geo features',
  })
  @ApiOkResponse({
    type: GeoFeatureResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<GeoFeatureResult> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find geo feature by id' })
  @ApiOkResponse({ type: GeoFeatureResult })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GeoFeatureResult> {
    return await this.service.serialize(await this.service.getById(id));
  }
}
