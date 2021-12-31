import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ProjectAclService } from './project-acl.service';
import { isLeft } from 'fp-ts/Either';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`no roles assigned at all`, async () => {
  fixtures.GivenNoRoles();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCannotViewProject();
});

test(`project viewer role assigned`, async () => {
  fixtures.GivenProjectViewerRoleIsAssigned();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
});

test(`project owner role assigned`, async () => {
  fixtures.GivenProjectOwnerRoleIsAssigned();
  await fixtures.ThenCanPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
});

test(`project contributor role assigned`, async () => {
  fixtures.GivenProjectContributorRoleIsAssigned();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
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

  const sandbox = await Test.createTestingModule({
    providers: [
      ProjectAclService,
      {
        provide: getRepositoryToken(UsersProjectsApiEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
          createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn(() => [
              {
                roleName: Roles.project_owner,
                projectId,
                userId,
              },
              {
                roleName: Roles.project_viewer,
                projectId,
                userId: viewerUserId,
              },
            ]),
          })),
        },
      },
    ],
  }).compile();

  const sut = sandbox.get(ProjectAclService);

  const userProjectsRepoMock: jest.Mocked<
    Repository<UsersProjectsApiEntity>
  > = sandbox.get(userProjectsToken);

  return {
    GivenNoRoles: () =>
      userProjectsRepoMock.find.mockImplementation(async () => []),
    GivenProjectViewerRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.project_viewer,
          projectId,
          userId,
        },
      ]),
    GivenProjectOwnerRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.project_owner,
          projectId,
          userId,
        },
      ]),
    GivenProjectContributorRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.project_contributor,
          projectId,
          userId,
        },
      ]),
    GivenProjectHasMultipleUsers: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.project_owner,
          projectId,
          userId,
        },
        {
          roleName: Roles.project_viewer,
          projectId,
          userId: viewerUserId,
        },
      ]),
    GivenAnOwnerIsAssignedToProject: () =>
      userProjectsRepoMock.findOne.mockReturnValue(
        Promise.resolve({
          projectId,
          userId,
          roleName: Roles.project_owner,
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
