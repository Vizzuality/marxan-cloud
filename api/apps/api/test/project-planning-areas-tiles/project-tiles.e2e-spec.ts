import { PromiseType } from 'utility-types';
import { INestApplication } from '@nestjs/common';

import { bootstrapApplication } from '../utils/api-application';
import { createWorld } from './world';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

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

    test('When creating a user upload planning Area we should have tiles', async () => {
      const PlanningAreaResponse = await world.WhenCreatingCustomPlanningArea();
      const planningAreaId: string = await world.GivenPlanningAreaIsCreated(PlanningAreaResponse);
      const tile: Buffer = await  world.WhenRequestingTileForCustomArea(planningAreaId);
      world.ThenItContainsPlaningAreaTile(tile, {projectId: planningAreaId});
    });

    test('When creating a project with custom planning Area we should have tiles', async () => {
      const PlanningAreaResponse = await world.WhenCreatingCustomPlanningArea();
      const planningAreaId: string = await world.GivenPlanningAreaIsCreated(PlanningAreaResponse);
      const projectId = await world.GivenProjectWithCustomAreas(planningAreaId);
      const tile: Buffer = await  world.WhenRequestingTileForCustomArea(projectId);
      world.ThenItContainsPlaningAreaTile(tile, {projectId: projectId});
    });

    test('When creating a user upload planning Area grid we should have tiles', async () => {
      const PlanningAreaResponse = await world.WhenCreatingCustomPlanningArea();
      const planningAreaGridId: string = await world.GivenPlanningAreaIsCreated(PlanningAreaResponse);
      const tile: Buffer = await  world.WhenRequestingTileForCustomPlanningGrid(planningAreaGridId);
      world.ThenItContainsGridTile(tile, {projectId: planningAreaGridId});
    });

    test('When creating a project with custom grid we should have tiles', async () => {
      const PlanningAreaResponse = await world.WhenCreatingCustomPlanningArea();
      const planningAreaGridId: string = await world.GivenPlanningAreaIsCreated(PlanningAreaResponse);
      const projectId = await world.GivenProjectWithCustomAreas(planningAreaGridId, PlanningUnitGridShape.FromShapefile);
      const tile: Buffer = await  world.WhenRequestingTileForProjectPlanningGrid(projectId);

      world.ThenItContainsGridTile(tile, {projectId: projectId});
    });

    test('When creating a regular project whe should be able to access to its planning area', async () => {
      const projectId = await world.GivenProjectWithAdminAreas();
      const tile: Buffer = await  world.WhenRequestingTileForCustomArea(projectId);
      world.ThenItContainsPlaningAreaTile(tile, {projectId: projectId});
    });

    test('When creating a user upload planning Area grid we should see the tiles', async () => {
      const projectId = await world.GivenProjectWithAdminAreas();
      const tile: Buffer = await  world.WhenRequestingTileForCustomArea(projectId);
      world.ThenItContainsPlaningAreaTile(tile, {projectId: projectId});
    });

});
