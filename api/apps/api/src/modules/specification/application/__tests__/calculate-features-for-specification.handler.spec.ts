import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './calculate-features.handler.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`calculate features`, async () => {
  await fixtures.GivenCreatedSpecificationsWithWithFeaturesWereCreated();
  await fixtures.WhenAllFeaturesAreCalculated();
  await fixtures.ThenSpecificationsWithRelatedConfigAreSaved();
  await fixtures.ThenSpecificationIsReady();
});

test(`calculate features for non related specifications`, async () => {
  await fixtures.WhenAllFeaturesAreCalculated();
  fixtures.ThenNoEventIsPublished();
});
