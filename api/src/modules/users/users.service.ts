import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.api.entity';

import { get } from 'lodash';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { AppInfoDTO } from 'dto/info.dto';

import * as faker from 'faker';
import { AppBaseService } from 'utils/app-base.service';

@Injectable()
export class UsersService extends AppBaseService<
  User,
  CreateUserDTO,
  UpdateUserDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
  ) {
    super(repository, 'user', 'users');
  }

  get serializerConfig() {
    return {
      attributes: ['fname', 'lname', 'email'],
      keyForAttribute: 'camelCase',
    };
  }

  async fakeFindOne(_id: string): Promise<Partial<User>> {
    return {
      ...new User(),
      id: faker.random.uuid(),
      email: faker.internet.email(),
      displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      fname: faker.name.firstName(),
      lname: faker.name.lastName(),
      isActive: faker.random.boolean(),
      isDeleted: faker.random.boolean(),
    };
  }

  /**
   * Select one user by email address.
   *
   * We treat email addresses as login usernames in this context, so we perform
   * the lookup case-insensitively.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.repository.findOne({ email: ILike(email.toLowerCase()) });
  }

  /**
   * Assemble a sanitized user object from whitelisted properties of the User
   * entity.
   *
   * @debt Should be extended to include roles and permissions.
   */
  static getSanitizedUserMetadata(user: Partial<User>): Partial<User> {
    const allowedProps = ['email', 'fname', 'lname'];

    return get(user, allowedProps);
  }
}
