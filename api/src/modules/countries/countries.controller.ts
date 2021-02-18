import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Country, CountryResult } from './country.api.entity';
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
import { BaseServiceResource } from 'types/resource.interface';
import { FetchSpecification, Pagination } from 'nestjs-base-service';

const resource: BaseServiceResource = {
  className: 'Country',
  name: {
    singular: 'country',
    plural: 'countries',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
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
    @Pagination() pagination: FetchSpecification,
  ): Promise<CountryResult> {
    const results = await this.service.findAllPaginated(pagination);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find country by id' })
  @ApiOkResponse({ type: CountryResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CountryResult> {
    return await this.service.serialize(await this.service.getById(id));
  }
}
