import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './scenario-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting scenario users when user has no role in the scenario`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const response = await fixtures.WhenGettingScenarioUsersAsNotInScenario(
    scenarioId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting scenario users as owner and unique user`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const response = await fixtures.WhenGettingScenarioUsersAsOwner(scenarioId);
  fixtures.ThenSingleOwnerUserInScenarioIsReturned(response);
});

test(`getting scenario users as viewer`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  const response = await fixtures.WhenGettingScenarioUsersAsViewer(scenarioId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting scenario users as contributor`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario(scenarioId);
  const response = await fixtures.WhenGettingScenarioUsersAsContributor(
    scenarioId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting scenario users as owner with a search query`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  const response = await fixtures.WhenGettingScenarioUsersWithSearchTerm(
    scenarioId,
  );
  fixtures.ThenViewerUserInformationIsReturned(response);
});

test(`getting scenario users as owner with a wrong search query`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  const response = await fixtures.WhenGettingScenarioUsersWithWrongSearchTerm(
    scenarioId,
  );
  fixtures.ThenNoUserInformationIsReturned(response);
});

test(`getting scenario users should only show those who are not deleted`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario(scenarioId);
  await fixtures.GivenUserWasAddedToScenario(scenarioId);
  let response = await fixtures.WhenGettingScenarioUsersAsOwner(scenarioId);
  fixtures.ThenAllUsersBeforeDeletingAnyFromAppAreReturned(response);
  await fixtures.GivenUserIsDeleted();
  response = await fixtures.WhenGettingScenarioUsersAsOwner(scenarioId);
  fixtures.ThenAllUsersExceptDeletedAreReturned(response);
});
