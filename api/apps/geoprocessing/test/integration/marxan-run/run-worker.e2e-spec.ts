import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import { Job, Queue } from 'bullmq';
import * as config from 'config';
import waitForExpect from 'wait-for-expect';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { assertDefined, FieldsOf } from '@marxan/utils';
import { JobData } from '@marxan/scenario-run-queue';
import {
  RunWorker,
  runWorkerQueueNameToken,
} from '@marxan-geoprocessing/modules/scenarios/run.worker';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => [await fixtures.cleanup()]);

test(`starting run`, async () => {
  fixtures.setupForStartingRun();

  // given
  const jobData: JobData = fixtures.jobData;

  // when
  await fixtures.queue.add(`whatever`, jobData);

  // then
  await fixtures.thenScenarioIsRunning(jobData);
});

test(`progress reporting`, async () => {
  fixtures.setupForProgressReporting();

  // given
  const jobData: JobData = fixtures.jobData;

  // and
  const job = await fixtures.queue.add(`whatever`, jobData);

  // when
  const progress = Math.random();
  await fixtures.whenReportProgressFromTheRun(progress);

  // then
  await fixtures.thenProgressChangedInTheJob(job, progress);
});

test(`killing run`, async () => {
  fixtures.setupForKillingRun();

  // given
  const jobData: JobData = fixtures.jobData;
  const job = await fixtures.queue.add(`whatever`, jobData);

  // and
  await fixtures.givenJobIsActive(job);

  // when
  await job.updateProgress({
    canceled: true,
    scenarioId: `123123qqq`,
  });

  // then
  await fixtures.thenJobIsKilled(job);

  // and
  await fixtures.thenJobIsCompleted(job);
});

async function getFixtures() {
  const throwingMock = () => jest.fn<any, any>(fail);
  type MockedMarxanRunner = jest.Mocked<FieldsOf<MarxanSandboxRunnerService>>;
  class FakeMarxanRunner implements MockedMarxanRunner {
    progressCallbacks: ((progress: number) => void)[] = [];
    kill: MockedMarxanRunner['kill'] = throwingMock();
    run: MockedMarxanRunner['run'] = throwingMock();
  }
  const testingModule = await Test.createTestingModule({
    imports: [WorkerModule],
    providers: [
      FakeMarxanRunner,
      {
        provide: MarxanSandboxRunnerService,
        useExisting: FakeMarxanRunner,
      },
      RunWorker,
      {
        provide: runWorkerQueueNameToken,
        useValue: 'test-run-worker-queue' + new Date().toISOString(),
      },
    ],
  }).compile();
  await testingModule.enableShutdownHooks().init();

  const queue = new Queue(testingModule.get(runWorkerQueueNameToken), {
    ...config.get('redisApi'),
  });
  const fakeMarxanRunner = testingModule.get(FakeMarxanRunner);

  return {
    queue,
    fakeMarxanRunner,
    jobData: {
      scenarioId: '123123qqq',
      assets: [
        {
          url: 'url1',
          relativeDestination: 'dest1',
        },
      ],
    },
    async cleanup() {
      await queue.obliterate({ force: true });
      await queue.close();
      await queue.disconnect();
      await testingModule.close();
    },
    setupForStartingRun() {
      this.fakeMarxanRunner.run.mockImplementation(async () => {
        return [];
      });
    },
    setupForKillingRun() {
      let release: () => void;
      const lock = new Promise<void>((resolve) => {
        release = resolve;
      });
      fakeMarxanRunner.run.mockImplementation(async () => {
        await lock;
        return [];
      });
      fakeMarxanRunner.kill.mockImplementation(async () => {
        release();
      });
    },
    setupForProgressReporting() {
      let release: () => void;
      const lock = new Promise<void>((resolve) => {
        release = resolve;
      });
      fakeMarxanRunner.run.mockImplementation(async () => {
        await lock;
        return [];
      });
      this.fakeMarxanRunner.run.mockImplementation(
        async (_1, _2, progressCallback) => {
          this.fakeMarxanRunner.progressCallbacks.push((value) => {
            progressCallback(value);
            release();
          });
          return [];
        },
      );
    },
    async givenJobIsActive(job: Job) {
      await waitForExpect(async () => {
        expect(await job.isActive()).toBe(true);
      });
    },
    async whenReportProgressFromTheRun(progress: number) {
      await waitForExpect(async () => {
        expect(fakeMarxanRunner.progressCallbacks.length).toEqual(1);
        fakeMarxanRunner.progressCallbacks[0](progress);
      });
    },
    async thenScenarioIsRunning(jobData: JobData) {
      await waitForExpect(() => {
        expect(fakeMarxanRunner.run).toBeCalledTimes(1);
        expect(fakeMarxanRunner.run).toBeCalledWith(
          jobData.scenarioId,
          jobData.assets,
          expect.any(Function),
        );
      });
    },
    async thenJobIsKilled(job: Job) {
      await waitForExpect(async () => {
        expect(fixtures.fakeMarxanRunner.kill).toBeCalledTimes(1);
        expect(fixtures.fakeMarxanRunner.kill).toBeCalledWith(
          job.data.scenarioId,
        );
      });
    },
    async thenJobIsCompleted(job: Job) {
      await waitForExpect(async () => {
        expect(await job.isCompleted()).toBe(true);
      });
    },
    async thenProgressChangedInTheJob(job: Job, progress: number) {
      await waitForExpect(async () => {
        const jobId = job.id;
        assertDefined(jobId);
        expect((await queue.getJob(jobId))?.progress).toStrictEqual({
          fractionalProgress: progress,
        });
      });
    },
  };
}
