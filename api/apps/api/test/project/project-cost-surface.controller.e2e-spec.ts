import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getProjectCostSurfaceControllerFixtures } from './project-cost-surface.controller.fixtures';

let fixtures: FixtureType<typeof getProjectCostSurfaceControllerFixtures>;

describe('Upload Cost Surface Shapefile', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceControllerFixtures();
  });

  it(`should create CostSurface API entity with the provided name`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const shapefilePath = fixtures.GivenMockCostSurfaceShapefile();
    const costSurfaceName = 'costSuperCoolName';

    // ACT
    await fixtures.WhenUploadingCostSurfaceShapefileForProject(
      projectId,
      costSurfaceName,
      shapefilePath,
    );

    // ASSERT
    await fixtures.ThenCostSurfaceAPIEntityWasProperlySaved(costSurfaceName);
  });

  it(`should return error when the cost surface name is empty`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const shapefilePath = fixtures.GivenMockCostSurfaceShapefile();

    // ACT
    const response = await fixtures.WhenUploadingCostSurfaceShapefileForProject(
      projectId,
      '',
      shapefilePath,
    );

    // ASSERT
    await fixtures.ThenEmptyErrorWasReturned(response);
  });
});
