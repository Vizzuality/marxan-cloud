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

test(`delete every type of user from the project as owner`, async () => {
  const projectId = await fixtures.GivenProjectExistsAndHasUsers();
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
