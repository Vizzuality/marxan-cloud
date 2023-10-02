import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getProjectCostSurfaceFixtures } from './project-cost-surface.fixtures';
import { v4 } from 'uuid';

let fixtures: FixtureType<typeof getProjectCostSurfaceFixtures>;

describe('Cost Surface', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
  });

  afterEach(async () => {
    await fixtures.cleanup();
  });

  describe('Default Cost Surface', () => {
    it(`should create a default Cost Surface`, async () => {
      const { projectId } = await fixtures.WhenCreatingAProject(
        'my awesome project',
      );
      await fixtures.ThenADefaultCostSurfaceWasCreated(projectId);
    });
  });
  describe('Upload Cost Surface Shapefile', () => {
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
  describe('Update Cost Surface', () => {
    it(`should update the name properly`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');
      const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId,
        'costSurfaceName',
      );
      const costSurfaceName = 'someNewName';

      // ACT
      await fixtures.WhenUpdatingCostSurfaceForProject(
        projectId,
        costSurface.id,
        costSurfaceName,
      );

      // ASSERT
      await fixtures.ThenCostSurfaceAPIEntityWasProperlySaved(costSurfaceName);
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

  describe('Delete Cost Surface', () => {
    it(`should delete the CostSurface properly and emit event`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');
      const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId,
        'costSurfaceName',
      );

      // ACT
      await fixtures.WhenDeletingCostSurface(projectId, costSurface.id);

      // ASSERT
      await fixtures.ThenCostSurfaceWasDeleted(costSurface.id);
      await fixtures.ThenCostSurfaceDeletedEventWasEmitted(costSurface.id);
      await fixtures.ThenUnusedResourceJobWasSent(costSurface.id);
    });

    it(`should return error when the cost surface could not be found`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');

      // ACT
      const response = await fixtures.WhenDeletingCostSurface(projectId, v4());

      // ASSERT
      await fixtures.ThenNotFoundErrorWasReturned(response, projectId);
    });

    it(`should return error when the CostSurface is still in use by Scenarios`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');
      const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId,
        'anotherCostSurface',
      );
      await fixtures.GivenScenario(projectId, costSurface.id, 'something');

      // ACT
      const response = await fixtures.WhenDeletingCostSurface(
        projectId,
        costSurface.id,
      );

      // ASSERT
      await fixtures.ThenCostSurfaceWasNotDeleted(costSurface.id);
      await fixtures.ThenCostSurfaceStillInUseErrorWasReturned(
        response,
        costSurface.id,
      );
    });

    it(`should return error if the CostSurface is the Project's default`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');
      const costSurface = await fixtures.GivenDefaultCostSurfaceForProject(
        projectId,
      );

      // ACT
      const response = await fixtures.WhenDeletingCostSurface(
        projectId,
        costSurface.id,
      );

      // ASSERT
      await fixtures.ThenCostSurfaceWasNotDeleted(costSurface.id);
      await fixtures.ThenCostSurfaceDefaultCannotBeDeletedErrorWasReturned(
        response,
        costSurface.id,
      );
    });
  });

  describe('Get Cost Surface Range', () => {
    it(`should return the range of the cost surface`, async () => {
      // ARRANGE
      const projectId = await fixtures.GivenProject('someProject');
      const costSurface = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId,
        'costSurfaceName',
      );

      // ACT
      const response = await fixtures.WhenGettingCostSurfaceRange(
        costSurface.id,
        projectId,
      );

      // ASSERT
      await fixtures.ThenCostSurfaceRangeWasReturned(response);
    });
  });
});
