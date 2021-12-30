import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { intersection } from 'lodash';
import { getConnection, Not, Repository } from 'typeorm';
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
import { Either, left, right } from 'fp-ts/lib/Either';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { assertDefined } from '@marxan/utils';
import {
  forbiddenError,
  transactionFailed,
  lastOwner
} from '@marxan-api/modules/access-control';

@Injectable()
export class ScenarioAclService implements ScenarioAccessControl {
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
  private readonly canCreateSolutionRoles = [
    ScenarioRoles.scenario_owner,
    ScenarioRoles.scenario_contributor,
  ];

  private async getRolesWithinScenarioForUser(
    userId: string,
    scenarioId: string,
  ): Promise<Array<ScenarioRoles>> {
    const rolesToCheck = (
      await this.roles.find({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      })
    ).flatMap((role) => role.roleName);
    return rolesToCheck;
  }

  private async doesUserHaveRole(
    roles: ScenarioRoles[],
    rolesToCheck: ScenarioRoles[],
  ): Promise<Permit> {
    return intersection(roles, rolesToCheck).length > 0;
  }

  constructor(
    @InjectRepository(UsersScenariosApiEntity)
    private readonly roles: Repository<UsersScenariosApiEntity>,
  ) {}

  async canCreateSolution(userId: string, scenarioId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinScenarioForUser(userId, scenarioId),
      this.canCreateSolutionRoles,
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
    const otherOwnersInScenario = await this.roles.count({
      where: {
        scenarioId,
        roleName: ScenarioRoles.scenario_owner,
        userId: Not(userId),
      },
    });
    return otherOwnersInScenario >= 1;
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
  ): Promise<Either<typeof forbiddenError | typeof transactionFailed, void>> {
    const { userId, roleName } = userAndRoleToChange;
    if (!(await this.isOwner(loggedUserId, scenarioId))) {
      return left(forbiddenError);
    }
    assertDefined(roleName);
    const apiDbConnection = getConnection(DbConnections.default);
    const apiQueryRunner = apiDbConnection.createQueryRunner();

    await apiQueryRunner.connect();
    await apiQueryRunner.startTransaction();

    try {
      const existingUserInScenario = await apiQueryRunner.manager.findOne(
        UsersScenariosApiEntity,
        undefined,
        {
          where: {
            scenarioId,
            userId,
          },
        },
      );

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

      return right(void 0);
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
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
