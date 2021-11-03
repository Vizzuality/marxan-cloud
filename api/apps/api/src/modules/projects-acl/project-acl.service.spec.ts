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
  await fixtures.ThenCannotPublish();
});

test(`user role assigned`, async () => {
  fixtures.GivenProjectUserRoleIsAssigned();
  await fixtures.ThenCannotPublish();
});

test(`owner role assigned`, async () => {
  fixtures.GivenProjectOwnerRoleIsAssigned();
  await fixtures.ThenCanPublish();
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
    GivenNoRoles: () => repo.find.mockImplementationOnce(async () => []),
    GivenProjectUserRoleIsAssigned: () =>
      repo.find.mockImplementationOnce(async () => [
        {
          roleName: Roles.project_user,
          projectId,
          userId,
        },
      ]),
    GivenProjectOwnerRoleIsAssigned: () =>
      repo.find.mockImplementationOnce(async () => [
        {
          roleName: Roles.project_owner,
          projectId,
          userId,
        },
      ]),
    ThenCannotPublish: async () => {
      expect(await sut.canPublish(userId, projectId)).toEqual(false);
    },
    ThenCanPublish: async () => {
      expect(await sut.canPublish(userId, projectId)).toEqual(true);
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
      });
    },
  };
};
