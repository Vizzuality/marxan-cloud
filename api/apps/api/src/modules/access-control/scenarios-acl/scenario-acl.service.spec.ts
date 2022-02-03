import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '../projects-acl/dto/user-role-project.dto';
import { LockService } from './locks/lock.service';
import { ScenarioLockEntity } from './locks/entity/scenario.lock.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`no roles assigned at all`, async () => {
  fixtures.GivenNoRoles();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCannotEditScenario();
  await fixtures.ThenCannotViewScenario();
});

test(`scenario viewer role assigned`, async () => {
  fixtures.GivenScenarioViewerRoleIsAssigned();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCannotEditScenario();
  await fixtures.ThenCanViewScenario();
});

test(`scenario owner role assigned`, async () => {
  fixtures.GivenScenarioOwnerRoleIsAssigned();
  await fixtures.ThenCanDeleteScenario();
  await fixtures.ThenCanEditScenario();
  await fixtures.ThenCanViewScenario();
});

test(`scenario contributor role assigned`, async () => {
  fixtures.GivenScenarioContributorRoleIsAssigned();
  await fixtures.ThenCannotDeleteScenario();
  await fixtures.ThenCanEditScenario();
  await fixtures.ThenCanViewScenario();
});

test(`project owner role assigned`, async () => {
  fixtures.GivenProjectOwnerRoleIsAssigned();
  await fixtures.ThenCanCreateScenario();
});
test(`project contributor role assigned`, async () => {
  fixtures.GivenProjectContributorRoleIsAssigned();
  await fixtures.ThenCanCreateScenario();
});
test(`project viewer role assigned`, async () => {
  fixtures.GivenProjectViewerRoleIsAssigned();
  await fixtures.ThenCannotCreateScenario();
});

const getFixtures = async () => {
  const userScenariosToken = getRepositoryToken(UsersScenariosApiEntity);
  const userProjectsToken = getRepositoryToken(UsersProjectsApiEntity);

  const scenarioId = v4();
  const projectId = v4();
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
      {
        provide: getRepositoryToken(UsersProjectsApiEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
        },
      },
      {
        provide: getRepositoryToken(ScenarioLockEntity),
        useValue: {
          find: jest.fn(),
          findOne: jest.fn(),
        },
      },
      LockService,
    ],
  }).compile();

  const sut = sandbox.get(ScenarioAclService);

  const userScenariosRepoMock = sandbox.get(userScenariosToken);
  const userProjectsRepoMock = sandbox.get(userProjectsToken);

  return {
    GivenNoRoles: () =>
      userScenariosRepoMock.find.mockImplementation(async () => []),
    GivenScenarioViewerRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: ScenarioRoles.scenario_viewer,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioOwnerRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: ScenarioRoles.scenario_owner,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioContributorRoleIsAssigned: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: ScenarioRoles.scenario_contributor,
          scenarioId,
          userId,
        },
      ]),
    GivenScenarioHasMultipleUsers: () =>
      userScenariosRepoMock.find.mockImplementation(async () => [
        {
          roleName: ScenarioRoles.scenario_owner,
          scenarioId,
          userId,
        },
        {
          roleName: ScenarioRoles.scenario_viewer,
          scenarioId,
          userId: viewerUserId,
        },
      ]),
    GivenAnOwnerIsAssignedToScenario: () =>
      userScenariosRepoMock.findOne.mockReturnValue(
        Promise.resolve({
          scenarioId,
          userId,
          roleName: ScenarioRoles.scenario_owner,
        }),
      ),
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
    GivenProjectViewerRoleIsAssigned: () =>
      userProjectsRepoMock.find.mockImplementation(async () => [
        {
          roleName: ProjectRoles.project_viewer,
          projectId,
          userId,
        },
      ]),
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
    ThenCannotCreateScenario: async () => {
      expect(await sut.canCreateScenario(userId, projectId)).toEqual(false);
    },
    ThenCanCreateScenario: async () => {
      expect(await sut.canCreateScenario(userId, projectId)).toEqual(true);
      expect(userProjectsRepoMock.find).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
        },
        select: ['roleName'],
      });
    },
  };
};
