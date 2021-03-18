import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User, userResource } from './user.api.entity';

import { omit } from 'lodash';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { AppInfoDTO } from 'dto/info.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { UpdateUserPasswordDTO } from './dto/update.user-password';
import { compare, hash } from 'bcrypt';
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
    super(repository, userResource.name.singular, userResource.name.plural);
  }

  get serializerConfig(): JSONAPISerializerConfig<User> {
    return {
      attributes: [
        'fname',
        'lname',
        'email',
        'displayName',
        'avatarDataUrl',
        'isActive',
        'isDeleted',
        'metadata',
        'projects',
        'scenarios',
      ],
      keyForAttribute: 'camelCase',
      projects: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'countryId',
          'adminAreaLevel1Id',
          'adminAreaLevel2Id',
          'planningUnitGridShape',
          'planningUnitAreakm2',
          'createdAt',
          'lastModifiedAt',
        ],
      },
      scenarios: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'type',
          'wdpaFilter',
          'wdpaThreshold',
          'adminRegionId',
          'numberOfRuns',
          'boundaryLengthModifier',
          'metadata',
          'status',
          'createdAt',
          'lastModifiedAt',
        ],
      },
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
  static getSanitizedUserMetadata(
    user: User,
  ): Omit<User, 'passwordHash' | 'isActive' | 'isDeleted'> {
    return omit(user, ['passwordHash', 'isActive', 'isDeleted']);
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

  /**
   * Update a user's own password.
   *
   * We require a guard here - the user should be able to prove they know their
   * current password. If they are not able to do so, they should go the 'reset
   * password' route (@debt, this will be implemented later).
   */
  async updateOwnPassword(
    userId: string,
    currentAndNewPasswords: UpdateUserPasswordDTO,
    _info: AppInfoDTO,
  ): Promise<void> {
    const user = await this.getById(userId);
    if (
      user &&
      (await compare(currentAndNewPasswords.currentPassword, user.passwordHash))
    ) {
      user.passwordHash = await hash(currentAndNewPasswords.newPassword, 10);
      this.repository.save(user);
      return;
    }
    throw new ForbiddenException(
      'Updating the password is not allowed: the password provided for validation as current one does not match the actual current password. If you have forgotten your password, try resetting it instead.',
    );
  }

  /**
   * Validate that an update request can be fulfilled.
   *
   * - we enforce updating passwords via a separate route (`PATCH
   *   /api/v1/users/me/password`)
   * - @debt also we don't allow updating the user's email address at this stage
   *   (pending implementation of email verification)
   */
  async validateBeforeUpdate(
    id: string,
    updateModel: UpdateUserDTO,
    _info?: AppInfoDTO,
  ): Promise<void> {
    if (updateModel.password) {
      throw new ForbiddenException(
        "The user's password cannot be updated alongside other user data: please use the API endpoint for password updates.",
      );
    }

    if (updateModel.email) {
      throw new NotImplementedException(
        "Updating a user's email address is not supported yet. This will be allowed once email address verification is implemented.",
      );
    }
  }
}
