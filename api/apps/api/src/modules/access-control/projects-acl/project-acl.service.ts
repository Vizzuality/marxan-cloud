import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
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
  async canCreateProject(_userId: string, _projectId: string): Promise<Permit> {
    return true;
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

  async checkUserIsOwner(userId: string, projectId: string): Promise<void> {
    const userIsProjectOwner = await this.roles.findOne({
      where: {
        projectId,
        userId,
        roleName: Roles.project_owner,
      },
    });
    if (!userIsProjectOwner) {
      throw new ForbiddenException();
    }
  }

  async findUsersInProject(
    projectId: string,
    userId: string,
  ): Promise<UsersProjectsApiEntity[]> {
    await this.checkUserIsOwner(userId, projectId);
    const usersInProject = await this.roles.find({
      where: { projectId },
      select: ['roleName'],
      relations: ['user'],
    });
    return usersInProject;
  }

  async updateUserInProject(
    projectId: string,
    updateUserInProjectDto: UserRoleInProjectDto,
    loggedUserId: string,
  ): Promise<void> {
    const { userId, roleName } = updateUserInProjectDto;
    await this.checkUserIsOwner(loggedUserId, projectId);

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
  ): Promise<void> {
    await this.checkUserIsOwner(loggedUserId, projectId);
    await this.roles.delete({ projectId, userId });
  }
}
