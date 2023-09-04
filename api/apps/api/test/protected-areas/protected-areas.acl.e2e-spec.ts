import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './protected-areas.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

describe('Protected Area - ACL', () => {
  test('should not permit updating a given feature, when it is not editable', async () => {
    const viewOnlyProject = fixtures.anotherProjectId;
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'new pa name',
      viewOnlyProject,
    );
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'new pa name',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `User not allowed to edit protected areas of the project`,
    );
  });

  test('should not permit deleting protected area, when user cannot edit project', async () => {
    const viewOnlyProject = fixtures.anotherProjectId;
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'new pa name',
      viewOnlyProject,
    );
    const result = await fixtures.WhenDeletingProtectedAreaName(
      protectedAreaId,
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `User not allowed to delete protected areas of the project`,
    );
  });
});
