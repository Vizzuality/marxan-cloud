import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { isLeft } from 'fp-ts/Either';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ScenarioLockEntity } from '@marxan-api/modules/access-control/scenarios-acl/locks/entity/scenario.lock.api.entity';
import { LockService } from '@marxan-api/modules/access-control/scenarios-acl/locks/lock.service';
import { IssuedAuthnToken } from '@marxan-api/modules/authentication/issued-authn-token.api.entity';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`no roles assigned at all in a private project`, async () => {
  fixtures.GivenNoRoles();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCannotViewProject();
  await fixtures.ThenCannotDeleteProject();
  await fixtures.ThenCannotEditProject();
});

test(`no roles assigned at all in a public project`, async () => {
  fixtures.GivenNoRoles();
  await fixtures.GivenProjectIsPublic();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
  await fixtures.ThenCannotDeleteProject();
  await fixtures.ThenCannotEditProject();
});

test(`project viewer role assigned`, async () => {
  fixtures.GivenProjectViewerRoleIsAssigned();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
  await fixtures.ThenCannotDeleteProject();
  await fixtures.ThenCannotEditProject();
});

test(`project owner role assigned`, async () => {
  fixtures.GivenProjectOwnerRoleIsAssigned();
  await fixtures.ThenCanPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
  await fixtures.ThenCanDeleteProject();
  await fixtures.ThenCanEditProject();
});

test(`project contributor role assigned`, async () => {
  fixtures.GivenProjectContributorRoleIsAssigned();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
  await fixtures.ThenCannotDeleteProject();
  await fixtures.ThenCanEditProject();
});

test(`project has multiple users`, async () => {
  await fixtures.GivenProjectHasMultipleUsers();
  await fixtures.GivenAnOwnerIsAssignedToProject();
  await fixtures.ThenCanFindNumberOfUsersInProject();
});

const getFixtures = async () => {
  const userProjectsToken = getRepositoryToken(UsersProjectsApiEntity);

  const projectId = v4();
  const userId = v4();
  const viewerUserId = v4();

  const publicProjects: string[] = [];

  const sandbox = await Test.createTestingModule({
    providers: [
      ProjectAclService,
      {
        provide: getDataSourceToken(DbConnections.default),
        useValue: {},
      },
      {
        provide: getRepositoryToken(User),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
          createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn(() => [
              {
                roleName: ProjectRoles.project_owner,
                projectId,
                userId,
              },
              {
                roleName: ProjectRoles.project_viewer,
                projectId,
                userId: viewerUserId,
              },
            ]),
          })),
        },
      },
      {
        provide: getRepositoryToken(UsersProjectsApiEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
          createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn(() => [
              {
                roleName: ProjectRoles.project_owner,
                projectId,
                userId,
              },
              {
                roleName: ProjectRoles.project_viewer,
                projectId,
                userId: viewerUserId,
              },
            ]),
          })),
        },
      },
      {
        provide: getRepositoryToken(PublishedProject),
        useValue: {
          find: jest.fn(),
          findOne: (findOneOptions: any) =>
            publicProjects.find((p) => p === findOneOptions.where.id),
          createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn(() => [
              {
                roleName: ProjectRoles.project_owner,
                projectId,
                userId,
              },
              {
                roleName: ProjectRoles.project_viewer,
                projectId,
                userId: viewerUserId,
              },
            ]),
          })),
        },
      },
      {
        provide: getRepositoryToken(ScenarioLockEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
        },
      },
      {
        provide: getRepositoryToken(IssuedAuthnToken),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
        },
      },
      LockService,
    ],
  }).compile();

  const sut = sandbox.get(ProjectAclService);

  const userProjectsRepoMock: jest.Mocked<Repository<UsersProjectsApiEntity>> =
    sandbox.get(userProjectsToken);

  return {
    GivenNoRoles: () =>
      userProjectsRepoMock.find.mockImplementation(async () => []),
    GivenProjectViewerRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: ProjectRoles.project_viewer,
          projectId,
          userId,
        },
      ]),
    GivenProjectIsPublic: async () => {
      publicProjects.push(projectId);
    },
    GivenProjectOwnerRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: ProjectRoles.project_owner,
          projectId,
          userId,
        },
      ]),
    GivenProjectContributorRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: ProjectRoles.project_contributor,
          projectId,
          userId,
        },
      ]),
    GivenProjectHasMultipleUsers: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: ProjectRoles.project_owner,
          projectId,
          userId,
        },
        {
          roleName: ProjectRoles.project_viewer,
          projectId,
          userId: viewerUserId,
        },
      ]),
    GivenAnOwnerIsAssignedToProject: () =>
      userProjectsRepoMock.findOne.mockReturnValue(
        Promise.resolve({
          projectId,
          userId,
          roleName: ProjectRoles.project_owner,
        }),
      ),
    ThenCannotCreateProject: async () => {
      expect(await sut.canCreateProject(userId)).toEqual(false);
    },
    ThenCanCreateProject: async () => {
      expect(await sut.canCreateProject(userId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotViewProject: async () => {
      expect(await sut.canViewProject(userId, projectId)).toEqual(false);
    },
    ThenCanViewProject: async () => {
      expect(await sut.canViewProject(userId, projectId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotEditProject: async () => {
      expect(await sut.canEditProject(userId, projectId)).toEqual(false);
    },
    ThenCanEditProject: async () => {
      expect(await sut.canEditProject(userId, projectId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotDeleteProject: async () => {
      expect(await sut.canDeleteProject(userId, projectId)).toEqual(false);
    },
    ThenCanDeleteProject: async () => {
      expect(await sut.canDeleteProject(userId, projectId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCanExportProject: async () => {
      expect(await sut.canExportProject(userId, projectId)).toEqual(true);
    },
    ThenCanDownloadProjectExport: async () => {
      expect(await sut.canDownloadProjectExport(userId, projectId)).toEqual(
        true,
      );
    },
    ThenCannotPublishProject: async () => {
      expect(await sut.canPublishProject(userId, projectId)).toEqual(false);
    },
    ThenCanPublishProject: async () => {
      expect(await sut.canPublishProject(userId, projectId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCanFindNumberOfUsersInProject: async () => {
      const result = await sut.findUsersInProject(projectId, viewerUserId);
      if (isLeft(result)) {
        expect(result.left).toBeUndefined();
      } else {
        expect(result.right).toHaveLength(2);
      }
      expect(userProjectsRepoMock.createQueryBuilder).toHaveBeenCalled();
    },
  };
};
