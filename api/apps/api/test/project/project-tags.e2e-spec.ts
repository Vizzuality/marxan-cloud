import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { getProjectTagsFixtures } from './project-tags.fixtures';

let fixtures: FixtureType<typeof getProjectTagsFixtures>;

describe('Projects Tag DELETE (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return Error if Project not found', async () => {
    //ARRANGE
    const randomProjectId = v4();

    // ACT
    const response = await fixtures.WhenDeletingAProjectTag(
      randomProjectId,
      'someTag',
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    fixtures.ThenProjectNotFoundErrorWasReturned(response, randomProjectId);
  });

  test('should delete all feature tag rows, even the capitalization equivalent ones, for the given Project', async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const featureId1 = await fixtures.GivenFeatureOnProject(projectId, 'f1');
    const featureId2 = await fixtures.GivenFeatureOnProject(projectId, 'f2');
    const featureId3 = await fixtures.GivenFeatureOnProject(projectId, 'f3');
    await fixtures.GivenTagOnFeature(projectId, featureId1, 'someTAG');
    await fixtures.GivenTagOnFeature(projectId, featureId2, 'sOmetAg');
    await fixtures.GivenTagOnFeature(projectId, featureId3, 'differentTag');

    //ACT
    const response = await fixtures.WhenDeletingAProjectTag(
      projectId,
      'sometag',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenProjectDoesNotHaveTag(projectId, 'sometag');
    await fixtures.ThenFeatureHasTag(projectId, featureId3, 'differentTag');
  });
});
