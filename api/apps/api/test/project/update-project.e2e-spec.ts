import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './update-project.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`updating a project should work`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectIsUpdated();

  await fixtures.ThenWhenReadingProjectItHasNewData();
});

test(`updating a project should fail if an export is running`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectIsUpdatedWhileAnExportIsPending();

  await fixtures.ThenWhenReadingProjectItHasTheOriginalData();
});

test(`updating a project does not work if user is not in project`, async () => {
  await fixtures.GivenProjectWasCreated();

  const request = await fixtures.WhenProjectIsUpdatedAsNotIncludedUser();

  await fixtures.ThenForbiddenIsReturned(request);
});
