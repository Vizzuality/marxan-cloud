import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../../utils/geo-application';
import { ProtectedAreaProcessor } from '../../../src/modules/protected-areas/worker/protected-area-processor';
import { createWorld } from './steps/shapefile-for-wdpa-world';
import { shapes } from './steps/shapes';

let app: INestApplication;
let sut: ProtectedAreaProcessor;
let world: ReturnType<typeof createWorld>;

const validShape = shapes.valid();

beforeAll(async () => {
  app = await bootstrapApplication();
  world = createWorld(app, validShape);
  sut = app.get(ProtectedAreaProcessor);
});

describe(`when worker processes the job for known project`, () => {
  beforeAll(async () => {
    await world.GivenWdpaForProjectAlreadyExists(`old-shape-name`);
    await sut.process(world.WhenNewShapefileIsSubmitted(validShape.filename));
    await delay(2000);
  }, 10000);

  it(`pushes new geometries`, async () => {
    expect(await world.ThenNewEntriesArePublished(validShape.filename)).toEqual(
      true,
    );
  });

  it(`removes previous geometries assigned to project`, async () => {
    expect(await world.ThenOldEntriesAreRemoved(`old-shape-name`)).toEqual(
      true,
    );
  });
});

describe(`when providing name in job input`, () => {
  it(`uses provided name as protected area's "fullName"`, async () => {
    await sut.process(world.WhenShapefileAndNameAreSubmitted('custom name'));
    await delay(2000);
    expect(await world.ThenNewEntriesArePublished('custom name')).toEqual(true);
  });
});

afterAll(async () => {
  await world.cleanup();
  await app?.close();
}, 500 * 1000);

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
