import { In } from 'typeorm';
import { Test } from '@nestjs/testing';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ProjectChecker } from './project-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`should form valid request`, () => {
  // given
  const service = fixtures.getService();
  // when
  service.isProjectReady(`projectId`);
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
  fixtures.fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
    kind,
    timestamp: new Date(),
    topic: `projectId`,
  });
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toBe(false);
});

it(`should return true for finished`, async () => {
  // given
  const service = fixtures.getService();
  // and
  fixtures.fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
    kind: API_EVENT_KINDS.project__planningUnits__finished__v1__alpha as const,
    timestamp: new Date(),
    topic: `projectId`,
  });
  // when
  const isReady = await service.isProjectReady(`projectId`);
  // then
  expect(isReady).toBe(true);
});

async function getFixtures() {
  const fakeApiEventsService: jest.Mocked<
    Pick<ApiEventsService, 'getLatestEventForTopic'>
  > = {
    getLatestEventForTopic: jest.fn<any, any>(),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ApiEventsService,
        useValue: fakeApiEventsService,
      },
      ProjectChecker,
    ],
  }).compile();

  return {
    fakeApiEventsService,
    getService() {
      return testingModule.get(ProjectChecker);
    },
    ThenShouldAskAllPlanningUnitsStatuses() {
      expect(fakeApiEventsService.getLatestEventForTopic).toBeCalledTimes(1);
      expect(fakeApiEventsService.getLatestEventForTopic).toBeCalledWith({
        topic: `projectId`,
        kind: In(
          Object.values(API_EVENT_KINDS)
            .filter((kind) => kind.startsWith(`project.planningUnits.`))
            .sort(),
        ),
      });
    },
  };
}
