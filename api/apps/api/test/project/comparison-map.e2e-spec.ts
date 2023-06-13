import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting comparison map for scenarios in pdf`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioIdA = await fixtures.GivenScenarioWasCreated(
    projectId,
    'Test Scenario A',
  );
  const scenarioIdB = await fixtures.GivenScenarioWasCreated(
    projectId,
    'Test Scenario B',
  );
  const response = await fixtures.WhenComparisonMapIsRequested(
    scenarioIdA,
    scenarioIdB,
  );
  fixtures.ThenCorrectPdfBufferIsReceived(response);
});
