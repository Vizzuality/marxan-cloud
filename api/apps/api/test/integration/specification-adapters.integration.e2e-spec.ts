import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`persisting specification`, async () => {
  const specification = await fixtures.GivenSpecificationWasCreated();
  const restoredSpecification = await fixtures.WhenGettingSpecification(
    specification.id,
  );
  fixtures.ThenTheyAreEqual(specification, restoredSpecification);
});

test(`getting specifications related to split feature config`, async () => {
  const specification = await fixtures.GivenSpecificationWasCreated();
  const specifications = await fixtures.WhenGettingSpecificationsForSplitConfig();
  fixtures.ThenResultIncludesRelatedSpecification(
    specification,
    specifications,
  );
});

test(`getting specifications related to stratification feature config`, async () => {
  const specification = await fixtures.GivenSpecificationWasCreated();
  const specifications = await fixtures.WhenGettingSpecificationsForStratificationConfig();
  fixtures.ThenResultIncludesRelatedSpecification(
    specification,
    specifications,
  );
});

test(`getting specifications related to non-existing config`, async () => {
  await fixtures.GivenSpecificationWasCreated();
  const specifications = await fixtures.WhenGettingSpecificationsNonExistingConfig();
  expect(specifications).toEqual([]);
});

test(`getting specifications related to particular feature ids`, async () => {
  const specification = await fixtures.GivenSpecificationWasCreated();
  const specifications = await fixtures.WhenGettingSpecificationsRelatedToFeature();
  fixtures.ThenResultIncludesRelatedSpecification(
    specification,
    specifications,
  );
});

afterEach(async () => {
  await fixtures?.cleanup();
});
