import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { queueName } from '@marxan-api/modules/planning-units-protection-level/queue.name';
import { bootstrapApplication } from '../utils/api-application';
import { FakeQueue } from '../utils/queues';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';
import { v4 } from 'uuid';
import { tearDown } from '../utils/tear-down';

let app: INestApplication;
let queue: FakeQueue;
let commandBus: CommandBus;

beforeAll(async () => {
  app = await bootstrapApplication();
  queue = FakeQueue.getByName(queueName);
  commandBus = app.get(CommandBus);
});

afterAll(async () => {
  await app.close();
  await tearDown();
});

describe(`when requesting update`, () => {
  const scenarioId = v4();
  beforeEach(async () => {
    // could have the whole setup of seeds etc and shoot to API
    await commandBus.execute(
      new CalculatePlanningUnitsProtectionLevel(scenarioId),
    );
  });

  it(`processes the job`, async () => {
    // we can get the job manually, or beforehand register "processor"
    // up to us how we want to make the interface easy to use
    const jobs = Object.values(queue.jobs);
    expect(jobs.length).toEqual(1); // or other check with name regex or data details

    /**
     * That's it, for integration testing of API-side, we are fine just to do checks against `queue.jobs`.
     * We don't need to check if redis/queue works or anything on infrastructure.
     *
     *
     * If we would like to have a full-blown e2e test including GeoService and whole infrastructure, we would need real queues anyway
     * (and redis or in-memory redis) and decide when to run them (as heavy and potentially flaky ones).
     * And to run them on staging/prod environments (staging maybe after deployment, prod in regular intervals, for example daily)
     *
     * There are a few other options, as mocking bull/redis to go straight to worker within GeoService but they won't provide any real value
     * (what would it test? just additional effort on mocking, while it anyway tests very ends of each service
     *
     */

    // pretend we are a worker - see above; we may register workers and tell them return value how we want to
    // however for integration test (i.e. only API-side) this seems not necessary
    // another point is that the below may be not necessary unless we have some real "listeners" attached on job finish
  });
});
