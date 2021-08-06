import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './calculate-features-for-specification.handler.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`calculate features`, async () => {
  await fixtures.GivenCreatedSpecificationWithWithFeaturesWasCreated();
  await fixtures.WhenAllFeaturesAreCalculated();
  await fixtures.ThenSpecificationIsSaved();
  await fixtures.ThenSpecificationIsReady();
});

test(`calculate features on unknown specification`, async () => {
  await fixtures.WhenAllFeaturesAreCalculated();
  fixtures.ThenErrorIsLogged();
  fixtures.ThenNoEventIsPublished();
});
