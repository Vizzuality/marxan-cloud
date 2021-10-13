import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './update-project.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`updating a project should work`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectIsUpdated();

  await fixtures.ThenWhenReadingProjectItHasNewData();
});
