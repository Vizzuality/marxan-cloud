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
  const projectIdOne: string = await fixtures.WhenProjectIsCreated(`BWA`);
  const scenarioIdOne: string = await fixtures.WhenScenarioIsCreated(
    projectIdOne,
    [IUCNCategory.NotApplicable],
  );
  const projectIdTwo: string = await fixtures.WhenProjectIsCreated(`ZMB`);
  const scenarioIdTwo: string = await fixtures.WhenScenarioIsCreated(
    projectIdTwo,
    [IUCNCategory.NotReported],
  );
  await fixtures.ThenProtectedAreaFiltersAreDifferent(
    scenarioIdOne,
    scenarioIdTwo,
  );
});
