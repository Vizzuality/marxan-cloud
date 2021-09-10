import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import * as request from 'supertest';

import { createWorld } from './world';
import { bootstrapApplication } from '../utils/api-application';

let app: INestApplication;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
});

afterAll(async () => {
  await world?.cleanup();
  await app.close();
});

test(`job statuses for project`, async () => {
  await world.GivenCostSurfaceFinished();
  await world.GivenScenarioPlanningInclusionInProgress();
  await world.GivenGridSettingInProgress();

  const result = await world.WhenGettingProjectJobsStatus();

  expect(result.body.data.attributes.jobs).toEqual([
    {
      data: null,
      kind: 'grid',
      status: 'running',
    },
  ]);
  expect(result.body.data.attributes.scenarios).toEqual([
    {
      id: world.scenarioIdWithCostSurfaceFinished(),
      jobs: [
        {
          kind: 'costSurface',
          status: 'done',
        },
      ],
    },
    {
      id: world.scenarioIdWithPendingJob(),
      jobs: [
        {
          kind: 'planningUnitsInclusion',
          status: 'running',
        },
      ],
    },
  ]);
});
