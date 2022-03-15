import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './scenario-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`delete every type of user from the scenario as owner`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario(scenarioId);
  await fixtures.GivenContributorWasAddedToScenario(scenarioId);
  await fixtures.GivenOwnerWasAddedToScenario(scenarioId);
  const viewerRevokeResponse =
    await fixtures.WhenRevokingAccessToViewerFromScenarioAsOwner(scenarioId);
  const contributorRevokeResponse =
    await fixtures.WhenRevokingAccessToContributorFromScenarioAsOwner(
      scenarioId,
    );
  const ownerRevokeResponse =
    await fixtures.WhenRevokingAccessToOwnerFromScenarioAsOwner(scenarioId);
  /* This part of the test is done by using the GET endpoint from MARXAN-1079
     so this will be uncommented when everything is merged into MARXAN-1016
  */
  // const singleUserResponse = await fixtures.WhenGettingScenarioUsersAsOwner(
  //   scenarioId,
  // );
  fixtures.ThenNoContentIsReturned(viewerRevokeResponse);
  fixtures.ThenNoContentIsReturned(contributorRevokeResponse);
  fixtures.ThenNoContentIsReturned(ownerRevokeResponse);
  // fixtures.ThenSingleOwnerUserInScenarioIsReturned(singleUserResponse);
});

test(`delete last owner as the only owner`, async () => {
  const scenarioId = await fixtures.GivenScenarioWasCreated();
  const revokeResponse =
    await fixtures.WhenRevokingAccessToLastOwnerFromScenarioAsOwner(scenarioId);
  fixtures.ThenForbiddenIsReturned(revokeResponse);
});
