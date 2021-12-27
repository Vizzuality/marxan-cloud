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
  fixtures.ThenAllUsersinProjectAfterEveryTypeOfUserHasBeenAddedAreReturned(
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
