import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { getConnection, Not, QueryFailedError, Repository } from 'typeorm';
import { intersection } from 'lodash';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  Denied,
  Permit,
} from '@marxan-api/modules/access-control/access-control.types';
import { ProjectAccessControl } from '@marxan-api/modules/access-control/projects-acl/project-access-control';
import {
  ProjectRoles,
  UserRoleInProjectDto,
} from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { Either, left, right } from 'fp-ts/Either';
import { assertDefined } from '@marxan/utils';
import {
  forbiddenError,
  lastOwner,
  queryFailed,
  transactionFailed,
} from '@marxan-api/modules/access-control';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';

/**
 * Debt: neither UsersProjectsApiEntity should belong to projects
 * nor the Roles should belong to users
 */
@Injectable()
export class ProjectAclService implements ProjectAccessControl {
  private readonly canPublishProjectRoles = [ProjectRoles.project_owner];
  private readonly canViewProjectRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
    ProjectRoles.project_viewer,
  ];
  private readonly canEditProjectRoles = [
    ProjectRoles.project_contributor,
    ProjectRoles.project_owner,
  ];
  private readonly canDeleteProjectRoles = [ProjectRoles.project_owner];
  private readonly canExportProjectRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
    ProjectRoles.project_viewer,
  ];
  private readonly canDownloadExportProjectRoles = [
    ProjectRoles.project_owner,
    ProjectRoles.project_contributor,
    ProjectRoles.project_viewer,
  ];

  constructor(
    @InjectRepository(UsersProjectsApiEntity)
    private readonly roles: Repository<UsersProjectsApiEntity>,
    @InjectRepository(PublishedProject)
    private readonly publishedProjectRepo: Repository<PublishedProject>,
  ) {}

  private async getRolesWithinProjectForUser(
    userId: string,
    projectId: string,
  ): Promise<Array<ProjectRoles>> {
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
    roles: ProjectRoles[],
    rolesToCheck: ProjectRoles[],
  ): Promise<Permit> {
    return intersection(roles, rolesToCheck).length > 0;
  }

  // TODO: this will be changed in the following release of user requirements.
  // For now, anyone should be able to create projects, regardless of having
  // roles or not. In the future project creation will be limited to
  // organization contributors, so this logic will be moved to the access
  // control module
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
    const isPublic = await this.isProjectPublic(projectId);
    const userHasPermit = await this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canViewProjectRoles,
    );

    return userHasPermit || isPublic;
  }

  async canPublishProject(userId: string, projectId: string): Promise<Permit> {
    return this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canPublishProjectRoles,
    );
  }

  async canExportProject(userId: string, projectId: string): Promise<Permit> {
    const isPublic = await this.isProjectPublic(projectId);
    const userHasPermit = await this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canExportProjectRoles,
    );

    return userHasPermit || isPublic;
  }

  async canDownloadProjectExport(
    userId: string,
    projectId: string,
  ): Promise<Permit> {
    const isPublic = await this.isProjectPublic(projectId);

    const userHasPermit = await this.doesUserHaveRole(
      await this.getRolesWithinProjectForUser(userId, projectId),
      this.canDownloadExportProjectRoles,
    );

    return userHasPermit || isPublic;
  }

  async isOwner(userId: string, projectId: string): Promise<Permit> {
    const userIsProjectOwner = await this.roles.findOne({
      where: {
        projectId,
        userId,
        roleName: ProjectRoles.project_owner,
      },
    });

    return Boolean(userIsProjectOwner);
  }

  async hasOtherOwner(userId: string, projectId: string): Promise<Permit> {
    const query = this.roles
      .createQueryBuilder('users_projects')
      .leftJoin('users_projects.user', 'userId')
      .where({
        projectId,
        roleName: ProjectRoles.project_owner,
        userId: Not(userId),
      })
      .andWhere('userId.isDeleted is false');

    const otherOwnersInProject = await query.getCount();

    return otherOwnersInProject >= 1;
  }

  /**
   * @debt This module should not involve user details and it should deal with
   * it using a standalone module that will access the data just to read it. We
   * have to get back to it once scenarios, organizations and solutions are
   * included inside the access-module.
   */
  async findUsersInProject(
    projectId: string,
    userId: string,
    nameSearch?: string,
  ): Promise<Either<Denied, UserRoleInProjectDto[]>> {
    if (!(await this.canViewProject(userId, projectId))) {
      return left(false);
    }

    const query = this.roles
      .createQueryBuilder('users_projects')
      .leftJoinAndSelect('users_projects.user', 'userId')
      .where({
        projectId,
      })
      .andWhere('userId.isDeleted is false')
      .select([
        'users_projects.roleName',
        'userId.displayName',
        'userId.id',
        'userId.avatarDataUrl',
      ]);

    if (nameSearch) {
      query.andWhere('userId.displayName ILIKE :name', {
        name: `%${nameSearch}%`,
      });
    }

    const usersInProject = await query.getMany();

    return right(usersInProject);
  }

  async updateUserInProject(
    projectId: string,
    userAndRoleToChange: UserRoleInProjectDto,
    loggedUserId: string,
  ): Promise<
    Either<
      | typeof transactionFailed
      | typeof forbiddenError
      | typeof lastOwner
      | typeof queryFailed,
      void
    >
  > {
    const { userId, roleName } = userAndRoleToChange;
    if (!(await this.isOwner(loggedUserId, projectId))) {
      return left(forbiddenError);
    }
    if (!(await this.hasOtherOwner(userId, projectId))) {
      return left(lastOwner);
    }
    assertDefined(roleName);
    const apiDbConnection = getConnection(DbConnections.default);
    const apiQueryRunner = apiDbConnection.createQueryRunner();

    await apiQueryRunner.connect();
    await apiQueryRunner.startTransaction();

    try {
      const existingUserInProject = await apiQueryRunner.manager
        .createQueryBuilder(UsersProjectsApiEntity, 'users_projects')
        .where({
          projectId,
          userId,
        })
        .leftJoinAndSelect('users_projects.user', 'userId')
        .select(['users_projects.roleName', 'userId.isDeleted'])
        .getOne();
      /**
       * If a role was already granted to the user, but the user is marked
       * as deleted, we don't want to touch their existing role: we consider it,
       * for the time being, as an archived fact, kept untouched.
       */
      if (existingUserInProject?.user?.isDeleted) {
        return left(transactionFailed);
      }

      if (!existingUserInProject) {
        const userRoleToSave = new UsersProjectsApiEntity();
        userRoleToSave.projectId = projectId;
        userRoleToSave.userId = userId;
        userRoleToSave.roleName = roleName;

        await apiQueryRunner.manager.save(userRoleToSave);
      } else {
        await apiQueryRunner.manager.update(
          UsersProjectsApiEntity,
          { projectId, userId },
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
    projectId: string,
    userId: string,
    loggedUserId: string,
  ): Promise<Either<typeof forbiddenError | typeof lastOwner, void>> {
    if (!(await this.isOwner(loggedUserId, projectId))) {
      return left(forbiddenError);
    }

    if (!(await this.hasOtherOwner(userId, projectId))) {
      return left(lastOwner);
    }

    await this.roles.delete({ projectId, userId });
    return right(void 0);
  }

  private async isProjectPublic(projectId: string): Promise<boolean> {
    return Boolean(await this.publishedProjectRepo.findOne(projectId));
  }
}
