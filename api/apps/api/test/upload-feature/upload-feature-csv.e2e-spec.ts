import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './upload-feature.fixtures';
import { v4 } from 'uuid';
import { API_EVENT_KINDS } from '@marxan/api-events';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`custom feature csv upload`, async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingCustomFeatureFromCSV();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  await fixtures.ThenCSVImportFinishedEventWasSubmitted(fixtures.projectId);
  await fixtures.ThenNewFeaturesAreCreated();
  await fixtures.ThenNewFeaturesAmountsAreCreated();
  await fixtures.ThenFeatureAmountPerPlanningUnitAreCreated();
  await fixtures.ThenFeatureUploadRegistryIsCleared();
});

test('custom feature csv upload when project not found', async () => {
  const falseProjectId = v4();
  const response =
    await fixtures.WhenUploadingCsvWhenProjectNotFound(falseProjectId);
  fixtures.ThenProjectNotFoundErrorIsReturned(response, falseProjectId);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
test('custom feature csv upload with missing puids', async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingCsvWithMissingPUIDColumn();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  const event = await fixtures.ThenWaitForApiEvent(
    fixtures.projectId,
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha,
  );
  fixtures.ThenMissingPUIDErrorIsReturned(event);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with no features', async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingCsvWithNoFeatures();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  const event = await fixtures.ThenWaitForApiEvent(
    fixtures.projectId,
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha,
  );
  fixtures.ThenNoFeaturesInCsvFileErrorIsReturned(event);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with duplicated puids', async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingCsvWithDuplicatedPUIDs();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  const event = await fixtures.ThenWaitForApiEvent(
    fixtures.projectId,
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha,
  );
  fixtures.ThenDuplicatedPUIDErrorIsReturned(event);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv with puids not present in the project', async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingCsvWithPuidsNotPresentITheProject();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  const event = await fixtures.ThenWaitForApiEvent(
    fixtures.projectId,
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha,
  );
  fixtures.ThenPuidsNotPresentErrorIsReturned(event);
  await fixtures.AndNoFeatureUploadIsRegistered();
});

test('custom feature csv upload with duplicated header', async () => {
  // ARRANGE / ACT
  await fixtures.WhenUploadingACSVWithDuplicatedHeaders();

  // ASSERT
  await fixtures.ThenCSVImportSubmitEventWasSubmitted(fixtures.projectId);
  const event = await fixtures.ThenWaitForApiEvent(
    fixtures.projectId,
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha,
  );

  fixtures.ThenDuplicatedHeaderErrorIsReturned(event);
  await fixtures.AndNoFeatureUploadIsRegistered();
});
