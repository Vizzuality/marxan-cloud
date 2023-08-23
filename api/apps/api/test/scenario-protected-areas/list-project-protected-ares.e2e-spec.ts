import { IUCNCategory } from '@marxan/iucn';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting list of protected areas with scenario usage count for a project`, async () => {
  const projectId = fixtures.GivenProjectExists();
  await fixtures.GivenGlobalProtectedAreaWasCreated(IUCNCategory.III);
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsOwner(
    scenario,
    IUCNCategory.III,
    areaId,
  );
  const areas = await fixtures.WhenGettingProtectedAreasListForProject(
    projectId,
  );
  await fixtures.ThenItContainsListOfCustomProtectedAreas(areas);
});
