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
  await fixtures.WhenUploadingCustomFeatureFromCSV();
  await fixtures.ThenFeatureUploadRegistryIsCreated();
});
test('custom feature csv upload with missing puids', async () => {
  const response = await fixtures.WhenUploadingCsvWithMissingPUIDColumn();
  await fixtures.ThenMissingPUIDErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
