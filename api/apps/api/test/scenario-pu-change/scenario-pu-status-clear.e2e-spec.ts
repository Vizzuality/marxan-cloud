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

beforeEach(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  queue = FakeQueue.getByName(updateQueueName);
  world = await createWorld(app, jwtToken);
});

describe(`when requesting to clear PUs statuses by kind`, () => {
  describe(`when desired PU ids are available`, () => {
    it(` when clearing locked in PUs triggers the job`, async () => {
      const result = await world.WhenClearingLockedInPUsStatusWithExisitingPu();
      const job = Object.values(queue.jobs)[0];
      expect(result.meta.started).toBeTruthy();
      HasExpectedJobDetailsWhenClearingLockedIn(job);
      HasRelevantJobName(job, world.scenarioId);
    });
    it(`when clearing locked out PUs triggers the job`, async () => {
      const result = await world.WhenClearingLockedOutPUsStatusWithExisitingPu();
      const job = Object.values(queue.jobs)[0];
      expect(result.meta.started).toBeTruthy();
      HasExpectedJobDetailsWhenClearingLockedOut(job);
      HasRelevantJobName(job, world.scenarioId);
    });
    it(`when clearing available PUs triggers the job`, async () => {
      const result = await world.WhenClearingAvailablePUsStatusWithExisitingPu();
      const job = Object.values(queue.jobs)[0];
      expect(result.meta.started).toBeTruthy();
      HasExpectedJobDetailsWhenClearingAvailable(job);
      HasRelevantJobName(job, world.scenarioId);
    });
  });
});
