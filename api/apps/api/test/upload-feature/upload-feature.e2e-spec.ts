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

  const result = await fixtures.WhenUploadingCustomFeature(name, description);

  await fixtures.ThenGeoFeaturesAreCreated(result, name, description);
});

test(`if tagging info is included in DTO but invalid, then error is returned and everything is rolled back`, async () => {
  // ARRANGE
  const name = 'invalidFeat';
  const description = 'invalidDesc';
  const invalidTag1 = 'some\ntag';
  const invalidTag2 = `t${'a'.repeat(tagMaxlength + 1)}g`;

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

test(`if there is already an existing feature with a tag that has equivalent capitalization to the one included in the custom feature DTO, the existing one will be used for the new feature`, async () => {
  // ARRANGE
  const equivalentTag = 'some-Tag';
  const name = 'someFeature';
  const description = 'someDescrip';

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
  await fixtures.ThenGeoFeaturesAreCreated(result, name, description, equivalentTag);
  await fixtures.ThenGeoFeatureTagIsCreated(name, equivalentTag);
  // TODO Check for update of last_modified_at for all affected tag rows for project when implemented
});
