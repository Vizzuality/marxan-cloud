import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './upload-feature.fixtures';
import { tagMaxlength } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';
import { HttpStatus } from '@nestjs/common';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`custom feature upload`, async () => {
  const name = 'someFeature';
  const description = 'someDescrip';
  await fixtures.GivenProjectPusWithGeometryForProject();

  const result = await fixtures.WhenUploadingCustomFeature(name, description);

  await fixtures.ThenGeoFeaturesAreCreated(result, name, description);
  await fixtures.ThenFeatureAmountsFromShapefileAreCreated(name);
});

test(`if tagging info is included in DTO but invalid, then error is returned and everything is rolled back`, async () => {
  // ARRANGE
  const name = 'invalidFeat';
  const description = 'invalidDesc';
  const invalidTag1 = 'some\ntag';
  const invalidTag2 = `t${'a'.repeat(tagMaxlength + 1)}g`;
  await fixtures.GivenProjectPusWithGeometryForProject();

  // ACT / ASSERT
  const result1 = await fixtures.WhenUploadingCustomFeature(
    name,
    description,
    invalidTag1,
  );
  expect(result1.status).toBe(HttpStatus.BAD_REQUEST);
  fixtures.ThenInvalidTagErrorWasReturned(result1);
  await fixtures.ThenNoGeoFeatureIsCreated(result1, name);

  const result2 = await fixtures.WhenUploadingCustomFeature(
    name,
    description,
    invalidTag2,
  );
  expect(result2.status).toBe(HttpStatus.BAD_REQUEST);
  fixtures.ThenMaxLengthErrorWasReturned(result2);
  await fixtures.ThenNoGeoFeatureIsCreated(result2, name);
});

test(`if tagging info is included in DTO and valid, created feature should be tagged properly`, async () => {
  // ARRANGE
  const name = 'someFeature';
  const description = 'someDescrip';
  const tag = 'someTag';
  await fixtures.GivenProjectPusWithGeometryForProject();

  // ACT
  const result = await fixtures.WhenUploadingCustomFeature(
    name,
    description,
    tag,
  );

  // ASSERT
  await fixtures.ThenGeoFeaturesAreCreated(result, name, description, tag);
  await fixtures.ThenGeoFeatureTagIsCreated(name, tag);
});

test(`if tagging info is included in, the feature's tag should be trimmed down of white spaces `, async () => {
  // ARRANGE
  const name = 'someFeature';
  const description = 'someDescrip';
  const paddedTag = '   paddedTag    ';
  await fixtures.GivenProjectPusWithGeometryForProject();

  // ACT
  const result = await fixtures.WhenUploadingCustomFeature(
    name,
    description,
    paddedTag,
  );

  // ASSERT
  await fixtures.ThenGeoFeaturesAreCreated(
    result,
    name,
    description,
    paddedTag.trim(),
  );
  await fixtures.ThenGeoFeatureTagIsCreated(name, paddedTag.trim());
});

test(`if there is already an existing feature with a tag that has equivalent capitalization to the one included in the custom feature DTO, the existing one will be used for the new feature`, async () => {
  // ARRANGE
  const equivalentTag = 'some-Tag';
  const name = 'someFeature';
  const description = 'someDescrip';
  await fixtures.GivenProjectPusWithGeometryForProject();

  const featureWithEquivalentTagId = await fixtures.GivenFeatureOnProject(
    'equivalentTagFeature',
  );
  await fixtures.GivenTagOnFeature(featureWithEquivalentTagId, equivalentTag);

  // ACT
  const result = await fixtures.WhenUploadingCustomFeature(
    name,
    description,
    'SomE-TAG',
  );

  // ASSERT
  await fixtures.ThenGeoFeaturesAreCreated(
    result,
    name,
    description,
    equivalentTag,
  );
  await fixtures.ThenGeoFeatureTagIsCreated(name, equivalentTag);
  // TODO Check for update of last_modified_at for all affected tag rows for project when implemented
});

test(`custom feature upload`, async () => {
  const name = 'someFeature';
  const description = 'someDescrip';
  await fixtures.GivenProjectPusWithGeometryForProject();

  const result = await fixtures.WhenUploadingCustomFeature(name, description);

  await fixtures.ThenGeoFeaturesAreCreated(result, name, description);
  await fixtures.ThenFeatureAmountsFromShapefileAreCreated(name);
});

test('should delete feature_amounts_per_planning_unit data related to a feature when this is deleted', async () => {
  const name = 'someFeature';
  const description = 'someDescrip';
  await fixtures.GivenProjectPusWithGeometryForProject();

  const result = await fixtures.WhenUploadingCustomFeature(name, description);

  await fixtures.ThenGeoFeaturesAreCreated(result, name, description);
  await fixtures.ThenFeatureAmountsFromShapefileAreCreated(name);
  await fixtures.WhenDeletingFeatureForProject(name);
  await fixtures.ThenFeatureAmountsPerPlanningUnitDataIsDeletedForFeatureWithGivenId(
    name,
  );
});
