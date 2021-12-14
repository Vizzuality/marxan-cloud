import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { getConnection, Repository, Not } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Permit } from '../access-control.types';
import { ProjectAccessControl } from './project-access-control';
import { UserRoleInProjectDto } from './dto/user-role-project.dto';

/**
 * Debt: neither UsersProjectsApiEntity should belong to projects
 * nor the Roles should belong to users
 */
@Injectable()
export class ProjectAclService implements ProjectAccessControl {
  private readonly canCreateScenarioRoles = [Roles.project_owner];
  private readonly canEditScenarioRoles = [Roles.project_owner];
  private readonly canViewSolutionRoles = [Roles.project_owner];
  private readonly canPublishProjectRoles = [Roles.project_owner];
  private readonly canViewProjectRoles = [
    Roles.project_owner,
    Roles.project_contributor,
    Roles.project_viewer,
  ];
  private readonly canEditProjectRoles = [
    Roles.project_contributor,
    Roles.project_owner,
  ];
  private readonly canDeleteProjectRoles = [Roles.project_owner];

  private async getRolesWithinProjectForUser(
    userId: string,
    projectId: string,
  ): Promise<Array<Roles>> {
    const rolesToCheck = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      })
    ).flatMap((role) => role.roleName);
    return rolesToCheck;
  }

  private async doesUserHaveRole(
    roles: Roles[],
    rolesToCheck: Roles[],
  ): Promise<Permit> {
    return intersection(roles, rolesToCheck).length > 0;
  }

  constructor(
    @InjectRepository(UsersProjectsApiEntity)
    private readonly roles: Repository<UsersProjectsApiEntity>,
  ) {}

  // TODO: this will be changed in the following release of user requirements.
  // For now, anyone should be able to create projects, regardless of having roles or not.
  // In the future project creation will be limited to organization contributors, so this logic will be moved to the access control module
  async canCreateProject(_userId: string): Promise<Permit> {
    return true;
  }

  async canEditProject(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canEditProjectRoles,
    );
  }

  async canDeleteProject(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canDeleteProjectRoles,
    );
  }

  async canViewProject(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canViewProjectRoles,
    );
  }

  async canPublishProject(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canPublishProjectRoles,
    );
  }

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canCreateScenarioRoles,
    );
  }
  async canEditScenario(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canEditScenarioRoles,
    );
  }
  async canViewSolutions(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canViewSolutionRoles,
    );
  }

  async isOwner(userId: string, projectId: string): Promise<Permit> {
    const userIsProjectOwner = await this.roles.findOne({
      where: {
        projectId,
        userId,
        roleName: Roles.project_owner,
      },
    });
    if (!userIsProjectOwner) {
      return false;
    }
    return true;
  }

  async hasOtherOwner(userId: string, projectId: string): Promise<Permit> {
    const otherOwnersInProject = await this.roles.count({
      where: {
        projectId,
        roleName: Roles.project_owner,
        userId: Not(userId),
      },
    });
    return otherOwnersInProject >= 1;
  }
  /**
   * @debt This module should not involve user details and it should deal with it
   * using a standalone module that will access the data just to read it. We
   * have to get back to it once scenarios, organizations and solutions are included
   * inside the access-module.
   */
  async findUsersInProject(
    projectId: string,
    userId: string,
  ): Promise<UserRoleInProjectDto[] | Permit> {
    if (!(await this.isOwner(userId, projectId))) {
      return false;
    }

    const usersInProject = await this.roles
      .createQueryBuilder('users_projects')
      .leftJoinAndSelect('users_projects.user', 'userId')
      .where({ projectId })
      .select([
        'users_projects.roleName',
        'userId.displayName',
        'userId.id',
        'userId.avatarDataUrl',
      ])
      .getMany();

    return usersInProject;
  }

  async updateUserInProject(
    projectId: string,
    updateUserInProjectDto: UserRoleInProjectDto,
    loggedUserId: string,
  ): Promise<void | Permit> {
    const { userId, roleName } = updateUserInProjectDto;
    if (!(await this.isOwner(loggedUserId, projectId))) {
      return false;
    }

    const apiDbConnection = getConnection(DbConnections.default);
    const apiQueryRunner = apiDbConnection.createQueryRunner();

    await apiQueryRunner.connect();
    await apiQueryRunner.startTransaction();

    try {
      const existingUserInProject = await this.roles.findOne({
        where: {
          projectId,
          userId,
        },
      });

      if (!existingUserInProject) {
        await this.roles.save({
          projectId,
          userId,
          roleName,
        });
      } else {
        await this.roles.update({ projectId, userId }, { roleName });
      }
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
    } finally {
      await apiQueryRunner.release();
    }
  }

  async revokeAccess(
    projectId: string,
    userId: string,
    loggedUserId: string,
  ): Promise<void | Permit> {
    if (!(await this.isOwner(loggedUserId, projectId))) {
      return false;
    }

    if (!(await this.hasOtherOwner(userId, projectId))) {
      return false;
    }

    await this.roles.delete({ projectId, userId });
  }
}
