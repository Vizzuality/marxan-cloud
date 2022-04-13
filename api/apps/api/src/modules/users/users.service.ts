import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { User, userResource } from './user.api.entity';

import { omit } from 'lodash';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { UpdateUserPasswordDTO } from './dto/update.user-password';
import { compare, hash } from 'bcrypt';
import { AuthenticationService } from '@marxan-api/modules/authentication/authentication.service';
import { v4 } from 'uuid';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { PlatformAdminEntity } from './platform-admin/admin.api.entity';
import { Either, left, right } from 'fp-ts/lib/Either';
import { FetchSpecification } from 'nestjs-base-service';

export const forbiddenError = Symbol(`unauthorized access`);
export const badRequestError = Symbol(`operation not allowed`);
export const userNotFoundError = Symbol(`user not found in database`);
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
    @InjectRepository(PlatformAdminEntity)
    private readonly adminRepo: Repository<PlatformAdminEntity>,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
  ) {
    super(repository, userResource.name.singular, userResource.name.plural, {
      logging: { muteAll: AppConfig.getBoolean('logging.muteAll', false) },
    });
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
        'isBlocked',
        'isDeleted',
        'isAdmin',
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

  async findByExactEmail(email: string): Promise<User | undefined> {
    return this.repository
      .createQueryBuilder('users')
      .where('LOWER(email) = :email', { email: email.toLowerCase() })
      .getOne();
  }

  /**
   * Assemble a sanitized user object from whitelisted properties of the User
   * entity.
   *
   * @debt Should be extended to include roles and permissions.
   */
  static getSanitizedUserMetadata(
    user: User,
  ): Omit<User, 'passwordHash' | 'isActive' | 'isBlocked' | 'isDeleted'> {
    return omit(user, ['passwordHash', 'isActive', 'isBlocked', 'isDeleted']);
  }

  /**
   * Mark user as deleted (and inactive).
   *
   * We don't currently delete users physically from the system when an account
   * deletion is requested, as this would mean needing to remove them from all
   * the objects (scenarios, etc) to which they are linked, which may not be the
   * desired default behaviour.
   *
   * When we soft-delete a user, we also set their account's email address to
   * a random one `@example.com`, so that a new account can be created later
   * on with the same email address.
   *
   * @debt We will need to implement hard-deletion later on, so that instance
   * administrators can enforce compliance with relevant data protection
   * regulations.
   */
  async markAsDeleted(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isDeleted: true,
        isActive: false,
        email: `deleted-account.${v4()}@example.com`,
      },
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
      user.passwordHash = await this.hash(currentAndNewPasswords.newPassword);
      await this.repository.save(user);
      return;
    }
    throw new ForbiddenException(
      'Updating the password is not allowed: the password provided for validation as current one does not match the actual current password. If you have forgotten your password, try resetting it instead.',
    );
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.getById(userId);
    user.passwordHash = await this.hash(newPassword);
    await this.repository.save(user);
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

  private hash(password: string) {
    return hash(password, 10);
  }

  async extendGetByIdResult(entity: User): Promise<User> {
    const isAdmin = await this.isPlatformAdmin(entity.id);

    entity.isAdmin = isAdmin;

    return entity;
  }

  async extendFindAllResults(
    entitiesAndCount: [User[], number],
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<[User[], number]> {
    const extendedEntities: Promise<User>[] = entitiesAndCount[0].map(
      (entity) => this.extendGetByIdResult(entity),
    );
    return [await Promise.all(extendedEntities), entitiesAndCount[1]];
  }

  async isPlatformAdmin(userId: string): Promise<boolean> {
    return (await this.adminRepo.count({ where: { userId } })) > 0;
  }

  private async markAsBlocked(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isBlocked: true,
      },
    );
    this.authenticationService.invalidateAllTokensOfUser(userId);
  }

  private async markAsUnblocked(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isBlocked: false,
      },
    );
  }

  async getPlatformAdmins(
    userId: string,
  ): Promise<Either<typeof forbiddenError, PlatformAdminEntity[]>> {
    if (!(await this.isPlatformAdmin(userId))) {
      return left(forbiddenError);
    }
    return right(await this.adminRepo.find());
  }

  async addAdmin(
    loggedUserId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof userNotFoundError, void>> {
    if (!(await this.isPlatformAdmin(loggedUserId))) {
      return left(forbiddenError);
    }
    if (!(await this.getById(userId))) {
      return left(userNotFoundError);
    }

    await this.adminRepo.save({ userId });
    return right(void 0);
  }

  async deleteAdmin(
    loggedUserId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof badRequestError, void>> {
    if (loggedUserId === userId) {
      return left(badRequestError);
    }
    if (!(await this.isPlatformAdmin(loggedUserId))) {
      return left(forbiddenError);
    }

    await this.adminRepo.delete({ userId });
    return right(void 0);
  }

  async blockUsers(
    loggedUserId: string,
    userIds: string[],
  ): Promise<Either<typeof forbiddenError | typeof badRequestError, void>> {
    if (userIds.includes(loggedUserId)) {
      return left(badRequestError);
    }
    if (!(await this.isPlatformAdmin(loggedUserId))) {
      return left(forbiddenError);
    }

    await Promise.all(
      userIds.map(async (userId) => {
        await this.markAsBlocked(userId);
      }),
    );
    return right(void 0);
  }

  async unblockUsers(
    loggedUserId: string,
    userIds: string[],
  ): Promise<Either<typeof forbiddenError | typeof badRequestError, void>> {
    if (userIds.includes(loggedUserId)) {
      return left(badRequestError);
    }
    if (!(await this.isPlatformAdmin(loggedUserId))) {
      return left(forbiddenError);
    }

    await Promise.all(
      userIds.map(async (userId) => {
        await this.markAsUnblocked(userId);
      }),
    );
    return right(void 0);
  }
}
