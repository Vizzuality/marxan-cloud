import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './determine-features.handler.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`determine features`, async () => {
  await fixtures.GivenCreatedSpecificationsWithUndeterminedFeaturesWereCreated();
  await fixtures.WhenFeaturesAreDetermined();
  await fixtures.ThenSpecificationIsSaved();
  await fixtures.ThenSpecificationIsPublished();
});

test(`determine features on unknown specification`, async () => {
  await fixtures.WhenFeaturesAreDetermined();
  fixtures.ThenNoEventIsPublished();
});
