import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Country, CountryResult } from './country.entity';
import { CountriesService } from './countries.service';

import JSONAPISerializer = require('jsonapi-serializer');
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

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
  @ApiQuery({
    name: 'include',
    description:
      'A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'fields',
    description:
      'A comma-separated list that refers to the name(s) of the fields to be returned. An empty value indicates that no fields should be returned.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    description:
      'A comma-separated list of fields of the primary data according to which the results should be sorted. Sort order is ascending unless the field name is prefixed with a minus (for descending order).',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'page[size]',
    description:
      'Page size for pagination. If not supplied, pagination with default page size of 10 elements will be applied. Specify page[size]=0 to disable pagination.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'page[number]',
    description:
      'Page number for pagination. If not supplied, the first page of results will be returned.',
    type: Number,
    required: false,
  })
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
