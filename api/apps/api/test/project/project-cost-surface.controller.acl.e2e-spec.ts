import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { getProjectCostSurfaceControllerFixtures } from './project-cost-surface.controller.fixtures';

let fixtures: FixtureType<typeof getProjectCostSurfaceControllerFixtures>;

describe('Upload Cost Surface Shapefile', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceControllerFixtures();
  });

  it(`should not create CostSurface API entity if the user doesn't have permissions to edit the project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject', [
      ProjectRoles.project_viewer,
    ]);
    const shapefilePath = fixtures.GivenMockCostSurfaceShapefile();
    const costSurfaceName = 'costSuperCoolName';

    // ACT
    const response = await fixtures.WhenUploadingCostSurfaceShapefileForProject(
      projectId,
      costSurfaceName,
      shapefilePath,
    );

    // ASSERT
    await fixtures.ThenProjectNotEditableErrorWasReturned(response, projectId);
    await fixtures.ThenCostSurfaceWasNotCreated(costSurfaceName);
  });
});
