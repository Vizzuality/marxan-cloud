import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/users/role.api.entity';

import { Permit, ProjectAccessControl } from './project-access-control';

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
}
