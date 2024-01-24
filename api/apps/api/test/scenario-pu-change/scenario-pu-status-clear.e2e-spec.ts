import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { createWorld } from './steps/world';
import { FakeQueue } from '../utils/queues';
import { HasRelevantJobName } from './assertions/has-relevant-job-name';
import {
  HasExpectedJobDetailsWhenClearingAvailable,
  HasExpectedJobDetailsWhenClearingLockedIn,
  HasExpectedJobDetailsWhenClearingLockedOut,
} from './assertions/has-expected-job-details';
import { updateQueueName } from '@marxan-jobs/planning-unit-geometry';

let app: INestApplication;
let jwtToken: string;
let queue: FakeQueue;

let world: PromiseType<ReturnType<typeof createWorld>>;

describe(`when requesting to clear PUs statuses by kind`, () => {
  beforeEach(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);
    queue = FakeQueue.getByName(updateQueueName);
    world = await createWorld(app, jwtToken);
  });

  afterEach(async () => {
    queue.disposeFakeJobs();
  });

  it(`sending incorrect kind returns error`, async () => {
    const result =
      await world.WhenClearingAvailablePUsStatusWithIncorrectStatusType();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].meta.rawError.response.message[0]).toEqual(
      'kind must be a valid enum value',
    );
  });

  it(`clearing locked in PUs triggers the job`, async () => {
    const result = await world.WhenClearingLockedInPUsStatusWithExistingPu();
    const job = Object.values(queue.jobs)[0];
    expect(result.meta.started).toBeTruthy();
    expect(job.data.makeAvailable.pu.length).toBe(3);
    expect(job.data.exclude.pu.length).toBe(1);
    HasExpectedJobDetailsWhenClearingLockedIn(job);
    HasRelevantJobName(job, world.scenarioId);
  });

  it(`clearing locked out PUs triggers the job`, async () => {
    const result = await world.WhenClearingLockedOutPUsStatusWithExistingPu();
    const job = Object.values(queue.jobs)[0];
    expect(result.meta.started).toBeTruthy();
    expect(job.data.makeAvailable.pu.length).toBe(3);
    expect(job.data.include.pu.length).toBe(1);
    HasExpectedJobDetailsWhenClearingLockedOut(job);
    HasRelevantJobName(job, world.scenarioId);
  });

  it(`clearing available PUs triggers the job`, async () => {
    const result = await world.WhenClearingAvailablePUsStatusWithExistingPu();
    const job = Object.values(queue.jobs)[0];
    expect(result.meta.started).toBeTruthy();
    expect(job.data.include.pu.length).toBe(1);
    expect(job.data.exclude.pu.length).toBe(1);
    HasExpectedJobDetailsWhenClearingAvailable(job);
    HasRelevantJobName(job, world.scenarioId);
  });
});
