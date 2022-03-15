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

test(`selecting protected areas as owner`, async () => {
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsOwner(
    scenario,
    IUCNCategory.III,
    areaId,
  );

  const areas = await fixtures.WhenGettingProtectedAreasAsOwner(scenario);

  await fixtures.ThenItContainsSelectedGlobalArea(areas, IUCNCategory.III);
  await fixtures.ThenItContainsSelectedCustomArea(areas, areaId);

  await fixtures.ThenCalculationsOfProtectionLevelWereTriggered(scenario);
});

test(`selecting protected areas as contributor`, async () => {
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  await fixtures.GivenAreasWereSelectedAsContributor(
    scenario,
    IUCNCategory.III,
    areaId,
  );

  const areas = await fixtures.WhenGettingProtectedAreasAsContributor(scenario);

  await fixtures.ThenItContainsSelectedGlobalArea(areas, IUCNCategory.III);
  await fixtures.ThenItContainsSelectedCustomArea(areas, areaId);

  await fixtures.ThenCalculationsOfProtectionLevelWereTriggered(scenario);
});

test(`selecting protected areas as viewer`, async () => {
  const scenario: string = await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenViewerWasAddedToScenario();
  const areaId = await fixtures.GivenCustomProtectedAreaWasAddedToProject();
  const response = await fixtures.GivenAreasWereSelectedAsViewer(
    scenario,
    IUCNCategory.III,
    areaId,
  );
  fixtures.ThenForbiddenIsReturned(response);

  const areas = await fixtures.WhenGettingProtectedAreasAsViewer(scenario);

  await fixtures.ThenItDoesNotContainsSelectedGlobalArea(
    areas,
    IUCNCategory.III,
  );
  await fixtures.ThenItDoesNotContainsSelectedCustomArea(areas, areaId);

  await fixtures.ThenCalculationsOfProtectionLevelWereNotTriggered();
});

test(`getting NAM.2_1 protected areas for scenario as owner`, async () => {
  const scenarioId: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  const areas = await fixtures.WhenGettingProtectedAreasAsOwner(scenarioId);
  await fixtures.ThenItContainsRelevantWdpa(areas);
});

test(`getting NAM.2_1 protected areas for scenario as contributor`, async () => {
  const scenarioId: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  const areas = await fixtures.WhenGettingProtectedAreasAsContributor(
    scenarioId,
  );
  await fixtures.ThenItContainsRelevantWdpa(areas);
});

test(`getting NAM.2_1 protected areas for scenario as viewer`, async () => {
  const scenarioId: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenViewerWasAddedToScenario();
  const areas = await fixtures.WhenGettingProtectedAreasAsViewer(scenarioId);
  await fixtures.ThenItContainsRelevantWdpa(areas);
});

test(`getting NAM.2_1 protected areas for scenario as user not in scenario`, async () => {
  const scenarioId: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  const response = await fixtures.WhenGettingProtectedAreasAsUserNotInScenario(
    scenarioId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`adding custom protected area as owner`, async () => {
  const scenarioIdWithAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  const scenarioIdWithoutAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenCustomProtectedAreaWasAddedToProject();

  const areasWithCustom = await fixtures.WhenGettingProtectedAreasAsOwner(
    scenarioIdWithAddedArea,
  );
  const areasWithExplicitCustom =
    await fixtures.WhenGettingProtectedAreasAsOwner(scenarioIdWithoutAddedArea);

  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithCustom);
  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithExplicitCustom);
});

test(`adding custom protected area as contributor`, async () => {
  const scenarioIdWithAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenContributorWasAddedToScenario();
  const scenarioIdWithoutAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenContributorWasAddedToScenario();

  await fixtures.GivenCustomProtectedAreaWasAddedToProject();

  const areasWithCustom = await fixtures.WhenGettingProtectedAreasAsContributor(
    scenarioIdWithAddedArea,
  );
  const areasWithExplicitCustom =
    await fixtures.WhenGettingProtectedAreasAsContributor(
      scenarioIdWithoutAddedArea,
    );

  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithCustom);
  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithExplicitCustom);
});

test(`adding custom protected area as viewer`, async () => {
  const scenarioIdWithAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenViewerWasAddedToScenario();
  const scenarioIdWithoutAddedArea: string =
    await fixtures.GivenScenarioInsideNAM41WasCreated();
  await fixtures.GivenViewerWasAddedToScenario();

  await fixtures.GivenCustomProtectedAreaWasAddedToProject();

  const areasWithCustom = await fixtures.WhenGettingProtectedAreasAsViewer(
    scenarioIdWithAddedArea,
  );
  const areasWithExplicitCustom =
    await fixtures.WhenGettingProtectedAreasAsViewer(
      scenarioIdWithoutAddedArea,
    );

  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithCustom);
  await fixtures.ThenItContainsNonSelectedCustomArea(areasWithExplicitCustom);
});
