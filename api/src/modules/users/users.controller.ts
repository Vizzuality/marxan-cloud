import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

import JSONAPISerializer = require('jsonapi-serializer');
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithAuthenticatedUser } from 'app.controller';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(`${apiGlobalPrefixes.v1}/users`)
export class UsersController {
  constructor(public readonly service: UsersService) {}

  @ApiOperation({
    description: 'Find all users',
  })
  @ApiResponse({
    type: User,
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
  async findAll(): Promise<User[]> {
    const serializer = new JSONAPISerializer.Serializer('users', {
      attributes: ['fname', 'lname', 'email', 'projects'],
      keyForAttribute: 'camelCase',
      projects: {
        ref: 'name',
      },
    });
    return serializer.serialize(await this.service.findAll());
  }

  @ApiOperation({
    description: 'Retrieve attributes of the current user',
  })
  @ApiResponse({
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @Get('me')
  async userMetadata(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<Partial<User>> {
    const serializer = new JSONAPISerializer.Serializer('users', {
      attributes: ['fname', 'lname', 'email', 'projects'],
      keyForAttribute: 'camelCase',
      projects: {
        ref: 'name',
      },
    });
    return serializer.serialize(await this.service.findOne(req.user.id));
  }
}
