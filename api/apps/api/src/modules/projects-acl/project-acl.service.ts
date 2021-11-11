import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/users/role.api.entity';
import { Injectable } from '@nestjs/common';
import {
  AccessControlService,
  Permit,
} from '../access-control/access-control-service.interface';

/**
 * Debt: neither UsersProjectsApiEntity should belong to projects
 * nor the Roles should belong to users
 */
@Injectable()
export class ProjectAclService extends AccessControlService {
  private readonly canCreateScenarioRoles = [Roles.project_owner];
  private readonly canEditScenarioRoles = [Roles.project_owner];
  private readonly canViewSolutionRoles = [Roles.project_owner];
  private readonly canPublishProjectRoles = [Roles.project_owner];
  private readonly canViewProjectRoles = [
    Roles.project_owner,
    Roles.project_admin,
    Roles.project_user,
  ];

  constructor(
    @InjectRepository(UsersProjectsApiEntity)
    private readonly roles: Repository<UsersProjectsApiEntity>,
  ) {
    super();
  }
  // TODO: create a proper workflow to check project creation capabilities
  async canCreateProject(_userId: string, _projectId: string): Promise<Permit> {
    return true;
  }

  async canViewProject(userId: string, projectId: string): Promise<Permit> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canViewProjectRoles).length > 0;
  }

  async canPublishProject(userId: string, projectId: string): Promise<Permit> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canPublishProjectRoles).length > 0;
  }

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canCreateScenarioRoles).length > 0;
  }
  async canEditScenario(userId: string, projectId: string): Promise<Permit> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canEditScenarioRoles).length > 0;
  }
  async canViewSolutions(userId: string, projectId: string): Promise<Permit> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canViewSolutionRoles).length > 0;
  }
}
