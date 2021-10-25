import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
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
