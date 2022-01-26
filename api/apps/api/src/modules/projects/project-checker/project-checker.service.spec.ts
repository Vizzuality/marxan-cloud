import { FindConditions, In, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { isEqual } from 'lodash';
import { NotFoundException } from '@nestjs/common';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  doesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { MarxanProjectChecker } from '@marxan-api/modules/projects/project-checker/marxan-project-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`should form valid request`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectHavePlanningAreaAssigned();
  // when
  await service.isProjectReady(`projectId`);
  // then
  fixtures.ThenShouldAskAllPlanningUnitsStatuses();
});

it.each(
  Object.values(API_EVENT_KINDS).filter(
    (kind) =>
      kind !== API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
  ),
)(`should return false for %s`, async (kind) => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsJob(kind);
  // and
  fixtures.GivenProjectHavePlanningAreaAssigned();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`should return true for finished`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsJob(
    API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
  );
  // and
  fixtures.GivenProjectHavePlanningAreaAssigned();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it.each([
  API_EVENT_KINDS.project__grid__submitted__v1__alpha,
  API_EVENT_KINDS.project__grid__failed__v1__alpha,
])(`should return false for %s`, async (gridKind) => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsAndGridJob(
    API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
    gridKind,
  );
  // and
  fixtures.GivenProjectHavePlanningAreaAssigned();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`should return true for planningUnits and grid finished`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsAndGridJob(
    API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
    API_EVENT_KINDS.project__grid__finished__v1__alpha,
  );
  // and
  fixtures.GivenProjectHavePlanningAreaAssigned();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`should return false for projects without planning area assigned yet`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsJob(
    API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
  );
  // and
  fixtures.GivenPlanningAreaNotAssigned();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`should fail when project can't be find`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenPlanningUnitsJob(
    API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
  );
  // and
  fixtures.GivenProjectDoesntExist();
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toEqual({
    _tag: 'Left',
    left: doesntExist,
  });
});

it(`hasPendingExports() should return false for a project without pending exports`, async () => {
  // given
  const service = fixtures.getService();
  // and
  const hasPendingExports = await service.hasPendingExports(`projectId`);
  // then
  expect(hasPendingExports).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`hasPendingExports() should return true for a project with pending exports`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenExportJob(
    API_EVENT_KINDS.project__export__submitted__v1__alpha,
  );
  // and
  const hasPendingExports = await service.hasPendingExports(`projectId`);
  // then
  expect(hasPendingExports).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingExports() should return doesntExist if the project does not exists`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectDoesntExist();
  // and
  const hasPendingExports = await service.hasPendingExports(`projectId`);
  // then
  expect(hasPendingExports).toEqual({
    _tag: 'Left',
    left: doesntExist,
  });
});

async function getFixtures() {
  const fakeApiEventsService: jest.Mocked<
    Pick<ApiEventsService, 'getLatestEventForTopic'>
  > = {
    getLatestEventForTopic: jest.fn<any, any>(async () => {
      throw new NotFoundException();
    }),
  };
  const fakeProjectsService: jest.Mocked<
    Pick<Repository<Project>, 'findOne'>
  > = {
    findOne: jest.fn((_: any) => Promise.resolve({} as Project)),
  };

  const fakePlaningAreaFacade = {
    locatePlanningAreaEntity: jest.fn(),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: `ApiEventsService`,
        useValue: fakeApiEventsService,
      },
      {
        provide: getRepositoryToken(Project),
        useValue: fakeProjectsService,
      },
      {
        provide: `PlanningAreasService`,
        useValue: fakePlaningAreaFacade,
      },
      {
        provide: ProjectChecker,
        useClass: MarxanProjectChecker,
      },
    ],
  })
    .compile()
    .catch((error) => {
      console.log(error);
      throw error;
    });

  return {
    fakeApiEventsService,
    getService() {
      return testingModule.get(ProjectChecker);
    },
    planningUnitsKinds: Object.values(API_EVENT_KINDS)
      .filter((kind) => kind.startsWith(`project.planningUnits.`))
      .sort(),
    gridKinds: Object.values(API_EVENT_KINDS)
      .filter((kind) => kind.startsWith(`project.grid.`))
      .sort(),
    exportKinds: Object.values(API_EVENT_KINDS)
      .filter((kind) => kind.startsWith(`project.export.`))
      .sort(),
    ThenShouldAskAllPlanningUnitsStatuses() {
      expect(fakeApiEventsService.getLatestEventForTopic).toBeCalledTimes(2);
      expect(fakeApiEventsService.getLatestEventForTopic).toBeCalledWith({
        topic: `projectId`,
        kind: In(this.planningUnitsKinds),
      });
      expect(fakeApiEventsService.getLatestEventForTopic).toBeCalledWith({
        topic: `projectId`,
        kind: In(this.gridKinds),
      });
    },
    GivenProjectHavePlanningAreaAssigned: () => {
      fakePlaningAreaFacade.locatePlanningAreaEntity.mockImplementation(() =>
        Promise.resolve({
          id: '123',
          tableName: 'test',
        }),
      );
    },
    GivenPlanningUnitsJob(kind: API_EVENT_KINDS) {
      fixtures.fakeApiEventsService.getLatestEventForTopic.mockImplementation(
        async (args) => {
          if (isEqual(args.kind, In(fixtures.planningUnitsKinds))) {
            return {
              kind,
              timestamp: new Date(),
              topic: `projectId`,
            };
          }
          throw new NotFoundException();
        },
      );
    },
    GivenExportJob(kind: API_EVENT_KINDS) {
      fixtures.fakeApiEventsService.getLatestEventForTopic.mockImplementation(
        async (_args) => {
          if (fixtures.exportKinds.includes(kind)) {
            return {
              kind,
              timestamp: new Date(),
              topic: `projectId`,
            };
          }
          throw new NotFoundException();
        },
      );
    },
    GivenPlanningUnitsAndGridJob(
      planningUnitsStatus: API_EVENT_KINDS,
      gridStatus: API_EVENT_KINDS,
    ) {
      fixtures.fakeApiEventsService.getLatestEventForTopic.mockImplementation(
        async (args) => {
          if (isEqual(args.kind, In(fixtures.planningUnitsKinds))) {
            return {
              kind: planningUnitsStatus,
              timestamp: new Date(),
              topic: `projectId`,
            };
          }
          if (isEqual(args.kind, In(fixtures.gridKinds))) {
            return {
              kind: gridStatus,
              timestamp: new Date(),
              topic: `projectId`,
            };
          }
          throw new NotFoundException();
        },
      );
    },
    GivenPlanningAreaNotAssigned() {
      fakePlaningAreaFacade.locatePlanningAreaEntity.mockImplementation(() =>
        Promise.resolve(undefined),
      );
    },
    GivenProjectDoesntExist() {
      fakeProjectsService.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Project>) =>
          Promise.resolve(undefined),
      );
    },
    GivenProjectExists(projectId: string) {
      const fakeProject = { id: projectId } as Project;

      fakeProjectsService.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Project>) =>
          Promise.resolve(fakeProject),
      );
    },
  };
}
