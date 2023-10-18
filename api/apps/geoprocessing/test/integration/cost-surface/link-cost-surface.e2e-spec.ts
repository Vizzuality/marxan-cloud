import { bootstrapApplication } from '../../utils';
import { v4 } from 'uuid';
import { createWorld } from './steps/world';

describe('should process cost surface', () => {
  let world: any;
  beforeAll(async () => {
    const app = await bootstrapApplication();
    world = await createWorld(app);
  });
  it('should link the cost surface data to the scenario data', async () => {
    const scenarioId = v4();
    const projectId = v4();
    await world.GivenScenarioPuDataExists(projectId, scenarioId);
    await world.GivenPuCostDataExists();
    const costSurfaceId = v4();
    await world.GivenCostSurfacePuDataExists(costSurfaceId);

    const linkCostSurfaceJob = world.getLinkCostSurfaceToScenarioJob(
      scenarioId,
      costSurfaceId,
    );
    await world.WhenTheCostSurfaceLinkingJobIsProcessed(linkCostSurfaceJob);
    await world.ThenTheScenarioPuCostDataIsUpdated(costSurfaceId, 42);
  });
});
