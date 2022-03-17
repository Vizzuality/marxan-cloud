import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './delete-project.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`deleting a project should work`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectIsDeleted();

  await fixtures.ThenProjectIsNotFound();
});

test(`deleting a project does not work if user is not in project`, async () => {
  await fixtures.GivenProjectWasCreated();

  const request = await fixtures.WhenProjectIsDeletedAsNotIncludedUser();

  await fixtures.ThenForbiddenIsReturned(request);
});
