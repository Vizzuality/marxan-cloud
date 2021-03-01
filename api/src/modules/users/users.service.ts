import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.api.entity';

import { get } from 'lodash';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { AppInfoDTO } from 'dto/info.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { AuthenticationService } from 'modules/authentication/authentication.service';

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
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
  ) {
    super(repository, 'user', 'users');
  }

  get serializerConfig(): JSONAPISerializerConfig<User> {
    return {
<<<<<<< HEAD
      attributes: ['fname', 'lname', 'email', 'displayName'],
=======
      attributes: ['displayName', 'fname', 'lname', 'email'],
>>>>>>> added displayName attribute on the user response
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
<<<<<<< HEAD
    const allowedProps = ['email', 'fname', 'lname', 'displayName'];
=======
    const allowedProps = ['displayName', 'email', 'fname', 'lname'];
>>>>>>> added displayName attribute on the user response

    return get(user, allowedProps);
  }

  /**
   * Mark user as deleted (and inactive).
   *
   * We don't currently delete users physically from the system when an account
   * deletion is requested, as this would mean needing to remove them from all
   * the objects (scenarios, etc) to which they are linked, which may not be the
   * desired default behaviour.
   *
   * @debt We will need to implement hard-deletion later on, so that instance
   * administrators can enforce compliance with relevant data protection
   * regulations.
   */
  async markAsDeleted(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      { isDeleted: true, isActive: false },
    );
    this.authenticationService.invalidateAllTokensOfUser(userId);
  }
}
