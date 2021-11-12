import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/users/role.api.entity';
import { Injectable } from '@nestjs/common';

import { IProjectAclService } from '@marxan-api/modules/access-control/interfaces/project-acl-service.interface';
import { Permit } from '@marxan-api/modules/access-control/access-control.service';

/**
 * Debt: neither UsersProjectsApiEntity should belong to projects
 * nor the Roles should belong to users
 */
@Injectable()
export class ProjectAclService implements IProjectAclService {
  private readonly canCreateScenarioRoles = [Roles.project_owner];
  private readonly canEditScenarioRoles = [Roles.project_owner];
  private readonly canViewSolutionRoles = [Roles.project_owner];
  private readonly canPublishProjectRoles = [Roles.project_owner];
  private readonly canViewProjectRoles = [
    Roles.project_owner,
    Roles.project_contributor,
    Roles.project_viewer,
  ];

  private async getRolesWithinProject(
    userId: string,
    projectId: string,
  ): Promise<Array<string>> {
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
    const roles = await this.getRolesWithinProject(userId, projectId);

    return intersection(roles, this.canViewProjectRoles).length > 0;
  }

  async canPublishProject(userId: string, projectId: string): Promise<Permit> {
    const roles = await this.getRolesWithinProject(userId, projectId);

    return intersection(roles, this.canPublishProjectRoles).length > 0;
  }

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    const roles = await this.getRolesWithinProject(userId, projectId);

    return intersection(roles, this.canCreateScenarioRoles).length > 0;
  }
  async canEditScenario(userId: string, projectId: string): Promise<Permit> {
    const roles = await this.getRolesWithinProject(userId, projectId);

    return intersection(roles, this.canEditScenarioRoles).length > 0;
  }
  async canViewSolutions(userId: string, projectId: string): Promise<Permit> {
    const roles = await this.getRolesWithinProject(userId, projectId);

    return intersection(roles, this.canViewSolutionRoles).length > 0;
  }
}
