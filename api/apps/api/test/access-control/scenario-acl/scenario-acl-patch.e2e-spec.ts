import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './scenario-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`add every type of user to a scenario as scenario owner`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheScenarioAsOwner(
    scenarioId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheScenarioAsOwner(
    scenarioId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheScenarioAsOwner(
    scenarioId,
  );
  const allUsersInScenarioResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
    scenarioId,
  );
  fixtures.ThenNoContentIsReturned(viewerResponse);
  fixtures.ThenNoContentIsReturned(contributorResponse);
  fixtures.ThenNoContentIsReturned(ownerResponse);
  fixtures.ThenAllUsersinScenarioAfterEveryTypeOfUserHasBeenAddedAreReturned(
    allUsersInScenarioResponse,
  );
});

test(`add every type of user to a scenario as scenario contributor`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario(scenarioId);
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheScenarioAsContributor(
    scenarioId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheScenarioAsContributor(
    scenarioId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheScenarioAsContributor(
    scenarioId,
  );
  fixtures.ThenForbiddenIsReturned(viewerResponse);
  fixtures.ThenForbiddenIsReturned(contributorResponse);
  fixtures.ThenForbiddenIsReturned(ownerResponse);
});

test(`add every type of user to a scenario as scenario viewer`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheScenarioAsContributor(
    scenarioId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheScenarioAsContributor(
    scenarioId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheScenarioAsContributor(
    scenarioId,
  );
  fixtures.ThenForbiddenIsReturned(viewerResponse);
  fixtures.ThenForbiddenIsReturned(contributorResponse);
  fixtures.ThenForbiddenIsReturned(ownerResponse);
});

test(`change user role`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  const changeRoleResponse = await fixtures.WhenChangingUserRole(scenarioId);
  fixtures.ThenNoContentIsReturned(changeRoleResponse);
  const allUsersInScenarioResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
    scenarioId,
  );
  fixtures.ThenUsersWithChangedRoleIsOnScenario(allUsersInScenarioResponse);
});

test(`adds a not allowed user role to project`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const incorrectRoleResponse = await fixtures.WhenAddingIncorrectUserRole(
    scenarioId,
  );
  fixtures.ThenBadRequestAndEnumMessageIsReturned(incorrectRoleResponse);
});

test(`adds nonsensical userId`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const nonsenseUserIdResponse = await fixtures.WhenAddingNonsenseUserId(
    scenarioId,
  );
  fixtures.ThenBadRequestAndUserIdMessageIsReturned(nonsenseUserIdResponse);
});

test(`adds non-existent userId`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const nonExistentUserIdResponse = await fixtures.WhenAddingNonExistentUserId(
    scenarioId,
  );
  fixtures.ThenQueryFailedReturned(nonExistentUserIdResponse);
});

test(`adds and deletes users alternately`, async () => {
  /* The purpose of this test is to check that all the transactions are
  executed correctly and that no users are deleted/reinstated because
  the transaction wasn't committed before initiating a new one */

  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);

  const viewerResponse = await fixtures.WhenAddingANewViewerToTheScenarioAsOwner(
    scenarioId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheScenarioAsOwner(
    scenarioId,
  );
  fixtures.ThenNoContentIsReturned(viewerResponse);
  fixtures.ThenNoContentIsReturned(contributorResponse);

  await fixtures.WhenRevokingAccessToContributorFromScenarioAsOwner(scenarioId);
  await fixtures.WhenChangingUserRole(scenarioId);
  let currentUsersResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
    scenarioId,
  );
  fixtures.ThenCorrectUsersAreReturnedAfterDeletionAndChangingRole(
    currentUsersResponse,
  );

  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheScenarioAsOwner(
    scenarioId,
  );
  fixtures.ThenNoContentIsReturned(ownerResponse);
  currentUsersResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
    scenarioId,
  );
  fixtures.ThenThreeCorrectUsersAreReturned(currentUsersResponse);

  await fixtures.WhenRevokingAccessToViewerFromScenarioAsOwner(scenarioId);
  currentUsersResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
    scenarioId,
  );
  fixtures.ThenLastTwoCorrectUsersAreReturned(currentUsersResponse);
});
