import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { WhenRequestingStatus } from './steps/WhenRequestingStatus';

import { createWorld, World } from './steps/world';
import { FakeQueue } from '../utils/queues';
import { QueueToken } from '../../src/modules/queue/queue.tokens';
import { ExpectBadRequest } from './assertions/expect-bad-request';
import { HasRelevantJobName } from './assertions/has-relevant-job-name';
import { HasExpectedJobDetails } from './assertions/has-expected-job-details';

let app: INestApplication;
let jwtToken: string;
let scenarioId: string;
let queue: FakeQueue;

let world: World;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  world = await createWorld(app);
  queue = app.get(QueueToken);
});

afterAll(async () => {
  await world.cleanup();
  await app.close();
});

describe(`when requesting to change inclusive options`, () => {
  it(`denies to request with valid input`, async () => {
    ExpectBadRequest(
      await world.WhenChangingPlanningUnitInclusivityForRandomPu(jwtToken),
    );
  });

  describe(`when desired PU ids are available`, () => {
    it(`triggers the job`, async () => {
      await world.WhenChangingPlanningUnitInclusivityWithExistingPu(jwtToken);
      const job = Object.values(queue.jobs)[0];
      HasExpectedJobDetails(job);
      HasRelevantJobName(job, world.scenarioId);
    });
  });
});

describe.skip(`when requesting status of change`, () => {
  let outcome: unknown;

  beforeAll(async () => {
    outcome = await WhenRequestingStatus(app, scenarioId, jwtToken);
  });

  it(`returns relevant status`, async () => {
    expect(outcome).toEqual({
      status: 'running',
    });
  });
});
