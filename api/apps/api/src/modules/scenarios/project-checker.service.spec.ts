import { FindConditions, In, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { doesntExist, ProjectChecker } from './project-checker.service';
import { isEqual } from 'lodash';
import { NotFoundException } from '@nestjs/common';
import { Project } from '@marxan-api/modules/projects/project.api.entity';

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
    findOne: jest.fn(),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ApiEventsService,
        useValue: fakeApiEventsService,
      },
      {
        provide: `ProjectRepository`,
        useValue: fakeProjectsService,
      },
      ProjectChecker,
    ],
  }).compile();

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
      fakeProjectsService.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Project>) =>
          Promise.resolve(({
            planningAreaGeometryId: '123',
          } as unknown) as Project),
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
      fakeProjectsService.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Project>) =>
          Promise.resolve(({
            planningAreaGeometryId: undefined,
          } as unknown) as Project),
      );
    },
    GivenProjectDoesntExist() {
      fakeProjectsService.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Project>) =>
          Promise.resolve(undefined),
      );
    },
  };
}
