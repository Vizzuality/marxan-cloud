import { INestApplication } from '@nestjs/common';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { bootstrapApplication } from '../utils/api-application';
import { createWorld } from './steps/world';
import { v4 } from 'uuid';

let app: INestApplication;
let world: FixtureType<typeof createWorld>;

beforeEach(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
});

describe(`when scenario is not available`, () => {
  it(`should fail`, async () => {
    const result = await world.WhenSubmittingShapefileFor(v4());
    expect(result.status).toEqual(404);
  });
});

describe(`when project is available`, () => {
  it(`submits shapefile to the system`, async () => {
    const result = await world.WhenSubmittingShapefileFor(world.scenarioId);

    expect(result.status).toEqual(201);
    expect(result.body.meta.started).toBeTruthy();
    const job = world.GetSubmittedJobs()[0];
    expect(job).toMatchObject({
      name: `add-protected-area`,
      data: {
        scenarioId: world.scenarioId,
        projectId: world.projectId,
        shapefile: expect.anything(),
      },
    });
  });
});
