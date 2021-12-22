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
