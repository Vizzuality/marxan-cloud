import { SurfaceCostProcessor } from '@marxan-geoprocessing/modules/surface-cost/application/surface-cost-processor';
import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { bootstrapApplication, delay } from '../../../utils';
import { createWorld } from './steps/world';

let app: INestApplication;
let sut: SurfaceCostProcessor;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
  sut = app.get(SurfaceCostProcessor);
});

afterAll(async () => {
  await world.cleanup();
  await app?.close();
}, 500 * 1000);

describe(`given scenario has some planning units`, () => {
  beforeEach(async () => {
    await world.GivenPuCostDataExists();
  });
  it(`updates cost surface`, async () => {
    await sut.process(world.getShapefileWithCost());
    await delay(1000);
    await world.ThenCostIsUpdated();
  }, 10000);
});
