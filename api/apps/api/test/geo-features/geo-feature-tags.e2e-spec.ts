import { HttpStatus } from '@nestjs/common';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';
import { getGeoFeatureTagsFixtures } from './geo-feature-tags.fixtures';
import { tagMaxlength } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';

let fixtures: FixtureType<typeof getGeoFeatureTagsFixtures>;

describe('GeoFeatureTag PATCH (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getGeoFeatureTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if feature is not found or not related to project', async () => {
    //ARRANGE
    const randomProjectId = v4();
    const inexistentFeatureId = v4();
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'someFeat',
    );

    // ACT
    const responseNotFound = await fixtures.WhenPatchingAGeoFeatureTag(
      v4(),
      inexistentFeatureId,
      'sometag',
    );
    const responseNotRelated = await fixtures.WhenPatchingAGeoFeatureTag(
      randomProjectId,
      featureId,
      'sometag',
    );

    //ASSERT
    expect(responseNotFound.status).toBe(HttpStatus.NOT_FOUND);
    fixtures.ThenFeatureNotFoundWithinProjectErrorWasReturned(
      responseNotRelated,
      featureId,
      randomProjectId,
    );
    expect(responseNotRelated.status).toBe(HttpStatus.NOT_FOUND);
    fixtures.ThenFeatureNotFoundWithinProjectErrorWasReturned(
      responseNotRelated,
      featureId,
      randomProjectId,
    );
  });

  test('should return error if the tag is empty', async () => {
    //ARRANGE
    const oldTag = 'oldTag';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      '',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenEmptyErrorWasReturned(response);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should return error if the tag is longer than the maximum tag length', async () => {
    //ARRANGE
    const oldTag = 'oldTag';
    const newTag = `t${'a'.repeat(tagMaxlength + 1)}g`;
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenMaxLengthErrorWasReturned(response);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should return error if the tag is invalid', async () => {
    // ARRANGE
    const oldTag = 'oldTag';
    const newTag1 = 'INVALID TAG with\r\nnewline';
    const newTag2 = 'INVALID TAG with\rnewline';
    const newTag3 = 'INVALID TAG with\nnewline';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT / ASSERT
    const response1 = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag1,
    );
    expect(response1.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenInvalidTagErrorWasReturned(response1);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);

    const response2 = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag2,
    );
    expect(response2.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenInvalidTagErrorWasReturned(response2);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);

    const response3 = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag3,
    );
    expect(response3.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenInvalidTagErrorWasReturned(response2);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should update the tag of the geo feature with the provided one for the given project', async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'someFeature',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, 'oldTag');
    const newTag = 'valid-tag🙂';

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, newTag);
  });

  test('should tag the feature properly, even if the feature does not previously have a tag', async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'someFeature',
    );
    const newTag = 'valid-tag🙂';

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, newTag);
  });

  test('should update with a previous existing equivalent tag instead of the provided one, if, on the same project, there is an existing equivalent tag with different capitalization', async () => {
    //ARRANGE
    const newTag = 'SoME-taG';
    const equivalentTag = newTag.toLowerCase();
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'toBeTagged',
    );
    const featureWithEquivalentTagId = await fixtures.GivenFeatureOnProject(
      projectId,
      'featureEquivalentTag',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, 'oldTag');
    await fixtures.GivenTagOnFeature(
      projectId,
      featureWithEquivalentTagId,
      equivalentTag,
    );

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, equivalentTag);
  });
});
