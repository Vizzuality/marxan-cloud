import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './project-grid.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`submitting valid grid`, async () => {
  const projectId = await fixtures.GivenProjectWasCreated();
  const response = await fixtures.WhenSubmittingValidGridShapefile(projectId);
  await fixtures.ThenShapefileIsSubmittedToProcessing(response.body);
});
