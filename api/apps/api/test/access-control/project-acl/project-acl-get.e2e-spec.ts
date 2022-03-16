import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-acl.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
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
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsViewer(projectId);
  fixtures.ThenOwnerAndViewerInProjectAreReturned(response);
});

test(`getting project users as contributor`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersAsContributor(
    projectId,
  );
  fixtures.ThenOwnerAndContributorInProjectAreReturned(response);
});

test(`getting project users as owner with a search query`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersWithSearchTerm(
    projectId,
  );
  fixtures.ThenViewerUserInformationIsReturned(response);
});

test(`getting project users as owner with a wrong search query`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject(projectId);
  const response = await fixtures.WhenGettingProjectUsersWithWrongSearchTerm(
    projectId,
  );
  fixtures.ThenNoUserInformationIsReturned(response);
});

test(`getting project users should only show those who are not deleted`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject(projectId);
  await fixtures.GivenUserWasAddedToProject(projectId);
  let response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenAllUsersBeforeDeletingAnyFromAppAreReturned(response);
  await fixtures.GivenUserIsDeleted();
  response = await fixtures.WhenGettingProjectUsersAsOwner(projectId);
  fixtures.ThenAllUsersExceptDeletedAreReturned(response);
});
