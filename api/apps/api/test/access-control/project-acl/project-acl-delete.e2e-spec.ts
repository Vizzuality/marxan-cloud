import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`delete every type of user from the project as owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  await fixtures.GivenContributorWasAddedToProject(projectId);
  await fixtures.GivenOwnerWasAddedToProject(projectId);
  const viewerRevokeResponse = await fixtures.WhenRevokingAccessToViewerFromProjectAsOwner(
    projectId,
  );
  const contributorRevokeResponse = await fixtures.WhenRevokingAccessToContributorFromProjectAsOwner(
    projectId,
  );
  const ownerRevokeResponse = await fixtures.WhenRevokingAccessToOwnerFromProjectAsOwner(
    projectId,
  );
  const singleUserResponse = await fixtures.WhenGettingProjectUsersAsOwner(
    projectId,
  );
  fixtures.ThenNoContentIsReturned(viewerRevokeResponse);
  fixtures.ThenNoContentIsReturned(contributorRevokeResponse);
  fixtures.ThenNoContentIsReturned(ownerRevokeResponse);
  fixtures.ThenSingleOwnerUserInProjectIsReturned(singleUserResponse);
});

test(`delete last owner as the only owner`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const revokeResponse = await fixtures.WhenRevokingAccessToLastOwnerFromProjectAsOwner(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(revokeResponse);
});
