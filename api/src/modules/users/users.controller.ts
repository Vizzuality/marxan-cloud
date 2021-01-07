import { Controller, Get } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

import JSONAPISerializer = require('jsonapi-serializer');

@Controller('users')
export class UsersController {
  constructor(public readonly service: UsersService) {}

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
}
