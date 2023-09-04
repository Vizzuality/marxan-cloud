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

describe('Protected Area - update protected area name', () => {
  test('should return NotFound error when protected area does not exist', async () => {
    const protectedAreaId = v4();
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'new pa name',
    );
    await fixtures.ThenProtectedWasNotFound(result);
  });

  test('should not permit updating global protected area', async () => {
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'global protected area',
    );
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'ne pa name',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `Global protected areas are not editable.`,
    );
  });

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

  test('should update the name of a protected area, when permitted', async () => {
    const newName = 'new name';
    const projectId = fixtures.projectId;
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'someName',
      projectId,
    );
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      newName,
    );
    await fixtures.ThenProtectedAreaHasNewName(protectedAreaId, newName);
    await fixtures.ThenResponseContainsUpdatedProtectedAreaInJsonApiFormat(
      result,
      newName,
    );
  });
});
