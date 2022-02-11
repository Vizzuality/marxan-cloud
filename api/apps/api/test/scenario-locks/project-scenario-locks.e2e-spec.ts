import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-scenario-locks.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting all locks of scenarios from projects as project owner`, async () => {
  const userId = await fixtures.GivenOwnerExists();
  const token = await fixtures.GivenUserIsLoggedIn('owner');
  const projectId = await fixtures.GivenProjectWasCreated();
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();

  const firstLock = await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    token,
  );
  await fixtures.ThenScenarioLockInfoAfterCreationIsReturned(
    firstLock,
    scenarioIdObj.firstScenarioId,
  );
  const secondLock = await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    token,
  );
  await fixtures.ThenScenarioLockInfoAfterCreationIsReturned(
    secondLock,
    scenarioIdObj.secondScenarioId,
  );

  const response = await fixtures.WhenGettingAllLocksFromProjectId(
    projectId,
    token,
  );
  fixtures.ThenAllLocksAreReturned(
    response,
    userId,
    scenarioIdObj.firstScenarioId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting all locks of scenarios from projects as project contributor`, async () => {
  const ownerUserId = await fixtures.GivenOwnerExists();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');
  const contributorToken = await fixtures.GivenUserIsLoggedIn('contributor');
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject();
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();

  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    ownerToken,
  );
  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    ownerToken,
  );

  const response = await fixtures.WhenGettingAllLocksFromProjectId(
    projectId,
    contributorToken,
  );
  fixtures.ThenAllLocksAreReturned(
    response,
    ownerUserId,
    scenarioIdObj.firstScenarioId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting all locks of scenarios from projects as project viewer`, async () => {
  const ownerUserId = await fixtures.GivenOwnerExists();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');
  const viewerToken = await fixtures.GivenUserIsLoggedIn('viewer');
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject();
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();

  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    ownerToken,
  );
  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    ownerToken,
  );

  const response = await fixtures.WhenGettingAllLocksFromProjectId(
    projectId,
    viewerToken,
  );
  fixtures.ThenAllLocksAreReturned(
    response,
    ownerUserId,
    scenarioIdObj.firstScenarioId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting all locks of scenarios as scenario owner`, async () => {
  const userId = await fixtures.GivenOwnerExists();
  const token = await fixtures.GivenUserIsLoggedIn('owner');
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();

  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    token,
  );
  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    token,
  );

  const firstScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.firstScenarioId,
    token,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    firstScenarioResponse,
    userId,
    scenarioIdObj.firstScenarioId,
  );
  const secondScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.secondScenarioId,
    token,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    secondScenarioResponse,
    userId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting all locks of scenarios as scenario contributor`, async () => {
  const ownerUserId = await fixtures.GivenOwnerExists();
  const contributorUserId = await fixtures.GivenContributorExists();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');
  const contributorToken = await fixtures.GivenUserIsLoggedIn('contributor');
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();
  await fixtures.GivenContributorIsAddedToScenario(
    scenarioIdObj.firstScenarioId,
    contributorUserId,
  );
  await fixtures.GivenContributorIsAddedToScenario(
    scenarioIdObj.secondScenarioId,
    contributorUserId,
  );

  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    ownerToken,
  );
  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    ownerToken,
  );

  const firstScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.firstScenarioId,
    contributorToken,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    firstScenarioResponse,
    ownerUserId,
    scenarioIdObj.firstScenarioId,
  );
  const secondScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.secondScenarioId,
    contributorToken,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    secondScenarioResponse,
    ownerUserId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting all locks of scenarios as scenario viewer`, async () => {
  const ownerUserId = await fixtures.GivenOwnerExists();
  const viewerUserId = await fixtures.GivenViewerExists();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');
  const viewerToken = await fixtures.GivenUserIsLoggedIn('viewer');
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();
  await fixtures.GivenViewerIsAddedToScenario(
    scenarioIdObj.firstScenarioId,
    viewerUserId,
  );
  await fixtures.GivenViewerIsAddedToScenario(
    scenarioIdObj.secondScenarioId,
    viewerUserId,
  );

  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.firstScenarioId,
    ownerToken,
  );
  await fixtures.WhenAcquiringLockForScenario(
    scenarioIdObj.secondScenarioId,
    ownerToken,
  );

  const firstScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.firstScenarioId,
    viewerToken,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    firstScenarioResponse,
    ownerUserId,
    scenarioIdObj.firstScenarioId,
  );
  const secondScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.secondScenarioId,
    viewerToken,
  );
  fixtures.ThenScenarioLockInfoIsReturned(
    secondScenarioResponse,
    ownerUserId,
    scenarioIdObj.secondScenarioId,
  );
});

test(`getting the lock of a scenario if there is no lock in place`, async () => {
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');
  const scenarioIdObj = await fixtures.GivenTwoScenariosWereCreated();

  const firstScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.firstScenarioId,
    ownerToken,
  );
  fixtures.ThenNoScenarioLockIsReturned(firstScenarioResponse);
  const secondScenarioResponse = await fixtures.WhenGettingLockFromScenario(
    scenarioIdObj.secondScenarioId,
    ownerToken,
  );
  fixtures.ThenNoScenarioLockIsReturned(secondScenarioResponse);
});

test('Viewer fails to acquire lock for a scenario', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenViewerWasAddedToScenario();
  const response = await fixtures.WhenAcquiringLockForScenarioAsViewer();
  fixtures.ThenForbiddenIsReturned(response);
});

test('Contributor acquires lock for a scenario', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  const response = await fixtures.WhenAcquiringLockForScenarioAsContributor();
  fixtures.ThenScenarioLockInfoForContributorIsReturned(response);
});

test('Owner acquires lock for a scenario', async () => {
  await fixtures.GivenScenarioWasCreated();
  const response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);
});

test('Fails to acquire lock for a scenario as there was one already', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenAcquiringLockForScenarioAsContributor();
  fixtures.ThenScenarioIsLockedIsReturned(response);
});

test('Fails to update scenario as there was a lock in place by a different user', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenUpdatingScenarioAsContributor();
  fixtures.ThenScenarioIsLockedIsReturned(response);
});

test('Updates scenario correctly as lock is in place by same user', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenUpdatingScenarioAsOwner();
  fixtures.ThenScenarioIsUpdated(response);
});

test('Releases scenario lock correctly', async () => {
  await fixtures.GivenScenarioWasCreated();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenReleasingLockForScenario(ownerToken);
  fixtures.ThenLockIsSuccessfullyReleased(response);
});

test('Releases scenario lock correctly because user is not owner of lock but is project owner', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  const ownerToken = await fixtures.GivenUserIsLoggedIn('owner');

  let response = await fixtures.WhenAcquiringLockForScenarioAsContributor();
  fixtures.ThenScenarioLockInfoForContributorIsReturned(response);

  response = await fixtures.WhenReleasingLockForScenario(ownerToken);
  fixtures.ThenLockIsSuccessfullyReleased(response);
});

test('Releases scenario lock correctly because user is not owner of lock but is project contributor', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  await fixtures.GivenContributorWasAddedToProject();
  const contributorToken = await fixtures.GivenUserIsLoggedIn('contributor');

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenReleasingLockForScenario(contributorToken);
  fixtures.ThenLockIsSuccessfullyReleased(response);
});

test('Fails to release scenario lock as it is not owned by the same user and this is not a project owner/contributor', async () => {
  await fixtures.GivenScenarioWasCreated();
  await fixtures.GivenUserWasAddedToScenario();
  const randomUserToken = await fixtures.GivenUserIsLoggedIn('random');

  let response = await fixtures.WhenAcquiringLockForScenarioAsOwner();
  fixtures.ThenScenarioLockInfoForOwnerIsReturned(response);

  response = await fixtures.WhenReleasingLockForScenario(randomUserToken);
  fixtures.ThenScenarioIsLockedByAnotherUserIsReturned(response);
});
