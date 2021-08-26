import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting public projects while none is available`, async () => {
  await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});

test(`getting public projects`, async () => {
  const publicProjectId = await fixtures.GivenPublicProjectWasCreated();
  await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(publicProjectId, response);
});
