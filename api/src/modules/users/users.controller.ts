import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from './user.api.entity';
import { UsersService } from './users.service';

import JSONAPISerializer = require('jsonapi-serializer');
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { BaseServiceResource } from 'types/resource.interface';

const resource: BaseServiceResource = {
  className: 'User',
  name: {
    singular: 'user',
    plural: 'users',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
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
  @JSONAPIQueryParams()
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
