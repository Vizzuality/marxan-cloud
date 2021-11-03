import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/users/role.api.entity';
import { Injectable } from '@nestjs/common';

/**
 * Debt: neither UsersProjectsApiEntity should belong to projects
 * nor the Roles should belong to users
 */
@Injectable()
export class ProjectAclService {
  private readonly canPublishRoles = [
    Roles.project_admin,
    Roles.project_owner,
    Roles.organization_admin,
    Roles.organization_owner,
  ];

  constructor(
    @InjectRepository(UsersProjectsApiEntity)
    private readonly roles: Repository<UsersProjectsApiEntity>,
  ) {}

  async canPublish(userId: string, projectId: string): Promise<boolean> {
    const roles = (
      await this.roles.find({
        where: {
          projectId,
          userId,
        },
      })
    ).flatMap((role) => role.roleName);

    return intersection(roles, this.canPublishRoles).length > 0;
  }
}
