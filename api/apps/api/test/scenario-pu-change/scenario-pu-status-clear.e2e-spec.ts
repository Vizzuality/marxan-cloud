import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';

import { WhenRequestingStatus } from './steps/WhenRequestingStatus';
import { createWorld } from './steps/world';
import { FakeQueue } from '../utils/queues';
import { ExpectBadRequest } from './assertions/expect-bad-request';
import { HasRelevantJobName } from './assertions/has-relevant-job-name';
import {
  HasExpectedJobDetails,
  HasExpectedJobDetailsWhenClearing,
} from './assertions/has-expected-job-details';
import { updateQueueName } from '@marxan-jobs/planning-unit-geometry';

let app: INestApplication;
let jwtToken: string;
let queue: FakeQueue;

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeEach(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  world = await createWorld(app, jwtToken);
  queue = FakeQueue.getByName(updateQueueName);
});

describe(`when requesting to clear PUs statuses by kind`, () => {
  describe(`when desired PU ids are available`, () => {
    it(`triggers the job`, async () => {
      const result = await world.WhenClearingPuStatusesByKindWithExisitingPu();
      const job = Object.values(queue.jobs)[0];
      expect(result.meta.started).toBeTruthy();
      HasExpectedJobDetailsWhenClearing(job);
      HasRelevantJobName(job, world.scenarioId);
    });
  });
});
