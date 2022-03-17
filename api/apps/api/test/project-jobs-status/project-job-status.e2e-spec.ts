import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';

import { createWorld } from './world';
import { bootstrapApplication } from '../utils/api-application';

let app: INestApplication;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeEach(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
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
      isoDate: expect.any(String),
    },
    {
      data: null,
      kind: 'planningUnits',
      status: 'running',
      isoDate: expect.any(String),
    },
  ]);

  expect(result.body.data.attributes.scenarios).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: world.scenarioIdWithCostSurfaceFinished(),
        jobs: [
          {
            kind: 'costSurface',
            status: 'done',
            isoDate: expect.any(String),
          },
        ],
      }),
    ]),
  );

  expect(result.body.data.attributes.scenarios).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: world.scenarioIdWithPendingJob(),
        jobs: [
          {
            kind: 'costSurface',
            status: 'running',
            isoDate: expect.any(String),
          },
          {
            kind: 'planningUnitsInclusion',
            status: 'running',
            isoDate: expect.any(String),
          },
        ],
      }),
    ]),
  );
});
