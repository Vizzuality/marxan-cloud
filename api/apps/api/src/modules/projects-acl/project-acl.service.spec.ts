import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';

import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { Roles } from '../users/role.api.entity';
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

test(`project user role assigned`, async () => {
  fixtures.GivenProjectUserRoleIsAssigned();
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

test(`project admin role assigned`, async () => {
  fixtures.GivenProjectAdminRoleIsAssigned();
  await fixtures.ThenCannotPublishProject();
  await fixtures.ThenCanCreateProject();
  await fixtures.ThenCanViewProject();
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

  return {
    GivenNoRoles: () => repo.find.mockImplementation(async () => []),
    GivenProjectUserRoleIsAssigned: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_user,
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
    GivenProjectAdminRoleIsAssigned: () =>
      repo.find.mockImplementation(async () => [
        {
          roleName: Roles.project_admin,
          projectId,
          userId,
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
      });
    },
  };
};
