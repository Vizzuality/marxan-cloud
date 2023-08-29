import { bootstrapApplication } from '../../utils';
import { GivenProjectsPuExists } from '../../steps/given-projects-pu-exists';
import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { createWorld } from './steps/world';
import { InitialProjectCostInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { Job } from 'bullmq';

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
  it('no shapefile - initial cost', async () => {
    const data = {
      projectId,
      costSurfaceId,
    };
    const job = ({ data } as unknown) as Job<InitialProjectCostInput>;
    await world.WhenTheJobIsProcessed(job);
    await world.ThenTheInitialCostIsCalculated();
  });
});
