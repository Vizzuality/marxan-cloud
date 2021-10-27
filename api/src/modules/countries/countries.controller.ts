import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { countryResource, CountryResult } from './country.geo.entity';
import { CountriesService } from './countries.service';
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
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(countryResource.className)
@Controller(`${apiGlobalPrefixes.v1}/countries`)
export class CountriesController {
  constructor(public readonly service: CountriesService) {}

  @ApiOperation({
    description: 'Find all countries',
  })
  @ApiOkResponse({
    type: CountryResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<CountryResult> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find country by id' })
  @ApiOkResponse({ type: CountryResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CountryResult> {
    return await this.service.serialize(
      await this.service.getById(id, undefined, 'gid0'),
    );
  }
}
