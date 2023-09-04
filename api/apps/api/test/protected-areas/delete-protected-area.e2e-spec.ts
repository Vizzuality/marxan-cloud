import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';
import { getFixtures } from './protected-areas.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

describe('Protected Area - delete', () => {
  test('should return NotFound error when protected are does not exist', async () => {
    const protectedAreaId = v4();
    const result = await fixtures.WhenDeletingProtectedAreaName(
      protectedAreaId,
    );
    await fixtures.ThenProtectedWasNotFound(result);
  });

  test('should not permit deleting global protected area', async () => {
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'global protected area',
    );
    const result = await fixtures.WhenDeletingProtectedAreaName(
      protectedAreaId,
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `Global protected areas can not be deleted.`,
    );
  });

  test('should not permit deleting protected area used in scenarios', async () => {
    const projectId = fixtures.projectId;
    const protectedAreaId = fixtures.customProtectedAreaId;
    await fixtures.GivenProtectedAreaIsUsedInScenario(
      projectId,
      protectedAreaId,
    );
    const result = await fixtures.WhenDeletingProtectedAreaName(
      protectedAreaId,
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `Custom protected area is used in one or more scenarios cannot be deleted.`,
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

  test('should delete protected area, when permitted', async () => {
    const protectedAreaId = fixtures.customProtectedAreaId;
    await fixtures.WhenDeletingProtectedAreaName(protectedAreaId);
    await fixtures.ThenProtectedAreaIsDeleted();
  });
});
