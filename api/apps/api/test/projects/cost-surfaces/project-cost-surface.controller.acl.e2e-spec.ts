import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { getProjectCostSurfaceFixtures } from './project-cost-surface.fixtures';

let fixtures: FixtureType<typeof getProjectCostSurfaceFixtures>;

describe('Get Project Cost Surface', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
  });

  it(`should not return the CostSurface if the user doesn't have permissions to view the project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject', []);
    const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'costSurface',
    );
    await fixtures.GivenScenario(projectId, costSurface.id);
    await fixtures.GivenScenario(projectId, costSurface.id);
    // ACT
    const response = await fixtures.WhenGettingCostSurfaceForProject(
      projectId,
      costSurface.id,
    );

    // ASSERT
    await fixtures.ThenProjectNotViewableErrorWasReturned(response);
  });

  it(`should not return list of CostSurface if the user doesn't have permissions to view the project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject', []);
    const costSurface1 = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'costSurface 1',
    );
    const costSurface2 = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'costSurface 2',
    );
    await fixtures.GivenScenario(projectId, costSurface1.id);
    await fixtures.GivenScenario(projectId, costSurface1.id);
    await fixtures.GivenScenario(projectId, costSurface2.id);
    await fixtures.GivenScenario(projectId, costSurface2.id);
    await fixtures.GivenScenario(projectId, costSurface2.id);
    // ACT
    const response =
      await fixtures.WhenGettingCostSurfacesForProject(projectId);

    // ASSERT
    await fixtures.ThenProjectNotViewableErrorWasReturned(response);
  });
});

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

describe('Delete Cost Surface', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
  });

  it(`should not Delete CostSurface API entity if the user doesn't have permissions to edit the project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject', [
      ProjectRoles.project_viewer,
    ]);
    const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'something',
    );

    // ACT
    const response = await fixtures.WhenDeletingCostSurface(
      projectId,
      costSurface.id,
    );

    // ASSERT
    await fixtures.ThenProjectNotEditableErrorWasReturned(response, projectId);
    await fixtures.ThenCostSurfaceWasNotDeleted(costSurface.id);
  });
});
