import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`add every type of user to a project as project owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheProjectAsOwner(
    projectId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheProjectAsOwner(
    projectId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheProjectAsOwner(
    projectId,
  );
  const allUsersInProjectResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(viewerResponse);
  fixtures.ThenNoContentIsReturned(contributorResponse);
  fixtures.ThenNoContentIsReturned(ownerResponse);
  fixtures.ThenAllUsersInProjectAfterEveryTypeOfUserHasBeenAddedAreReturned(
    allUsersInProjectResponse,
  );
});

test(`add every type of user to a project as project contributor`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject(projectId);
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheProjectAsContributor(
    projectId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheProjectAsContributor(
    projectId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheProjectAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(viewerResponse);
  fixtures.ThenForbiddenIsReturned(contributorResponse);
  fixtures.ThenForbiddenIsReturned(ownerResponse);
});

test(`add every type of user to a project as project viewer`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  const viewerResponse = await fixtures.WhenAddingANewViewerToTheProjectAsContributor(
    projectId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheProjectAsContributor(
    projectId,
  );
  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheProjectAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(viewerResponse);
  fixtures.ThenForbiddenIsReturned(contributorResponse);
  fixtures.ThenForbiddenIsReturned(ownerResponse);
});

test(`change owner role as last owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenChangingOwnerUserRoleAsLastOwner(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`change user role`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  const changeRoleResponse = await fixtures.WhenChangingUserRole(projectId);
  fixtures.ThenNoContentIsReturned(changeRoleResponse);
  const allUsersInProjectResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenUsersWithChangedRoleIsOnProject(allUsersInProjectResponse);
});

test(`adds a not allowed user role to project`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const incorrectRoleResponse = await fixtures.WhenAddingIncorrectUserRole(
    projectId,
  );
  fixtures.ThenBadRequestAndEnumMessageIsReturned(incorrectRoleResponse);
});

test(`adds nonsensical userId`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const nonsenseUserIdResponse = await fixtures.WhenAddingNonsenseUserId(
    projectId,
  );
  fixtures.ThenBadRequestAndUserIdMessageIsReturned(nonsenseUserIdResponse);
});

test(`adds non-existent userId`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const nonExistentUserIdResponse = await fixtures.WhenAddingNonExistentUserId(
    projectId,
  );
  fixtures.ThenQueryFailedIsReturned(nonExistentUserIdResponse);
});

test(`changes user role after user is soft-deleted from the app`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenUserWasAddedToProject(projectId);
  await fixtures.GivenUserIsDeleted();

  const response = await fixtures.WhenChangingUserRoleForDeletedUser(projectId);
  fixtures.ThenTransactionFailedIsReturned(response);
});

test(`adds and deletes users from projects alternately`, async () => {
  /* The purpose of this test is to check that all the transactions are
  executed correctly and that no users are deleted/reinstated because
  the transaction wasn't committed before initiating a new one */

  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);

  const viewerResponse = await fixtures.WhenAddingANewViewerToTheProjectAsOwner(
    projectId,
  );
  const contributorResponse = await fixtures.WhenAddingANewContributorToTheProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(viewerResponse);
  fixtures.ThenNoContentIsReturned(contributorResponse);

  await fixtures.WhenRevokingAccessToContributorFromProjectAsOwner(projectId);
  await fixtures.WhenChangingUserRole(projectId);
  let currentUsersResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenCorrectUsersAreReturnedAfterDeletionAndChangingRole(
    currentUsersResponse,
  );

  const ownerResponse = await fixtures.WhenAddingANewOwnerToTheProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(ownerResponse);
  currentUsersResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenThreeCorrectUsersAreReturned(currentUsersResponse);

  await fixtures.WhenRevokingAccessToViewerFromProjectAsOwner(projectId);
  currentUsersResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenLastTwoCorrectUsersAreReturned(currentUsersResponse);
});
