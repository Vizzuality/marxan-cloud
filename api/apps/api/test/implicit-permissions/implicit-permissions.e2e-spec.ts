import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './implicit-permissions.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`All users roles in project must be replicated in newly created scenario`, async () => {
  /*
    To test everything at once and for clarity purposes, we will
    consider the creator of project not as owner but as "creator",
    as another owner will be added as well to test that every single
    role is transferred to a scenario regardless of their status
    as creator or not. The owner that does not create the project
    would be mentioned just as "owner" or "other owner".
  */
  await fixtures.GivenProjectWasCreated();
  const creatorToken = await fixtures.GivenUserIsLoggedIn('owner');
  await fixtures.GivenOwnerWasAddedToProject();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenViewerWasAddedToProject();

  const scenarioId = await fixtures.GivenScenarioWasCreated();

  const response = await fixtures.WhenGettingScenarioUsers(
    scenarioId,
    creatorToken,
  );

  fixtures.ThenAllUsersInProjectAreReturnedWithTheProperRoleInScenario(
    response,
  );
});

test(`All users roles in scenario should be revoked when revoked in project`, async () => {
  await fixtures.GivenProjectWasCreated();
  const creatorToken = await fixtures.GivenUserIsLoggedIn('owner');

  await fixtures.GivenOwnerWasAddedToProject();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenViewerWasAddedToProject();

  const scenarioId = await fixtures.GivenScenarioWasCreated();

  await fixtures.WhenDeletingAllUsersExceptCreatorFromProject();

  const response = await fixtures.WhenGettingScenarioUsers(
    scenarioId,
    creatorToken,
  );
  fixtures.ThenOnlyCreatorIsReturned(response);
});

test(`It fails to change the scenario owner role of the creator of the scenario as it is a explicit role`, async () => {
  await fixtures.GivenProjectWasCreated();
  const creatorToken = await fixtures.GivenUserIsLoggedIn('owner');

  await fixtures.GivenOwnerWasAddedToProject();

  const scenarioId = await fixtures.GivenScenarioWasCreated();

  await fixtures.WhenChangingCreatorRoleInProject();
  const response = await fixtures.WhenGettingScenarioUsers(
    scenarioId,
    creatorToken,
  );
  fixtures.ThenBothOwnersShouldBeReturned(response);
});

test(`All changes in roles at project level should also be done at scenario level`, async () => {
  await fixtures.GivenProjectWasCreated();
  const creatorToken = await fixtures.GivenUserIsLoggedIn('owner');

  await fixtures.GivenOwnerWasAddedToProject();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenViewerWasAddedToProject();

  const scenarioId = await fixtures.GivenScenarioWasCreated();

  await fixtures.WhenChangingAllUsersExceptCreatorRole();
  const response = await fixtures.WhenGettingScenarioUsers(
    scenarioId,
    creatorToken,
  );
  fixtures.ThenUsersWithChangedRolesShouldBeReturned(response);
});

test(`All project users added after a scenario is created should be included in the scenario`, async () => {
  await fixtures.GivenProjectWasCreated();
  const creatorToken = await fixtures.GivenUserIsLoggedIn('owner');
  const scenarioId = await fixtures.GivenScenarioWasCreated();

  let response = await fixtures.WhenGettingScenarioUsers(
    scenarioId,
    creatorToken,
  );
  fixtures.ThenOnlyCreatorIsReturned(response);

  await fixtures.GivenOwnerWasAddedToProject();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenViewerWasAddedToProject();

  response = await fixtures.WhenGettingScenarioUsers(scenarioId, creatorToken);

  fixtures.ThenAllUsersInProjectAreReturnedWithTheProperRoleInScenario(
    response,
  );
});
