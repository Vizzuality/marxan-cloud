import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.userRoleCleanup();
  await fixtures?.cleanup();
});

test(`add every type of user to a project as project owner`, async () => {
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

test(`add every type of user to a project as project contributor`, async () => {
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

test(`add every type of user to a project as project viewer`, async () => {
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
