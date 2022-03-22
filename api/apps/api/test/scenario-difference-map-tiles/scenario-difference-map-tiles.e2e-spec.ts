import { PromiseType } from 'utility-types';
import { INestApplication, Logger } from '@nestjs/common';

import { bootstrapApplication } from '../utils/api-application';
import { createWorld } from './world';

let app: INestApplication;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
});

afterAll(async () => {
  await world.cleanup();
  await app.close();
});

describe.skip('PlanningUnitsTilesModule (e2e)', () => {
  test('When comparing 2 scenarios owner by the user within the same project we should be able to see the tiles', async () => {
    world.GivenScenarioAPuDataExists();
    world.GivenScenarioBPuDataExists();
    const tile: Buffer = await world.WhenRequestingTileToCompareScenarios(
      world.scenarioIdA,
      world.scenarioIdB,
    );
    world.ThenItContainsScenarioCompareTile(tile);
  });
});
