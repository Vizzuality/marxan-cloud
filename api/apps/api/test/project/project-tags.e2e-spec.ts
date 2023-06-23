import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { getProjectTagsFixtures } from './project-tags.fixtures';

let fixtures: FixtureType<typeof getProjectTagsFixtures>;

describe('Projects Tag GET (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if Project not found', async () => {
    //ARRANGE
    const randomProjectId = v4();

    // ACT
    const response = await fixtures.WhenGettingProjectTags(
      randomProjectId,
      'someTag',
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    fixtures.ThenProjectNotFoundErrorWasReturned(response, randomProjectId);
  });

  test('should return all distinct tags that partially match the provided tag for the given project, ascending by default, and other sorts ignored', async () => {
    const projectId1 = await fixtures.GivenProject('someProject');
    const featureId1 = await fixtures.GivenFeatureOnProject(projectId1, 'f1');
    const featureId2 = await fixtures.GivenFeatureOnProject(projectId1, 'f2');

    await fixtures.GivenTagOnFeature(projectId1, featureId1, 'TAG Overground');
    await fixtures.GivenTagOnFeature(projectId1, featureId2, 'TAG Underground');

    // ACT
    const response = await fixtures.WhenGettingProjectTags(
      projectId1,
      'ground',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual(['TAG Overground', 'TAG Underground']);
  });

  test('should return all distinct tags that partially match the provided tag for the given project, with the order provided', async () => {
    const projectId1 = await fixtures.GivenProject('someProject');
    const projectId2 = await fixtures.GivenProject('someProject2');
    const featureId11 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name11',
    );
    const featureId12 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name12',
    );
    const featureId13 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name13',
    );
    const featureId14 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name14',
    );
    const featureId21 = await fixtures.GivenFeatureOnProject(
      projectId2,
      'name21',
    );

    await fixtures.GivenTagOnFeature(projectId1, featureId11, 'OneRepeatedTag');
    await fixtures.GivenTagOnFeature(projectId1, featureId12, 'OneRepeatedTag');
    await fixtures.GivenTagOnFeature(projectId1, featureId13, 'AnotherTag');
    await fixtures.GivenTagOnFeature(
      projectId1,
      featureId14,
      'another-repeated-tag',
    );
    await fixtures.GivenTagOnFeature(
      projectId2,
      featureId21,
      'AnotherProjectTag',
    );

    // ACT
    const response1 = await fixtures.WhenGettingProjectTags(
      projectId1,
      'repeated',
      '-tag',
    );
    const response2 = await fixtures.WhenGettingProjectTags(
      projectId1,
      'ANOTHER',
      'tag',
    );

    //ASSERT
    expect(response1.status).toBe(HttpStatus.OK);
    expect(response1.body.data).toEqual([
      'another-repeated-tag',
      'OneRepeatedTag',
    ]);
    expect(response2.status).toBe(HttpStatus.OK);
    expect(response2.body.data).toEqual(['AnotherTag', 'another-repeated-tag']);
  });

  test('should return all available distinct tags for the given project if no tag query param is provided', async () => {
    const projectId1 = await fixtures.GivenProject('someProject');
    const featureId11 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name11',
    );
    const featureId12 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name12',
    );
    const featureId13 = await fixtures.GivenFeatureOnProject(
      projectId1,
      'name13',
    );
    await fixtures.GivenTagOnFeature(projectId1, featureId11, 'OneRepeatedTag');
    await fixtures.GivenTagOnFeature(projectId1, featureId12, 'OneRepeatedTag');
    await fixtures.GivenTagOnFeature(projectId1, featureId13, 'AnotherTag');

    // ACT
    const response = await fixtures.WhenGettingProjectTags(
      projectId1,
      undefined,
      'tag',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual(['AnotherTag', 'OneRepeatedTag']);
  });
});

describe('Projects Tag PATCH (e2e)', () => {
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
    const response = await fixtures.WhenPatchingAProjectTag(
      randomProjectId,
      'irrelevant',
      'irrelevant',
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    fixtures.ThenProjectNotFoundErrorWasReturned(response, randomProjectId);
  });

  test('should return error if tag fields are not valid', async () => {
    // ARRANGE
    const oldTag = 'oldTag';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(projectId, 'f');
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT / ASSERT
    const response1 = await fixtures.WhenPatchingAProjectTag(
      projectId,
      'INVALID TAG with\r\nnewline',
      `something`,
    );
    expect(response1.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenInvalidTagErrorWasReturned(response1);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);

    const response2 = await fixtures.WhenPatchingAProjectTag(
      projectId,
      'something',
      `t${'a'.repeat(tagMaxlength + 1)}g`,
    );
    expect(response2.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenMaxLengthErrorWasReturned(response2);
  });

  test('should update all feature tag rows that match exactly with the tag to be updated, for the given Project', async () => {
    // ARRANGE
    const projectId1 = await fixtures.GivenProject('someProject');
    const projectId2 = await fixtures.GivenProject('someProject2');
    const featureId11 = await fixtures.GivenFeatureOnProject(projectId1, 'f11');
    const featureId12 = await fixtures.GivenFeatureOnProject(projectId1, 'f12');
    const featureId13 = await fixtures.GivenFeatureOnProject(projectId1, 'f13');
    const featureId14 = await fixtures.GivenFeatureOnProject(projectId1, 'f14');
    const featureId21 = await fixtures.GivenFeatureOnProject(projectId2, 'f21');

    await fixtures.GivenTagOnFeature(projectId1, featureId11, 'toBeUpdated');
    await fixtures.GivenTagOnFeature(projectId1, featureId12, 'notupdated');
    await fixtures.GivenTagOnFeature(projectId1, featureId13, 'NOTupdated');
    await fixtures.GivenTagOnFeature(projectId1, featureId14, 'TOBEUPDATED');
    await fixtures.GivenTagOnFeature(projectId2, featureId21, 'toBeUpdated');

    //ACT
    const response = await fixtures.WhenPatchingAProjectTag(
      projectId1,
      'toBeUpdated',
      'updatedTAG',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId1, featureId12, 'notupdated');
    await fixtures.ThenFeatureHasTag(projectId1, featureId13, 'notupdated');
    await fixtures.ThenFeatureHasTag(projectId2, featureId21, 'toBeUpdated');

    await fixtures.ThenFeatureHasTag(projectId1, featureId11, 'updatedTAG');
    await fixtures.ThenFeatureHasTag(projectId1, featureId14, 'updatedTAG');
  });
});

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
