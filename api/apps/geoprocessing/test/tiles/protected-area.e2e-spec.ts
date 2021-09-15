import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './protected-area.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`Getting tile for project`, async () => {
  const customPa = await fixtures.GivenCustomProtectedAreaWasCreated();
  const mvt = await fixtures.WhenRequestingTileForProject(fixtures.projectId);
  await fixtures.ThenItContainsCustomProtectedArea(mvt, customPa);
});
