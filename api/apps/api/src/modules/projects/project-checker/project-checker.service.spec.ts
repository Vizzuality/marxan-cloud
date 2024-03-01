import { ApiEventsService } from '@marxan-api/modules/api-events';
import { MarxanProjectChecker } from '@marxan-api/modules/projects/project-checker/marxan-project-checker.service';
import {
  doesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isEqual } from 'lodash';
import { FindOneOptions, In, Repository } from 'typeorm';
import { ScenarioCheckerFake } from '../../../../../api/test/utils/scenario-checker.service-fake';
import { PlanningAreasService } from '@marxan-api/modules/planning-areas';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

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
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenExportJob(
    API_EVENT_KINDS.project__export__submitted__v1__alpha,
  );
  // and
  const hasPendingExports = await service.hasPendingExports(projectId);
  // then
  expect(hasPendingExports).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingExports() should return true for a project with a scenario with a pending export`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenScenarioIsBeingExported('scenario-2');
  // and
  const hasPendingExports = await service.hasPendingExports(projectId);
  // then
  expect(hasPendingExports).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingExports() should return doesntExist if the project does not exist`, async () => {
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

it(`hasPendingImports() should return false for a project without pending imports`, async () => {
  // given
  const service = fixtures.getService();
  // and
  const hasPendingImports = await service.hasPendingImports(`projectId`);
  // then
  expect(hasPendingImports).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`hasPendingImports() should return true for a project with pending imports`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenImportJob(
    API_EVENT_KINDS.project__import__submitted__v1__alpha,
  );
  // and
  const hasPendingImports = await service.hasPendingImports(projectId);
  // then
  expect(hasPendingImports).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingImports() should return true for a project with a scenario with a pending import`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenScenarioIsBeingImported('scenario-2');
  // and
  const hasPendingImports = await service.hasPendingImports(projectId);
  // then
  expect(hasPendingImports).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingImports() should return doesntExist if the project does not exist`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectDoesntExist();
  // and
  const hasPendingImports = await service.hasPendingImports(`projectId`);
  // then
  expect(hasPendingImports).toEqual({
    _tag: 'Left',
    left: doesntExist,
  });
});

it(`hasPendingBlmCalibration() should return false for a project without scenarios running blm calibration`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  // and
  const hasPendingBlmCalibration =
    await service.hasPendingBlmCalibration(projectId);

  // then
  expect(hasPendingBlmCalibration).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`hasPendingBlmCalibration() should return true for a project with a scenario with a pending blm calibration`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenScenarioIsRunningBlmCalibration('scenario-1');
  // and
  const hasPendingBlmCalibration =
    await service.hasPendingBlmCalibration(projectId);
  // then
  expect(hasPendingBlmCalibration).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingBlmCalibration() should return doesntExist if the project does not exist`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectDoesntExist();
  // and
  const hasPendingBlmCalibration =
    await service.hasPendingBlmCalibration(`projectId`);
  // then
  expect(hasPendingBlmCalibration).toEqual({
    _tag: 'Left',
    left: doesntExist,
  });
});

it(`hasPendingMarxanRun() should return false for a project without scenarios running marxan`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  // and
  const hasPendingMarxanRun = await service.hasPendingMarxanRun(projectId);

  // then
  expect(hasPendingMarxanRun).toEqual({
    _tag: 'Right',
    right: false,
  });
});

it(`hasPendingMarxanRun() should return true for a project with a scenario with a pending marxan run`, async () => {
  const projectId = 'projectId';

  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectExists(projectId, [
    { id: 'scenario-1' },
    { id: 'scenario-2' },
  ]);
  fixtures.GivenScenarioIsRunningMarxanRun('scenario-2');
  // and
  const hasPendingMarxanRun = await service.hasPendingMarxanRun(projectId);
  // then
  expect(hasPendingMarxanRun).toEqual({
    _tag: 'Right',
    right: true,
  });
});

it(`hasPendingMarxanRun() should return doesntExist if the project does not exist`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.GivenProjectDoesntExist();
  // and
  const hasPendingMarxanRun = await service.hasPendingMarxanRun(`projectId`);
  // then
  expect(hasPendingMarxanRun).toEqual({
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
  const fakeProjectsService: jest.Mocked<Pick<Repository<Project>, 'findOne'>> =
    {
      findOne: jest.fn((_: any) => Promise.resolve({} as Project)),
    };

  const fakeScenariosRepo: jest.Mocked<Pick<Repository<Scenario>, 'findOne'>> =
    {
      findOne: jest.fn((_: any) => Promise.resolve({} as Scenario)),
    };

  const fakeFeaturesRepo: jest.Mocked<Pick<Repository<GeoFeature>, 'count'>> = {
    count: jest.fn((_: any) => Promise.resolve(1)),
  };

  const fakePlaningAreaFacade = {
    locatePlanningAreaEntity: jest.fn(),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ApiEventsService,
        useValue: fakeApiEventsService,
      },
      {
        provide: getRepositoryToken(Project),
        useValue: fakeProjectsService,
      },
      {
        provide: getRepositoryToken(Scenario),
        useValue: fakeScenariosRepo,
      },
      {
        provide: getRepositoryToken(GeoFeature),
        useValue: fakeFeaturesRepo,
      },
      {
        provide: PlanningAreasService,
        useValue: fakePlaningAreaFacade,
      },
      {
        provide: ProjectChecker,
        useClass: MarxanProjectChecker,
      },
      {
        provide: ScenarioChecker,
        useClass: ScenarioCheckerFake,
      },
    ],
  })
    .compile()
    .catch((error) => {
      console.log(error);
      throw error;
    });

  const fakeScenarioChecker = testingModule.get(
    ScenarioChecker,
  ) as ScenarioCheckerFake;

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
    importKinds: Object.values(API_EVENT_KINDS)
      .filter((kind) => kind.startsWith(`project.import.`))
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
    GivenImportJob(kind: API_EVENT_KINDS) {
      fixtures.fakeApiEventsService.getLatestEventForTopic.mockImplementation(
        async (_args) => {
          if (fixtures.importKinds.includes(kind)) {
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
        (options: FindOneOptions<Project>) => Promise.resolve(null),
      );
    },
    GivenProjectExists(projectId: string, scenarios?: { id: string }[]) {
      const fakeProject = { id: projectId, scenarios } as Project;

      fakeProjectsService.findOne.mockImplementation(
        (options: FindOneOptions<Project>) => Promise.resolve(fakeProject),
      );
    },
    GivenScenarioIsBeingExported(scenarioId: string) {
      fakeScenarioChecker.addPendingExportForScenario(scenarioId);
    },
    GivenScenarioIsBeingImported(scenarioId: string) {
      fakeScenarioChecker.addPendingImportForScenario(scenarioId);
    },
    GivenScenarioIsRunningBlmCalibration(scenarioId: string) {
      fakeScenarioChecker.addPendingBlmCalibrationForScenario(scenarioId);
    },
    GivenScenarioIsRunningMarxanRun(scenarioId: string) {
      fakeScenarioChecker.addPendingMarxanRunForScenario(scenarioId);
    },
  };
}
