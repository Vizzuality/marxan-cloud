import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import { createWorld, World } from './steps/world';
import { tearDown } from '../utils/tear-down';
import { v4 } from 'uuid';

let app: INestApplication;
let world: World;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
});

afterAll(async () => {
  await world.cleanup();
  await app.close();
  await tearDown();
});

describe(`when project is not available`, () => {
  it(`should fail`, async () => {
    expect((await world.WhenSubmittingShapefileFor(v4())).status).toEqual(404);
  });
});

describe(`when project is available`, () => {
  it(`submits shapefile to the system`, async () => {
    const result = await world.WhenSubmittingShapefileFor(world.projectId);

    expect(result.status).toEqual(201);
    expect(result.body.meta.started).toBeTruthy();
    const job = world.GetSubmittedJobs()[0];
    expect(job).toMatchObject({
      name: `protected-areas-for-${world.projectId}`,
      data: {
        projectId: world.projectId,
        file: expect.anything(),
      },
    });
  });
});
