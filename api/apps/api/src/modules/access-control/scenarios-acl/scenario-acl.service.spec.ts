import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ScenarioAclService } from './scenario-acl.service';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`no roles assigned at all`, async () => {
  fixtures.GivenNoRoles();
  await fixtures.ThenCannotCreateSolution();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCannotEditScenario();
  await fixtures.ThenCannotViewScenario();
});

test(`scenario viewer role assigned`, async () => {
  fixtures.GivenScenarioViewerRoleIsAssigned();
  await fixtures.ThenCannotCreateSolution();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCannotEditScenario();
  await fixtures.ThenCanViewScenario();
});

test(`scenario owner role assigned`, async () => {
  fixtures.GivenScenarioOwnerRoleIsAssigned();
  await fixtures.ThenCanCreateSolution();
  await fixtures.ThenCanDeleteScenario();
  await fixtures.ThenCanEditScenario();
  await fixtures.ThenCanViewScenario();
});

test(`scenario contributor role assigned`, async () => {
  fixtures.GivenScenarioContributorRoleIsAssigned();
  await fixtures.ThenCanCreateSolution();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCanEditScenario();
  await fixtures.ThenCanViewScenario();
});

const getFixtures = async () => {
  let userScenariosRepoMock: jest.Mocked<Repository<UsersScenariosApiEntity>>;

  const userProjectsToken = getRepositoryToken(UsersScenariosApiEntity);

  const scenarioId = v4();
  const userId = v4();
  const viewerUserId = v4();

  const sandbox = await Test.createTestingModule({
    providers: [
      ScenarioAclService,
      {
        provide: getRepositoryToken(UsersScenariosApiEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
        },
      },
    ],
  }).compile();

  const sut = sandbox.get(ScenarioAclService);

  userScenariosRepoMock = sandbox.get(userProjectsToken);

  return {
    GivenNoRoles: () =>
      userScenariosRepoMock.find.mockImplementation(async () => []),
    GivenScenarioViewerRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.scenario_viewer,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioOwnerRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.scenario_owner,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioContributorRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.scenario_contributor,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioHasMultipleUsers: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: Roles.scenario_owner,
          scenarioId,
          userId,
        },
        {
          roleName: Roles.scenario_viewer,
          scenarioId,
          userId: viewerUserId,
        },
      ]),
    GivenAnOwnerIsAssignedToScenario: () =>
      userScenariosRepoMock.findOne.mockReturnValue(
        Promise.resolve({
          scenarioId,
          userId,
          roleName: Roles.scenario_owner,
        }),
      ),
    ThenCannotCreateSolution: async () => {
      expect(await sut.canCreateSolution(userId, scenarioId)).toEqual(false);
    },
    ThenCanCreateSolution: async () => {
      expect(await sut.canCreateSolution(userId, scenarioId)).toEqual(true);
      expect(userScenariosRepoMock.find).toHaveBeenCalledWith({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotViewScenario: async () => {
      expect(await sut.canViewScenario(userId, scenarioId)).toEqual(false);
    },
    ThenCanViewScenario: async () => {
      expect(await sut.canViewScenario(userId, scenarioId)).toEqual(true);
      expect(userScenariosRepoMock.find).toHaveBeenCalledWith({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotEditScenario: async () => {
      expect(await sut.canEditScenario(userId, scenarioId)).toEqual(false);
    },
    ThenCanEditScenario: async () => {
      expect(await sut.canEditScenario(userId, scenarioId)).toEqual(true);
      expect(userScenariosRepoMock.find).toHaveBeenCalledWith({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      });
    },
    ThenCannotDeleteScenario: async () => {
      expect(await sut.canDeleteScenario(userId, scenarioId)).toEqual(false);
    },
    ThenCanDeleteScenario: async () => {
      expect(await sut.canDeleteScenario(userId, scenarioId)).toEqual(true);
      expect(userScenariosRepoMock.find).toHaveBeenCalledWith({
        where: {
          scenarioId,
          userId,
        },
        select: ['roleName'],
      });
    },
  };
};
