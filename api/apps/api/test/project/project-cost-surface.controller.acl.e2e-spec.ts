import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { getProjectCostSurfaceFixtures } from './project-cost-surface.fixtures';

let fixtures: FixtureType<typeof getProjectCostSurfaceFixtures>;

describe('Upload Cost Surface Shapefile', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
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

describe('Upload Cost Surface Shapefile', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
  });

  it(`should not update CostSurface API entity if the user doesn't have permissions to edit the project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject', [
      ProjectRoles.project_viewer,
    ]);
    const originalName = 'costSuperCoolName';
    const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      originalName,
    );

    // ACT
    const response = await fixtures.WhenUpdatingCostSurfaceForProject(
      projectId,
      costSurface.id,
      'someNewName',
    );

    // ASSERT
    await fixtures.ThenProjectNotEditableErrorWasReturned(response, projectId);
    await fixtures.ThenCostSurfaceAPIEntityWasNotUpdated(costSurface);
  });
});
