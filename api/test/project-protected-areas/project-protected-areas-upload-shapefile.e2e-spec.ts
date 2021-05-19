import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import { createWorld, World } from './steps/world';

let app: INestApplication;
let world: World;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
});

afterAll(async () => {
  await world.cleanup();
  await app.close();
});

describe(`when project is not available`, () => {
  it.skip(`should fail`, () => {
    // TODO once implemented
  });
});

describe(`when project is available`, () => {
  it(`submits shapefile to the system`, async () => {
    expect(
      (await world.WhenSubmittingShapefileFor(world.projectId)).status,
    ).toEqual(201);
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
