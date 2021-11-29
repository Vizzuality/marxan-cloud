import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting project users when user has no role in the project`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUsersAsNotInProject(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users as owner and unique user`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(response);
});

test(`getting project users as viewer`, async () => {
  const projectId = await fixtures.GivenProjectExistsAndHasUsers();
  await fixtures.GivenAUserWasGivenViewerRoleOnProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsViewer(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`getting project users as contributor`, async () => {
  const projectId = await fixtures.GivenProjectExistsAndHasUsers();
  await fixtures.GivenAUserWasGivenContributorRoleOnProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsContributor(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});
