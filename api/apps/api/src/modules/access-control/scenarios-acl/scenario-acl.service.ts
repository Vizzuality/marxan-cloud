import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { intersection } from 'lodash';
import { DataSource, Not, QueryFailedError, Repository } from 'typeorm';
import {
  Denied,
  Permit,
  userNotFound,
} from '@marxan-api/modules/access-control/access-control.types';
import {
  ScenarioRoles,
  UserRoleInScenarioDto,
} from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { Either, isRight, left, right } from 'fp-ts/lib/Either';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { assertDefined } from '@marxan/utils';
import {
  forbiddenError,
  lastOwner,
  queryFailed,
  transactionFailed,
} from '@marxan-api/modules/access-control';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import {
  AcquireFailure,
  lockedByAnotherUser,
  LockService,
  noLockInPlace,
} from './locks/lock.service';
import {
  ScenarioLockDto,
  ScenarioLockResultSingular,
} from './locks/dto/scenario.lock.dto';
import { User } from '@marxan-api/modules/users/user.api.entity';

@Injectable()
export class ScenarioAclService implements ScenarioAccessControl {
  private readonly canCreateScenarioRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
  ];
  private readonly canReleaseLockRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
  ];
  private readonly canEditScenarioRoles = [
    ScenarioRoles.scenario_contributor,
    ScenarioRoles.scenario_owner,
  ];
  private readonly canViewScenarioRoles = [
    ScenarioRoles.scenario_viewer,
    ScenarioRoles.scenario_contributor,
    ScenarioRoles.scenario_owner,
  ];
  private readonly canDeleteScenarioRoles = [ScenarioRoles.scenario_owner];
  private readonly canCloneScenarioRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
  ];
  private readonly canViewBlmResultsRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
    ProjectRoles.project_viewer,
  ];

  private async getRolesWithinScenarioForUser(
    userId: string,
    scenarioId: string,
  ): Promise<Array<ScenarioRoles>> {
    return (
      await this.roles.find({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      })
    ).flatMap((role) => role.roleName);
  }

  private async getRolesWithinProjectForUser(
    userId: string,
    projectId: string,
  ): Promise<Array<ProjectRoles>> {
    return (
      await this.projectRoles.find({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      })
    ).flatMap((role) => role.roleName);
  }

  private async doesUserHaveRole(
    roles: ScenarioRoles[],
    rolesToCheck: ScenarioRoles[],
  ): Promise<Permit> {
    return intersection(roles, rolesToCheck).length > 0;
  }

  private async doesUserHaveRoleInProject(
    roles: ProjectRoles[],
    rolesToCheck: ProjectRoles[],
  ): Promise<Permit> {
    return intersection(roles, rolesToCheck).length > 0;
  }

  constructor(
    @InjectDataSource(DbConnections.default)
    private readonly apiDataSource: DataSource,
    @InjectRepository(UsersScenariosApiEntity)
    private readonly roles: Repository<UsersScenariosApiEntity>,
    @InjectRepository(UsersProjectsApiEntity)
    private readonly projectRoles: Repository<UsersProjectsApiEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly lockService: LockService,
  ) {}

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRoleInProject(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canCreateScenarioRoles,
    );
  }

  async canEditScenario(userId: string, scenarioId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinScenarioForUser(userId, scenarioId),
      this.canEditScenarioRoles,
    );
  }

  async canDeleteScenario(userId: string, scenarioId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinScenarioForUser(userId, scenarioId),
      this.canDeleteScenarioRoles,
    );
  }

  async canViewScenario(userId: string, scenarioId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinScenarioForUser(userId, scenarioId),
      this.canViewScenarioRoles,
    );
  }

  async canCloneScenario(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRoleInProject(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canCloneScenarioRoles,
    );
  }

  async canReleaseLock(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRoleInProject(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canReleaseLockRoles,
    );
  }

  async canViewBlmResults(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRoleInProject(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canReleaseLockRoles,
    );
  }

  async isOwner(userId: string, scenarioId: string): Promise<Permit> {
    const userIsScenarioOwner = await this.roles.findOne({
      where: {
        scenarioId,
        userId,
        roleName: ScenarioRoles.scenario_owner,
      },
    });
    if (!userIsScenarioOwner) {
      return false;
    }
    return true;
  }

  async hasOtherOwner(userId: string, scenarioId: string): Promise<Permit> {
    const query = this.roles
      .createQueryBuilder('users_scenarios')
      .leftJoin('users_scenarios.user', 'userId')
      .where({
        scenarioId,
        roleName: ScenarioRoles.scenario_owner,
        userId: Not(userId),
      })
      .andWhere('userId.isDeleted is false');

    const otherOwnersInScenario = await query.getCount();

    return otherOwnersInScenario >= 1;
  }

  async acquireLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError | AcquireFailure, ScenarioLockDto>> {
    if (!(await this.canEditScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return await this.lockService.acquireLock(scenarioId, userId);
  }

  async releaseLock(
    userId: string,
    scenarioId: string,
    projectId: string,
  ): Promise<Either<typeof forbiddenError | typeof lockedByAnotherUser, void>> {
    /*
     * Using named variables instead of direct usage of functions
     * for clarity when understanding the steps to release a lock
     */
    const canReleaseLockFromProjectLevel = await this.canReleaseLock(
      userId,
      projectId,
    );
    const canEditScenario = await this.canEditScenario(userId, scenarioId);
    const scenarioIsLockedByCurrentUser = await this.lockService.isLockedByUser(
      scenarioId,
      userId,
    );
    if (!canEditScenario && !canReleaseLockFromProjectLevel) {
      return left(forbiddenError);
    }
    if (
      !canReleaseLockFromProjectLevel &&
      canEditScenario &&
      !scenarioIsLockedByCurrentUser
    ) {
      return left(lockedByAnotherUser);
    }
    await this.lockService.releaseLock(scenarioId);

    return right(void 0);
  }

  async canEditScenarioAndOwnsLock(
    userId: string,
    scenarioId: string,
    isDeletion?: boolean,
  ): Promise<
    Either<
      typeof forbiddenError | typeof lockedByAnotherUser | typeof noLockInPlace,
      boolean
    >
  > {
    const scenarioIsAlreadyLocked = await this.lockService.isLocked(scenarioId);
    const canProcessActionInScenario = isDeletion
      ? await this.canDeleteScenario(userId, scenarioId)
      : await this.canEditScenario(userId, scenarioId);
    // LOFU (lock on first use): if scenario is not locked (maybe it's new and it
    // was never locked, or any previous locks have expired or have been
    // explicitly released), the current user can attempt to acquire a lock
    // transparently.
    const scenarioIsLocked =
      canProcessActionInScenario && !scenarioIsAlreadyLocked
        ? isRight(await this.acquireLock(userId, scenarioId))
        : scenarioIsAlreadyLocked;

    const scenarioIsLockedByCurrentUser = await this.lockService.isLockedByUser(
      scenarioId,
      userId,
    );
    if (!canProcessActionInScenario) {
      return left(forbiddenError);
    }
    if (!scenarioIsLocked) {
      return left(noLockInPlace);
    }
    if (!scenarioIsLockedByCurrentUser) {
      return left(lockedByAnotherUser);
    }
    return right(
      scenarioIsLocked &&
        canProcessActionInScenario &&
        scenarioIsLockedByCurrentUser,
    );
  }

  async findLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError, ScenarioLockResultSingular>> {
    if (!(await this.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.lockService.getLock(scenarioId));
  }

  async findUsersInScenario(
    scenarioId: string,
    userId: string,
    nameSearch?: string,
  ): Promise<Either<Denied, UserRoleInScenarioDto[]>> {
    if (!(await this.isOwner(userId, scenarioId))) {
      return left(false);
    }

    const query = this.roles
      .createQueryBuilder('users_scenarios')
      .leftJoinAndSelect('users_scenarios.user', 'userId')
      .where({
        scenarioId,
      })
      .andWhere('userId.isDeleted is false')
      .select([
        'users_scenarios.roleName',
        'userId.displayName',
        'userId.id',
        'userId.avatarDataUrl',
      ]);

    if (nameSearch) {
      query.andWhere('userId.displayName ILIKE :name', {
        name: `%${nameSearch}%`,
      });
    }

    const usersInScenario = await query.getMany();

    return right(usersInScenario);
  }

  async updateUserInScenario(
    scenarioId: string,
    userAndRoleToChange: UserRoleInScenarioDto,
    loggedUserId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof transactionFailed
      | typeof lastOwner
      | typeof queryFailed
      | typeof userNotFound,
      void
    >
  > {
    const { userId, roleName } = userAndRoleToChange;
    const userToAdd = await this.users.findOne({ where: { id: userId } });

    if (!userToAdd) return left(userNotFound);

    if (!(await this.isOwner(loggedUserId, scenarioId))) {
      return left(forbiddenError);
    }

    if (!(await this.hasOtherOwner(userId, scenarioId))) {
      return left(lastOwner);
    }

    assertDefined(roleName);
    const apiQueryRunner = this.apiDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await apiQueryRunner.startTransaction();

    try {
      const existingUserInScenario = await apiQueryRunner.manager
        .createQueryBuilder(UsersScenariosApiEntity, 'users_scenarios')
        .where({
          scenarioId,
          userId,
        })
        .leftJoinAndSelect('users_scenarios.user', 'userId')
        .select(['users_scenarios.roleName', 'userId.isDeleted'])
        .getOne();

      /**
       * If a role was already granted to the user, but the user is marked
       * as deleted, we don't want to touch their existing role: we consider it,
       * for the time being, as an archived fact, kept untouched.
       */

      if (existingUserInScenario?.user?.isDeleted) {
        return left(transactionFailed);
      }

      if (!existingUserInScenario) {
        const userRoleToSave = new UsersScenariosApiEntity();
        userRoleToSave.scenarioId = scenarioId;
        userRoleToSave.userId = userId;
        userRoleToSave.roleName = roleName;
        await apiQueryRunner.manager.save(userRoleToSave);
      } else {
        await apiQueryRunner.manager.update(
          UsersScenariosApiEntity,
          { scenarioId, userId },
          { roleName },
        );
      }

      await apiQueryRunner.commitTransaction();
      return right(void 0);
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      if (err instanceof QueryFailedError) {
        return left(queryFailed);
      }
      return left(transactionFailed);
    } finally {
      await apiQueryRunner.release();
    }
  }

  async revokeAccess(
    scenarioId: string,
    userId: string,
    loggedUserId: string,
  ): Promise<Either<typeof lastOwner | typeof forbiddenError, void>> {
    if (!(await this.isOwner(loggedUserId, scenarioId))) {
      return left(forbiddenError);
    }

    if (!(await this.hasOtherOwner(userId, scenarioId))) {
      return left(lastOwner);
    }

    await this.roles.delete({ scenarioId, userId });
    return right(void 0);
  }
}
