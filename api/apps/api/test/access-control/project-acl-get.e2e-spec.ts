import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting project users as not the owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUsersAsNotOwner(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users as the owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(response);
});

test(`add a new user to a project as not the owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const userId = await fixtures.GivenUserWasCreatedAndNotOwner();
  const response = await fixtures.WhenAddingANewUserToTheProjectAsNotOwner(
    projectId,
    userId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`add a new user to a project as the owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const userId = await fixtures.GivenUserWasCreatedAndNotOwner();
  await fixtures.WhenAddingANewUserToTheProjectAsOwner(projectId, userId);
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenAllUsersinProjectAfterAddingOneAreReturned(response, userId);
});

test(`delete a non-owner user from the project`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const userId = await fixtures.GivenUserWasCreatedAndNotOwner();
  await fixtures.WhenAddingANewUserToTheProjectAsOwner(projectId, userId);
  await fixtures.WhenDeletingUserFromProjectAsOwner(projectId, userId);
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(response);
});
