import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './create-project-wdpa-area-filter.fixtures';
import { IUCNCategory } from '@marxan/iucn';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`creating multiple projects should have different protectedAreaFilterByIds`, async () => {
  const projectIdOne: string = await fixtures.GivenProjectWasCreated(`BWA`);
  const scenarioIdOne: string = await fixtures.GivenScenarioWasCreated(
    projectIdOne,
  );
  const projectIdTwo: string = await fixtures.GivenProjectWasCreated(`ZMB`);
  const scenarioIdTwo: string = await fixtures.GivenScenarioWasCreated(
    projectIdTwo,
  );

  await fixtures.WhenScenarioIsUpdated(scenarioIdOne, [
    IUCNCategory.NotApplicable,
  ]);
  await fixtures.WhenScenarioIsUpdated(scenarioIdTwo, [
    IUCNCategory.NotReported,
  ]);

  await fixtures.ThenProtectedAreaFiltersAreDifferent(
    scenarioIdOne,
    scenarioIdTwo,
  );
});
