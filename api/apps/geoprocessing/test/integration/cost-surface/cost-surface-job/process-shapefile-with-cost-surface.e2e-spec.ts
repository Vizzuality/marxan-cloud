import { CostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/cost-surface-processor.service';
import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { bootstrapApplication, delay } from '../../../utils';
import { createWorld } from './steps/world';

let app: INestApplication;
let sut: CostSurfaceProcessor;
let world: PromiseType<ReturnType<typeof createWorld>>;

describe(`given scenario has some planning units`, () => {
  beforeAll(async () => {
    app = await bootstrapApplication();
    sut = app.get(CostSurfaceProcessor);
  });
  beforeEach(async () => {
    world = await createWorld(app);
    await world.GivenPuCostDataExists();
  });

  afterAll(async () => {
    await world.cleanup();
    await app?.close();
  }, 500 * 1000);
  it(`updates cost surface`, async () => {
    await sut.process(world.getShapefileWithCost());
    await delay(1000);
    await world.ThenCostIsUpdated();
  }, 10000);
});
