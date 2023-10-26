import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './upload-feature.fixtures';
import { v4 } from 'uuid';

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
  await fixtures.ThenFeatureAmountPerPlanningUnitAreCreated();
  await fixtures.ThenFeatureUploadRegistryIsCleared();
});

test('custom feature csv upload when project not found', async () => {
  const falseProjectId = v4();
  const response =
    await fixtures.WhenUploadingCsvWhenProjectNotFound(falseProjectId);
  await fixtures.ThenProjectNotFoundErrorIsReturned(response, falseProjectId);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
test('custom feature csv upload with missing puids', async () => {
  const response = await fixtures.WhenUploadingCsvWithMissingPUIDColumn();
  await fixtures.ThenMissingPUIDErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with no features', async () => {
  const response = await fixtures.WhenUploadingCsvWithNoFeatures();
  await fixtures.ThenNoFeaturesInCsvFileErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with duplicated puids', async () => {
  const response = await fixtures.WhenUploadingCsvWithDuplicatedPUIDs();
  await fixtures.ThenDuplicatedPUIDErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv with puids not present in the project', async () => {
  const response =
    await fixtures.WhenUploadingCsvWithPuidsNotPresentITheProject();
  await fixtures.ThenPuidsNotPresentErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with duplicated header', async () => {
  const response = await fixtures.WhenUploadingACSVWithDuplicatedHeaders();
  await fixtures.ThenDuplicatedHeaderErrorIsReturned(response);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
