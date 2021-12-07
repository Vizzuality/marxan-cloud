import { IUCNCategory } from '@marxan/iucn';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`selecting protected areas`, async () => {
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelected(scenario, IUCNCategory.III, areaId);

  const areas = await fixtures.WhenGettingProtectedAreas(scenario);

  await fixtures.ThenItContainsSelectedGlobalArea(areas, IUCNCategory.III);
  await fixtures.ThenItContainsSelectedCustomArea(areas, areaId);

  await fixtures.ThenCalculationsOfProtectionLevelWereTriggered(scenario);
});

test(`getting NAM.2_1 protected areas for scenario`, async () => {
  const scenarioId: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areas = await fixtures.WhenGettingProtectedAreas(scenarioId);
  await fixtures.ThenInContainsRelevantWdpa(areas);
});

test(`adding custom protected area`, async () => {
  const scenarioIdWithAddedArea: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const scenarioIdWithoutAddedArea: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenCustomProtectedAreaWasAddedToProject();

  const areasWithCustom = await fixtures.WhenGettingProtectedAreas(
    scenarioIdWithAddedArea,
  );
  const areasWithExplicitCustom = await fixtures.WhenGettingProtectedAreas(
    scenarioIdWithoutAddedArea,
  );

  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithCustom);
  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithExplicitCustom);
});
