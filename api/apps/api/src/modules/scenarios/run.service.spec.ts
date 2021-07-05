import { EventEmitter } from 'events';
import { PromiseType } from 'utility-types';
import { right, left } from 'fp-ts/Either';
import waitForExpect from 'wait-for-expect';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  notFound,
  runEventsToken,
  runQueueToken,
  RunService,
} from '@marxan-api/modules/scenarios/run.service';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { Scenario } from './scenario.api.entity';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let runService: RunService;

beforeEach(async () => {
  fixtures = await getFixtures();
  runService = fixtures.getRunService();
});

test(`scheduling job`, async () => {
  fixtures.setupMocksForSchedulingJobs();

  // when
  await runService.run('scenario-1');

  // then
  fixtures.ThenShouldUpdateScenario();
  fixtures.ThenShouldEmitSubmittedEvent();
  fixtures.ThenShouldAddJob();
});

test(`canceling job`, async () => {
  fixtures.GivenANotCancellableJobInQueue();

  const result = await runService.cancel(`scenario-1`);

  expect(result).toStrictEqual(right(void 0));
});

test(`canceling job`, async () => {
  fixtures.GivenNoJobsInQueue();

  const result = await runService.cancel(`scenario-1`);

  expect(result).toStrictEqual(left(notFound));
});

test(`canceling active job`, async () => {
  fixtures.GivenAnActiveJobInQueue();

  const result = await runService.cancel(`scenario-1`);

  fixtures.ThenProgressOfActiveJobIsSetToCancel();
  expect(result).toStrictEqual(right(void 0));
});

test(`canceling waiting job`, async () => {
  fixtures.GivenAWaitingJobInQueue();

  const result = await runService.cancel(`scenario-1`);

  expect(fixtures.waitingJob.remove).toBeCalledTimes(1);
  expect(result).toStrictEqual(right(void 0));
});

describe(`with a single job in the queue`, () => {
  beforeEach(() => {
    fixtures.setupMockForCreatingEvents();
    fixtures.GivenAJobInQueue();
  });

  test.each`
    Got Event      | Saved Kind
    ${`failed`}    | ${API_EVENT_KINDS.scenario__run__failed__v1__alpha1}
    ${`completed`} | ${API_EVENT_KINDS.scenario__run__finished__v1__alpha1}
  `(`when $GotEvent, saves $SavedKind`, async ({ GotEvent, SavedKind }) => {
    fixtures.fakeEvents.emit(GotEvent, {
      jobId: `123`,
      data: {
        scenarioId: `scenario-x`,
      },
    });

    await fixtures.ThenEventCreated(SavedKind);
  });
});

async function getFixtures() {
  const throwingMock = () => jest.fn<any, any>(fail);
  const fakeQueue = {
    add: throwingMock(),
    getJobs: jest.fn(),
    getJob: jest.fn(),
  };
  const fakeEvents = new EventEmitter();
  const fakeApiEvents = {
    create: throwingMock(),
  };
  const fakeScenarioRepo = {
    update: throwingMock(),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: runQueueToken,
        useValue: fakeQueue,
      },
      {
        provide: runEventsToken,
        useValue: fakeEvents,
      },
      {
        provide: ApiEventsService,
        useValue: fakeApiEvents,
      },
      {
        provide: getRepositoryToken(Scenario),
        useValue: fakeScenarioRepo,
      },
      RunService,
    ],
  }).compile();

  return {
    fakeQueue,
    fakeEvents,
    fakeApiEvents,
    fakeScenarioRepo,
    activeJob: {
      data: {
        scenarioId: 'scenario-1',
      },
      isActive: async () => true,
      isWaiting: async () => false,
      updateProgress: jest.fn(),
    },
    waitingJob: {
      data: {
        scenarioId: 'scenario-1',
      },
      isActive: async () => false,
      isWaiting: async () => true,
      remove: jest.fn(),
    },
    notCancelableJob: {
      data: {
        scenarioId: 'scenario-1',
      },
      isActive: async () => false,
      isWaiting: async () => false,
    },
    otherJob: {
      data: {
        scenarioId: 'other-scenario',
      },
    },
    getRunService() {
      return testingModule.get(RunService);
    },
    setupMocksForSchedulingJobs() {
      this.setupMockForCreatingEvents();
      fakeQueue.add.mockImplementation(() => {
        //
      });
      fakeScenarioRepo.update.mockImplementation(() => {
        //
      });
    },
    setupMockForCreatingEvents() {
      fakeApiEvents.create.mockImplementation(() => {
        //
      });
    },
    GivenAnActiveJobInQueue() {
      const jobs = [this.otherJob, this.activeJob];
      this.fakeQueue.getJobs.mockImplementation((...args) => {
        expect(args).toStrictEqual([['active', 'waiting']]);
        return jobs;
      });
    },
    GivenAWaitingJobInQueue() {
      const jobs = [this.otherJob, this.waitingJob];
      this.fakeQueue.getJobs.mockImplementation((...args) => {
        expect(args).toStrictEqual([['active', 'waiting']]);
        return jobs;
      });
    },
    GivenANotCancellableJobInQueue() {
      const jobs = [this.otherJob, this.notCancelableJob];
      this.fakeQueue.getJobs.mockImplementation((...args) => {
        expect(args).toStrictEqual([['active', 'waiting']]);
        return jobs;
      });
    },
    ThenProgressOfActiveJobIsSetToCancel() {
      expect(fixtures.activeJob.updateProgress).toBeCalledTimes(1);
      expect(fixtures.activeJob.updateProgress).toBeCalledWith({
        canceled: true,
      });
    },
    ThenShouldUpdateScenario() {
      expect(fixtures.fakeScenarioRepo.update).toBeCalledTimes(1);
      expect(fixtures.fakeScenarioRepo.update).toBeCalledWith(`scenario-1`, {
        ranAtLeastOnce: true,
      });
    },
    ThenShouldEmitSubmittedEvent() {
      expect(fixtures.fakeApiEvents.create).toBeCalledTimes(1);
      expect(fixtures.fakeApiEvents.create).toBeCalledWith({
        topic: `scenario-1`,
        kind: API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
      });
    },
    ThenShouldAddJob() {
      expect(fixtures.fakeQueue.add).toBeCalledTimes(1);
      expect(fixtures.fakeQueue.add).toBeCalledWith(`run-scenario`, {
        scenarioId: `scenario-1`,
      });
    },
    async ThenEventCreated(kind: API_EVENT_KINDS) {
      await waitForExpect(() => {
        expect(fixtures.fakeApiEvents.create).toBeCalledTimes(1);
        expect(fixtures.fakeApiEvents.create).toBeCalledWith({
          kind,
          topic: `scenario-1`,
        });
      });
    },
    GivenNoJobsInQueue() {
      const jobs = [] as const;
      this.fakeQueue.getJobs.mockImplementation((...args) => {
        expect(args).toStrictEqual([['active', 'waiting']]);
        return jobs;
      });
    },
    GivenAJobInQueue() {
      fixtures.fakeQueue.getJob.mockImplementation((...args) => {
        expect(args).toStrictEqual([`123`]);
        return {
          data: {
            scenarioId: `scenario-1`,
          },
        };
      });
    },
  };
}
