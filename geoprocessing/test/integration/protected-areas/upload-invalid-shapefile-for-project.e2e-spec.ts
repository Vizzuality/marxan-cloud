import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../../utils/geo-application';
import { ProtectedAreaProcessor } from '../../../src/modules/protected-areas/worker/protected-area-processor';
import { createWorld } from './steps/shapefile-for-wdpa-world';
import { file } from './steps/invalid-shapefile';

let app: INestApplication;
let sut: ProtectedAreaProcessor;
let world: ReturnType<typeof createWorld>;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = createWorld(app, file);
  sut = app.get(ProtectedAreaProcessor);
});

describe(`when worker processes the job for known project`, () => {
  beforeAll(async () => {
    await world.GivenWdpaForProjectAlreadyExists(`old-shape-name`);
    await sut.process(world.WhenNewShapefileIsSubmitted(`new-shape-name`));
    await delay(2000);
  }, 10000);

  it(`does not push new geometries`, async () => {
    expect(await world.ThenNewEntriesAreNotPublished(`new-shape-name`)).toEqual(
      true,
    );
  });

  it(`keeps previous geometries assigned to project`, async () => {
    expect(await world.ThenOldEntriesAreNotRemoved(`old-shape-name`)).toEqual(
      true,
    );
  });
});

afterAll(async () => {
  await world.cleanup();
  await app?.close();
}, 500 * 1000);

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
