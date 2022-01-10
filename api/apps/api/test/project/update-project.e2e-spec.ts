import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './update-project.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  console.error = () => {};
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

test(`updating a project should fail if an export is running`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectIsUpdatedWithARunningExport();

  await fixtures.ThenWhenReadingProjectItHasTheOriginalData();
});

test(`updating a project does not work if user is not in project`, async () => {
  await fixtures.GivenProjectWasCreated();

  const request = await fixtures.WhenProjectIsUpdatedAsNotIncludedUser();

  await fixtures.ThenForbiddenIsReturned(request);
});
