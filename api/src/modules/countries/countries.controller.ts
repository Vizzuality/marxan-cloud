import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Country, CountryResult } from './country.entity';
import { CountriesService } from './countries.service';

import JSONAPISerializer = require('jsonapi-serializer');
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(`${apiGlobalPrefixes.v1}/countries`)
export class CountriesController {
  constructor(public readonly service: CountriesService) {}

  @ApiOperation({
    description: 'Find all countries',
  })
  @ApiOkResponse({
    type: Country,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams()
  @Get()
  async findAll(): Promise<Country[]> {
    const serializer = new JSONAPISerializer.Serializer('projects', {
      attributes: ['name', 'users'],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email', 'projectRoles'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
    });
    return serializer.serialize(await this.service.findAll());
  }

  @ApiOperation({ description: 'Find country by id' })
  @ApiOkResponse({ type: CountryResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Country> {
    return await this.service.fakeFindOne(id);
  }
}
