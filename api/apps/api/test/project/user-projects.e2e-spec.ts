import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './user-projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting own projects`, async () => {
  const projectId = await fixtures.GivenUserCreatedAProject();
  const someonesProjectId = await fixtures.GivenAnotherUserCreatedAProject();
  const result = await fixtures.WhenGettingUserProjects();
  fixtures.ThenOnlyUserCreatedArePresent(projectId, someonesProjectId, result);
});
