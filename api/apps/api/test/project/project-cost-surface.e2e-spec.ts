import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getProjectCostSurfaceFixtures } from './project-cost-surface.fixtures';
import { v4 } from 'uuid';

let fixtures: FixtureType<typeof getProjectCostSurfaceFixtures>;

describe('Cost Surface', () => {
  beforeEach(async () => {
    fixtures = await getProjectCostSurfaceFixtures();
  });
  describe('Default Cost Surface', () => {
    it(`should create a default Cost Surface`, async () => {
      const { projectId } = await fixtures.WhenCreatingAProject(
        'my awesome project',
      );
      await fixtures.ThenADefaultCostSurfaceWasCreated(projectId);
    });
  });
  describe('Getting Cost Surfaces for Project', () => {
    it(`should return the costSurface for the given id, along with its scenarioUsageCount`, async () => {
      // ARRANGE
      const projectId1 = await fixtures.GivenProject('someProject 1');
      const projectId2 = await fixtures.GivenProject('the REAL project');
      const default2 = await fixtures.GivenDefaultCostSurfaceForProject(
        projectId1,
      );
      const costSurface11 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId1,
        'costSurface 1 1',
      );
      const costSurface21 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId2,
        'costSurface 2 1',
      );
      const costSurface22 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId2,
        'costSurface 2 2',
      );
      await fixtures.GivenScenario(projectId1, costSurface11.id);
      await fixtures.GivenScenario(projectId1, costSurface11.id);
      await fixtures.GivenScenario(projectId2, costSurface21.id);
      const scenario22 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );
      const scenario23 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );
      const scenario24 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );

      // ACT
      const response = await fixtures.WhenGettingCostSurfaceForProject(
        projectId2,
        costSurface22.id,
      );

      // ASSERT
      await fixtures.ThenResponseHasCostSurface(response, {
        ...costSurface22,
        scenarioUsageCount: 3,
        scenarios: [scenario22, scenario23, scenario24],
      });
    });

    it(`should return all the Project's CostSurfaces along their corresponding scenarioUsageCount`, async () => {
      // ARRANGE
      const projectId1 = await fixtures.GivenProject('someProject 1');
      const projectId2 = await fixtures.GivenProject('the REAL project');
      const default1 = await fixtures.GivenDefaultCostSurfaceForProject(
        projectId1,
      );
      const default2 = await fixtures.GivenDefaultCostSurfaceForProject(
        projectId2,
      );
      const costSurface11 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId1,
        'costSurface 1 1',
      );
      const costSurface21 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId2,
        'costSurface 2 1',
      );
      const costSurface22 = await fixtures.GivenCostSurfaceMetadataForProject(
        projectId2,
        'costSurface 2 2',
      );
      const scenario11 = await fixtures.GivenScenario(
        projectId1,
        costSurface11.id,
      );
      const scenario12 = await fixtures.GivenScenario(
        projectId1,
        costSurface11.id,
      );
      const scenario21 = await fixtures.GivenScenario(
        projectId2,
        costSurface21.id,
      );
      const scenario22 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );
      const scenario23 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );
      const scenario24 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );
      const scenario25 = await fixtures.GivenScenario(
        projectId2,
        costSurface22.id,
      );

      const expectedResponse1 = [
        { ...default1, scenarioUsageCount: 0, scenarios: [] },
        {
          ...costSurface11,
          scenarioUsageCount: 2,
          scenarios: [scenario11, scenario12],
        },
      ];

      const expectedResponse2 = [
        { ...default2, scenarioUsageCount: 0, scenarios: [] },
        { ...costSurface21, scenarioUsageCount: 1, scenarios: [scenario21] },
        {
          ...costSurface22,
          scenarioUsageCount: 4,
          scenarios: [scenario22, scenario23, scenario24, scenario25],
        },
      ];

      // ACT
      const response1 = await fixtures.WhenGettingCostSurfacesForProject(
        projectId1,
      );
      const response2 = await fixtures.WhenGettingCostSurfacesForProject(
        projectId2,
      );

      // ASSERT
      await fixtures.ThenReponseHasCostSurfaceList(
        response1,
        expectedResponse1,
      );
      await fixtures.ThenReponseHasCostSurfaceList(
        response2,
        expectedResponse2,
      );
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
});
