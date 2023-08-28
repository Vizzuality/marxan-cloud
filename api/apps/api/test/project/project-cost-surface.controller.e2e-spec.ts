import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getProjectCostSurfaceControllerFixtures } from './project-cost-surface.controller.fixtures';
import { v4 } from 'uuid';

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

describe('Upload Cost Surface Shapefile', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceControllerFixtures();
  });

  it(`should update the name properly`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'costSurfaceName',
    );
    const costSurfaceName = 'someNewName';

    // ACT
    const response = await fixtures.WhenUpdatingCostSurfaceForProject(
      projectId,
      costSurface.id,
      costSurfaceName,
    );

    // ASSERT
    await fixtures.ThenCostSurfaceAPIEntityWasProperlySaved(
      response,
      costSurfaceName,
    );
  });

  it(`should return error when the cost surface could not be found`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');

    // ACT
    const response = await fixtures.WhenUpdatingCostSurfaceForProject(
      projectId,
      v4(),
      'validName',
    );

    // ASSERT
    await fixtures.ThenNotFoundErrorWasReturned(response, projectId);
  });

  it(`should return error when the cost surface name is empty`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'anotherCostSurface',
    );

    // ACT
    const response = await fixtures.WhenUpdatingCostSurfaceForProject(
      projectId,
      costSurface.id,
      '',
    );

    // ASSERT
    await fixtures.ThenEmptyErrorWasReturned(response);
    await fixtures.ThenCostSurfaceAPIEntityWasNotUpdated(costSurface);
  });

  it(`should return error if name is already in use by another Cost Surface for the given Project`, async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const existingCostSurfaceName = 'existingCostSurface';
    await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      existingCostSurfaceName,
    );
    const costSurface2 = await fixtures.GivenCostSurfaceMetadataForProject(
      projectId,
      'anotherCostSurface',
    );

    // ACT
    const response = await fixtures.WhenUpdatingCostSurfaceForProject(
      projectId,
      costSurface2.id,
      existingCostSurfaceName,
    );

    // ASSERT
    await fixtures.ThenNameAlreadyExistsErrorWasReturned(
      response,
      costSurface2.id,
    );
    await fixtures.ThenCostSurfaceAPIEntityWasNotUpdated(costSurface2);
  });
});
