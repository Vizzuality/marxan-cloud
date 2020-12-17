
import { Controller, Get } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(public readonly service: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.service.findAll();
  }
}