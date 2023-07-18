import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './upload-feature.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`custom feature csv upload`, async () => {
  const result = await fixtures.WhenUploadingCustomFeatureFromCSV();

  expect(result.body).toHaveLength(2);
  await fixtures.ThenNewFeaturesAreCreated();
  await fixtures.ThenNewFeaturesAmountsAreCreated();
  await fixtures.ThenFeatureUploadRegistryIsCleared();
});
test('custom feature csv upload with missing puids', async () => {
  const response = await fixtures.WhenUploadingCsvWithMissingPUIDColumn();
  await fixtures.ThenMissingPUIDErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with duplicated header', async () => {
  const response = await fixtures.WhenUploadingACSVWithDuplicatedHeaders();
  await fixtures.ThenDuplicatedHeaderErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
