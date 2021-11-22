import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ProjectAclService } from './project-acl.service';

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
  fixtures.GivenProjectHasMultipleUsers();
  await fixtures.ThenCanFindNumberOfUsersInProject();
});

const getFixtures = async () => {
  const repo: jest.Mocked<Pick<Repository<UsersProjectsApiEntity>, 'find'>> = {
    find: jest.fn(),
  };

  const sandbox = await Test.createTestingModule({
    providers: [
      ProjectAclService,
      {
        provide: getRepositoryToken(UsersProjectsApiEntity),
        useValue: repo,
      },
    ],
  }).compile();

  const sut = sandbox.get(ProjectAclService);
  const projectId = v4();
  const userId = v4();
  const viewerUserId = v4();

  return {
    GivenNoRoles: () => repo.find.mockImplementation(async () => []),
    GivenProjectViewerRoleIsAssigned: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_viewer,
          projectId,
          userId,
        },
      ]),
    GivenProjectOwnerRoleIsAssigned: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_owner,
          projectId,
          userId,
        },
      ]),
    GivenProjectContributorRoleIsAssigned: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_contributor,
          projectId,
          userId,
        },
      ]),
    GivenProjectHasMultipleUsers: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_contributor,
          projectId,
          userId,
        },
        {
          roleName: Roles.project_viewer,
          projectId,
          userId: viewerUserId,
        },
      ]),
    ThenCannotCreateProject: async () => {
      expect(await sut.canCreateProject(userId, projectId)).toEqual(false);
    },
    ThenCanCreateProject: async () => {
      expect(await sut.canCreateProject(userId, projectId)).toEqual(true);
      expect(repo.find).toHaveBeenCalledWith({
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
      expect(repo.find).toHaveBeenCalledWith({
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
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCanFindNumberOfUsersInProject: async () => {
      expect(await sut.findUsersInProject(projectId)).toHaveLength(2);
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        select: ['roleName'],
        relations: ['user'],
      });
    },
  };
};
