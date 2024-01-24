import { bootstrapApplication } from '../../utils';
import { GivenProjectsPuExists } from '../../steps/given-projects-pu-exists';
import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { createWorld } from './steps/world';

describe('should process cost surface', () => {
  const projectId: string = v4();
  const costSurfaceId: string = v4();
  let geoEntityManager: EntityManager;
  let world: any;
  beforeAll(async () => {
    const app = await bootstrapApplication();
    geoEntityManager = app.get(
      getEntityManagerToken(geoprocessingConnections.default),
    );
    world = await createWorld(app);
  });
  beforeEach(async () => {
    await GivenProjectsPuExists(geoEntityManager, projectId);
  });
  it('from shapefile', async () => {
    const shapefileJobInputJob = await world.getShapefileForProjectWithCost(
      projectId,
      costSurfaceId,
    );
    await world.WhenTheJobIsProcessed(shapefileJobInputJob);
    await world.ThenTheProjectCostSurfaceIsUpdated();
  });
});
