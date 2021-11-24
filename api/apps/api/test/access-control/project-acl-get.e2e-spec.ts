import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting project users when user is not added to project`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUserAsNotInProject(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users as the owner and unique user`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(response);
});

test(`getting project users with user in project but is viewer`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewViewerToTheProjectAsOwner(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsViewer(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users with user in project but is contributor`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewContributorToTheProjectAsOwner(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users with user in project but is other owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewOwnerToTheProjectAsOwner(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsOtherOwner(
    projectId,
  );
  fixtures.ThenAllUsersinProjectAfterAddingAnOwnerAreReturned(response);
});

test(`add every type of user to a project as a project owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  let response = await fixtures.WhenAddingANewViewerToTheProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(response);
  response = await fixtures.WhenAddingANewContributorToTheProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(response);
  response = await fixtures.WhenAddingANewOwnerToTheProjectAsOwner(projectId);
  fixtures.ThenNoContentIsReturned(response);

  response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenAllUsersinProjectAfterEveryTypeOfUserHasBeenAddedAreReturned(
    response,
  );
});

test(`add every type of user to a project as a project contributor`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewContributorToTheProjectAsOwner(projectId);

  let response = await fixtures.WhenAddingANewViewerToTheProjectAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenAddingANewContributorToTheProjectAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenAddingANewOwnerToTheProjectAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`add every type of user to a project as a project viewer`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewContributorToTheProjectAsOwner(projectId);

  let response = await fixtures.WhenAddingANewViewerToTheProjectAsViewer(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenAddingANewContributorToTheProjectAsViewer(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenAddingANewOwnerToTheProjectAsViewer(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`delete every type of user from the project as owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.WhenAddingANewViewerToTheProjectAsOwner(projectId);
  await fixtures.WhenAddingANewContributorToTheProjectAsOwner(projectId);
  await fixtures.WhenAddingANewOwnerToTheProjectAsOwner(projectId);
  let revokeResponse = await fixtures.WhenRevokingAccessToViewerFromProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(revokeResponse);
  revokeResponse = await fixtures.WhenRevokingAccessToContributorFromProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(revokeResponse);
  revokeResponse = await fixtures.WhenRevokingAccessToOwnerFromProjectAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(revokeResponse);
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(response);
});

test(`delete last owner as the only owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const revokeResponse = await fixtures.WhenRevokingAccessToLastOwnerFromProjectAsOwner(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(revokeResponse);
});
