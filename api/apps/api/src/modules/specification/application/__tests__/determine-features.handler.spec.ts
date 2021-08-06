import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './determine-features.handler.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`determine features`, async () => {
  await fixtures.GivenCreatedSpecificationWithUndeterminedFeaturesWasCreated();
  await fixtures.WhenAllFeaturesAreDetermined();
  await fixtures.ThenSpecificationIsSaved();
  await fixtures.ThenSpecificationIsPublished();
});

test(`determine features on unknown specification`, async () => {
  const result = await fixtures.WhenAllFeaturesAreDetermined();
  fixtures.ThenErrorIsRaised(result);
  fixtures.ThenNoEventIsPublished();
});
