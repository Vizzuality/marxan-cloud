import { EventEmitter } from 'events';
import { PromiseType } from 'utility-types';
import { left, right } from 'fp-ts/Either';
import waitForExpect from 'wait-for-expect';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ProgressData } from '@marxan/scenario-run-queue';
import {
  ApiEventsService,
  duplicate,
} from '@marxan-api/modules/api-events/api-events.service';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import { OutputRepository } from '@marxan-api/modules/scenarios/marxan-run/output.repository';
import {
  ExecutionResult,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { assertDefined, FieldsOf } from '@marxan/utils';
import { Scenario } from '../scenario.api.entity';
import { RunService } from './run.service';
import { AssetsService } from './assets.service';
import { blmDefaultToken, runEventsToken, runQueueToken } from './tokens';
import { RunHandler } from './run.handler';
import { CancelHandler, notFound } from './cancel.handler';
import { EventsHandler } from './events.handler';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let runService: RunService;

beforeEach(async () => {
  fixtures = await getFixtures();
  runService = fixtures.getRunService();
});

test(`scheduling job`, async () => {
  fixtures.setupMocksForSchedulingJobs(() => `1234`);
  // given
  fixtures.GivenAssetsAvailable();

  // when
  await runService.run({ id: 'scenario-1' });

  // then
  fixtures.ThenShouldUpdateScenario();
  fixtures.ThenShouldEmitSubmittedEvent(`1234`);
  fixtures.ThenShouldAddJob();
  fixtures.ThenShouldUseDefaultBlm();
});

test(`scheduling job with overriding blm`, async () => {
  fixtures.setupMocksForSchedulingJobs(() => `1234`);
  // given
  fixtures.GivenAssetsAvailable();

  // when
  await runService.run({ id: 'scenario-1', boundaryLengthModifier: 78 }, -123);

  // then
  fixtures.ThenShouldUpdateScenario();
  fixtures.ThenShouldEmitSubmittedEvent(`1234`);
  fixtures.ThenShouldAddJob();
  fixtures.ThenShouldUseBlm(-123);
});

test(`scheduling job with scenario that has blm`, async () => {
  fixtures.setupMocksForSchedulingJobs(() => `1234`);
  // given
  fixtures.GivenAssetsAvailable();

  // when
  await runService.run({ id: 'scenario-1', boundaryLengthModifier: 78 });

  // then
  fixtures.ThenShouldUpdateScenario();
  fixtures.ThenShouldEmitSubmittedEvent(`1234`);
  fixtures.ThenShouldAddJob();
  fixtures.ThenShouldUseBlm(78);
});

test(`scheduling job for scenario without assets`, async () => {
  fixtures.setupMocksForSchedulingJobs(() => `12345`);
  // given
  fixtures.GivenAssetsNotAvailable();

  // when
  const result = runService.run({ id: 'scenario-1' });

  // then
  await expect(result).rejects.toBeDefined();
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

test(`failed job`, async () => {
  fixtures.setupMockForCreatingEvents();
  fixtures.GivenAJobInQueue();

  fixtures.fakeEvents.emit(
    `failed`,
    {
      jobId: `123`,
      data: {
        scenarioId: `scenario-x`,
      },
    },
    `eventid1`,
  );

  await fixtures.ThenEventCreatedIfNotExisted(
    API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
    `eventid1`,
    {
      reason: 'fail description',
    },
  );
});

test(`completed job`, async () => {
  fixtures.setupMocksForCompletedJob();
  fixtures.GivenAJobInQueueWithReturnValue();

  fixtures.fakeEvents.emit(
    `completed`,
    {
      jobId: `123`,
      data: {
        scenarioId: `scenario-x`,
      },
    },
    `eventId2`,
  );

  await fixtures.ThenEventCreatedIfNotExisted(
    API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
    `eventId2`,
  );
  await fixtures.ThenEventCreated(
    API_EVENT_KINDS.scenario__run__outputSaved__v1__alpha1,
  );
  fixtures.ThenOutputPersisted();
});

test(`duplicated completed job`, async () => {
  fixtures.setupMocksForDuplicatedCompletedJob();
  fixtures.GivenAJobInQueueWithReturnValue();

  fixtures.fakeEvents.emit(
    `completed`,
    {
      jobId: `123`,
      data: {
        scenarioId: `scenario-x`,
      },
    },
    `eventId2`,
  );

  await fixtures.ThenEventCreatedIfNotExisted(
    API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
    `eventId2`,
  );
  fixtures.ThenOutputNotPersisted();
});

test(`completed job with failing save`, async () => {
  fixtures.setupMocksForCompletedJob();
  fixtures.GivenOutputRepositoryFails();
  fixtures.GivenAJobInQueueWithReturnValue();

  fixtures.fakeEvents.emit(
    `completed`,
    {
      jobId: `123`,
      data: {
        scenarioId: `scenario-x`,
      },
    },
    `eventId2`,
  );

  await fixtures.ThenEventCreatedIfNotExisted(
    API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
    `eventId2`,
  );
  await fixtures.ThenEventCreated(
    API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1,
  );
});

test(`handling progress`, async () => {
  fixtures.setupMockForCreatingEvents();
  fixtures.GivenAJobInQueue();

  const progressData: ProgressData = {
    scenarioId: `scenario-x`,
    fractionalProgress: 0.62,
  };
  fixtures.fakeEvents.emit(
    `progress`,
    {
      jobId: `123`,
      data: progressData,
    },
    `eventId1`,
  );
  await fixtures.ThenEventCreatedIfNotExisted(
    API_EVENT_KINDS.scenario__run__progress__v1__alpha1,
    `eventId1`,
    {
      kind: API_EVENT_KINDS.scenario__run__progress__v1__alpha1,
      fractionalProgress: progressData.fractionalProgress,
    },
  );
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
    createIfNotExists: throwingMock(),
    create: throwingMock(),
  };
  const fakeScenarioRepo = {
    update: throwingMock(),
  };
  const fakeAssets = {
    forScenario: jest.fn(),
  };

  class FakeOutputRepository implements FieldsOf<OutputRepository> {
    db: ScenariosOutputResultsApiEntity[] = [];

    async saveOutput(job: {
      returnvalue: ExecutionResult | undefined;
      data: { scenarioId: string };
    }): Promise<void> {
      assertDefined(job.returnvalue);
      this.db.push({
        id: this.db.length.toString(),
        ...job.returnvalue,
        scenarioId: job.data.scenarioId,
      });
    }
  }

  const testingModule = await Test.createTestingModule({
    providers: [
      RunHandler,
      CancelHandler,
      EventsHandler,
      {
        provide: blmDefaultToken,
        useValue: 42,
      },
      FakeOutputRepository,
      {
        provide: OutputRepository,
        useExisting: FakeOutputRepository,
      },
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
      {
        provide: AssetsService,
        useValue: fakeAssets,
      },
      RunService,
    ],
  }).compile();

  const fakeOutputRepository = testingModule.get(FakeOutputRepository);

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
    scenarioAssets: [
      {
        url: 'url-value',
        relativeDestination: 'relativeDestination-value',
      },
    ],
    defaultBlm: testingModule.get<number>(blmDefaultToken),
    getRunService() {
      return testingModule.get(RunService);
    },
    setupMocksForSchedulingJobs(createId: () => string) {
      fakeApiEvents.create.mockImplementation(() => {
        //
      });
      fakeQueue.add.mockImplementation(async () => {
        return {
          id: createId(),
        };
      });
      fakeScenarioRepo.update.mockImplementation(() => {
        //
      });
    },
    setupMockForCreatingEvents() {
      fakeApiEvents.createIfNotExists.mockImplementation(() => {
        return right({});
      });
    },
    setupMocksForCompletedJob() {
      fakeApiEvents.createIfNotExists.mockImplementation(() => {
        return right({});
      });
      fakeApiEvents.create.mockImplementation(() => {
        return {};
      });
    },
    setupMocksForDuplicatedCompletedJob() {
      fakeApiEvents.createIfNotExists.mockImplementation(() => {
        return left(duplicate);
      });
    },
    GivenOutputRepositoryFails() {
      fakeOutputRepository.saveOutput = () => {
        throw new Error('failed!');
      };
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
        scenarioId: `scenario-1`,
      });
    },
    ThenShouldUpdateScenario() {
      expect(fixtures.fakeScenarioRepo.update).toBeCalledTimes(1);
      expect(fixtures.fakeScenarioRepo.update).toBeCalledWith(`scenario-1`, {
        ranAtLeastOnce: true,
      });
    },
    ThenShouldEmitSubmittedEvent(id: string) {
      expect(fixtures.fakeApiEvents.create).toBeCalledTimes(1);
      expect(fixtures.fakeApiEvents.create).toBeCalledWith({
        topic: `scenario-1`,
        kind: API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
        externalId: `${id}${API_EVENT_KINDS.scenario__run__submitted__v1__alpha1}`,
      });
    },
    ThenShouldAddJob() {
      expect(fixtures.fakeQueue.add).toBeCalledTimes(1);
      expect(fixtures.fakeQueue.add).toBeCalledWith(`run-scenario`, {
        scenarioId: `scenario-1`,
        assets: this.scenarioAssets,
      });
    },
    async ThenEventCreatedIfNotExisted(
      kind: API_EVENT_KINDS,
      eventId: string,
      data?: CreateApiEventDTO['data'],
    ) {
      await waitForExpect(() => {
        expect(fixtures.fakeApiEvents.createIfNotExists).toBeCalledTimes(1);
        expect(fixtures.fakeApiEvents.createIfNotExists).toBeCalledWith({
          kind,
          topic: `scenario-1`,
          externalId: eventId,
          data,
        });
      });
    },
    async ThenEventCreated(
      kind: API_EVENT_KINDS,
      eventId?: string,
      data?: CreateApiEventDTO['data'],
    ) {
      await waitForExpect(() => {
        expect(fixtures.fakeApiEvents.create).toBeCalledTimes(1);
        expect(fixtures.fakeApiEvents.create).toBeCalledWith({
          kind,
          topic: `scenario-1`,
          externalId: eventId,
          data,
        });
      });
    },
    ThenOutputPersisted() {
      expect(fakeOutputRepository.db).toStrictEqual([
        {
          id: '0',
          runId: '25',
          scenarioId: 'scenario-1',
          scoreValue: 100,
        },
      ]);
    },
    ThenOutputNotPersisted() {
      expect(fakeOutputRepository.db).toStrictEqual([]);
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
          failedReason: `fail description`,
        };
      });
    },
    GivenAJobInQueueWithReturnValue() {
      fixtures.fakeQueue.getJob.mockImplementation((...args) => {
        expect(args).toStrictEqual([`123`]);
        return {
          data: {
            scenarioId: `scenario-1`,
          },
          returnvalue: {
            runId: '25',
            scoreValue: 100,
          },
        };
      });
    },
    GivenAssetsAvailable() {
      fakeAssets.forScenario.mockImplementation((id) => {
        expect(id).toBe(`scenario-1`);
        return this.scenarioAssets;
      });
    },
    GivenAssetsNotAvailable() {
      fakeAssets.forScenario.mockImplementation((id) => {
        expect(id).toBe(`scenario-1`);
        return undefined;
      });
    },
    ThenShouldUseDefaultBlm() {
      this.ThenShouldUseBlm(this.defaultBlm);
    },
    ThenShouldUseBlm(blm: number) {
      expect(fakeAssets.forScenario).toBeCalledTimes(1);
      expect(fakeAssets.forScenario).toBeCalledWith(`scenario-1`, blm);
    },
  };
}
