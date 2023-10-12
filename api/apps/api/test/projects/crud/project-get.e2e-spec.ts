import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from '../projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting public project as guest`, async () => {
  const projectId = await fixtures.GivenPublicProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenPublicProjectDetailsArePresent(projectId, response);
});

test(`getting non-public project as guest`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenNotFoundIsReturned(response);
});

test(`getting non-public project as logged-in owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingProject(projectId);
  fixtures.ThenProjectDetailsArePresent(projectId, response);
});

test(`getting a project where the user is not in project`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingProjectAsNotIncludedUser(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`if a project was created with malformed grid data and not GC'ed yet, it should not be included in project listings`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWithMalformedGridDataWasCreated();
  const response = await fixtures.WhenGettingUserProjects();
  fixtures.ThenProjectIsNotIncludedInProjectsList(projectId, response);
});

test(`if a project was created with malformed grid data and not GC'ed yet, a request to get its information should return 404`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWithMalformedGridDataWasCreated();
  const response = await fixtures.WhenGettingProject(projectId);
  fixtures.ThenNotFoundIsReturned(response);
});
