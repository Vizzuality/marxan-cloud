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
  await fixtures.ThenItContainsListOfProjectProtectedAreas(areas);
});

test(`getting list of protected areas with scenario usage count for a project and using search`, async () => {
  const projectId = fixtures.GivenProjectExists();
  await fixtures.GivenGlobalProtectedAreaWasCreated(IUCNCategory.III);
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsOwner(
    scenario,
    IUCNCategory.III,
    areaId,
  );
  const areas = await fixtures.WhenGettingProtectedAreasListForProjectWithSearch(
    projectId,
    'custom',
  );
  await fixtures.ThenItContainsSearchedProtectedAreas(areas);
});
test(`getting list of protected areas with scenario usage count for a project and using filter`, async () => {
  const projectId = fixtures.GivenProjectExists();
  await fixtures.GivenGlobalProtectedAreaWasCreated(IUCNCategory.III);
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsOwner(
    scenario,
    IUCNCategory.III,
    areaId,
  );
  const areas = await fixtures.WhenGettingProtectedAreasListForProjectWithFilter(
    projectId,
    'name',
    'IUCN III',
  );
  await fixtures.ThenItContainsFilteredProtectedAreas(areas);
});

test(`getting list of protected areas with scenario usage count for a project and using sort`, async () => {
  const projectId = fixtures.GivenProjectExists();
  await fixtures.GivenGlobalProtectedAreaWasCreated(IUCNCategory.III);
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsOwner(
    scenario,
    IUCNCategory.III,
    areaId,
  );
  const areas = await fixtures.WhenGettingProtectedAreasListForProjectWithSort(
    projectId,
    'name',
  );
  await fixtures.ThenItContainsSortedProtectedAreas(areas);
});
