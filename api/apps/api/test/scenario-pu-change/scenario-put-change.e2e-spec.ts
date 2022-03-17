import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';

import { WhenRequestingStatus } from './steps/WhenRequestingStatus';
import { createWorld } from './steps/world';
import { FakeQueue } from '../utils/queues';
import { ExpectBadRequest } from './assertions/expect-bad-request';
import { HasRelevantJobName } from './assertions/has-relevant-job-name';
import { HasExpectedJobDetails } from './assertions/has-expected-job-details';
import { tearDown } from '../utils/tear-down';
import { updateQueueName } from '@marxan-jobs/planning-unit-geometry';

let app: INestApplication;
let jwtToken: string;
let queue: FakeQueue;

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  queue = FakeQueue.getByName(updateQueueName);
});

beforeEach(async () => {
  world = await createWorld(app, jwtToken);
});

afterEach(async () => {
  await world.cleanup();
});

afterAll(async () => {
  await app.close();
  await tearDown();
});

describe(`when requesting to change inclusive options`, () => {
  it(`denies to request with valid input`, async () => {
    ExpectBadRequest(
      await world.WhenChangingPlanningUnitInclusivityForRandomPu(),
    );
  });

  describe(`when desired PU ids are available`, () => {
    it(`triggers the job`, async () => {
      const result = await world.WhenChangingPlanningUnitInclusivityWithExistingPu();
      const job = Object.values(queue.jobs)[0];
      expect(result.meta.started).toBeTruthy();
      HasExpectedJobDetails(job);
      HasRelevantJobName(job, world.scenarioId);
    });
  });
});

describe.skip(`when requesting status of change`, () => {
  let outcome: unknown;

  beforeAll(async () => {
    outcome = await WhenRequestingStatus(app, world.scenarioId, jwtToken);
  });

  it(`returns relevant status`, async () => {
    expect(outcome).toEqual({
      status: 'running',
    });
  });
});
