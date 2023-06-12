import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting comparison map for scenarios in pdf`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioIds = await fixtures.GivenTwoScenariosWereCreated(projectId);
  const response = await fixtures.WhenComparisonMapIsRequested(
    scenarioIds.scenarioIdA,
    scenarioIds.scenarioIdB,
  );
  fixtures.ThenCorrectPdfBufferIsReceived(response);
});
