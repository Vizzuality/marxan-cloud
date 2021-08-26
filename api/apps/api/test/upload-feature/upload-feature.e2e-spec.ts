import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './upload-feature.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`custom feature upload`, async () => {
  const result = await fixtures.WhenUploadingCustomFeature();
  await fixtures.ThenGeoFeaturesAreCreated(result);
});
