import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { intersection } from 'lodash';
import { getConnection, Not, QueryFailedError, Repository } from 'typeorm';
import {
  Denied,
  Permit,
} from '@marxan-api/modules/access-control/access-control.types';
import {
  ScenarioRoles,
  UserRoleInScenarioDto,
} from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
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
  lockedScenario,
  LockService,
} from './locks/lock.service';
import { ScenarioLockDto } from './locks/dto/scenario.lock.dto';

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
    @InjectRepository(UsersScenariosApiEntity)
    private readonly roles: Repository<UsersScenariosApiEntity>,
    @InjectRepository(UsersProjectsApiEntity)
    private readonly projectRoles: Repository<UsersProjectsApiEntity>,
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
  ): Promise<
    Either<typeof forbiddenError | typeof lockedScenario, ScenarioLockDto>
  > {
    if (!(await this.canEditScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    const result = await this.lockService.acquireLock(scenarioId, userId);
    if (isLeft(result)) {
      return left(lockedScenario);
    }
    return result;
  }

  async releaseLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError, void>> {
    if (!(await this.canEditScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    await this.lockService.releaseLock(scenarioId);

    return right(void 0);
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
      | typeof queryFailed,
      void
    >
  > {
    const { userId, roleName } = userAndRoleToChange;
    if (!(await this.isOwner(loggedUserId, scenarioId))) {
      return left(forbiddenError);
    }

    if (!(await this.hasOtherOwner(userId, scenarioId))) {
      return left(lastOwner);
    }

    assertDefined(roleName);
    const apiDbConnection = getConnection(DbConnections.default);
    const apiQueryRunner = apiDbConnection.createQueryRunner();

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
