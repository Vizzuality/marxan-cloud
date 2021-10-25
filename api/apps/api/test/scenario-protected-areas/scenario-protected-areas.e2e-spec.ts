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

test(`getting BRA.2_1 protected areas for scenario`, async () => {
  const scenarioId: string = await fixtures.GivenScenarioInsideBRA21WasCreated();
  const areas = await fixtures.WhenGettingProtectedAreas(scenarioId);
  await fixtures.ThenInContainsRelevantWdpa(areas);
});

test(`adding custom protected area / selected global area`, async () => {
  const scenarioIdWithAddedArea: string = await fixtures.GivenScenarioInsideBRA21WasCreated();
  const scenarioIdWithoutAddedArea: string = await fixtures.GivenScenarioInsideBRA21WasCreated();

  await fixtures.GivenCustomProtectedAreaWasAdded(scenarioIdWithAddedArea);
  await fixtures.GivenWdpaCategoryWasSelected(
    scenarioIdWithAddedArea,
    IUCNCategory.III,
  );

  const areasWithCustom = await fixtures.WhenGettingProtectedAreas(
    scenarioIdWithAddedArea,
  );

  const areasWithExplicitCustom = await fixtures.WhenGettingProtectedAreas(
    scenarioIdWithoutAddedArea,
  );

  await fixtures.ThenItContainsSelectedGlobalArea(
    areasWithCustom,
    IUCNCategory.III,
  );
  await fixtures.ThenItContainsSelectedCustomArea(areasWithCustom);
  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithExplicitCustom);
});
