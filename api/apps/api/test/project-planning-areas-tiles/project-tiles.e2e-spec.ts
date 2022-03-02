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

describe('PlanningUnitsTilesModule (e2e)', () => {
  test('When creating a regular project whe should be able to access to its planning area tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForProjectPlanningArea(
      world.regularProjectId,
    );
    world.ThenItContainsPlaningAreaTile(tile);
  });

  test('When creating a regular project whe should be able to access to its grid tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForProjectPlanningGrid(
      world.regularProjectId,
    );
    world.ThenItContainsGridTile(tile);
  });

  test('When creating a user upload planning Area we should have tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForCustomArea(
      world.customPlanningAreaId,
    );
    world.ThenItContainsPlaningAreaTile(tile);
  });

  test('When creating a user upload planning Area grid we should have tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForCustomPlanningGrid(
      world.customPlanningAreaGridId,
    );

    world.ThenItContainsGridTile(tile);
  });

  test('When creating a project with custom planning Area we should have tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForCustomArea(
      world.customProjectId,
    );

    world.ThenItContainsPlaningAreaTile(tile);
  });

  test('When creating a project with custom grid we should have tiles', async () => {
    const tile: Buffer = await world.WhenRequestingTileForProjectPlanningGrid(
      world.customProjectId,
    );

    world.ThenItContainsGridTile(tile);
  });
});
