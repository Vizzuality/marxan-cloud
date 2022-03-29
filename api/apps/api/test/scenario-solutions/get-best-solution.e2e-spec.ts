import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './solutions.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeAll(async () => {
  fixtures = await getFixtures();
});

describe(`When getting scenario best solution`, () => {
  beforeAll(async () => {
    await fixtures.GivenScenarioHasSolutionsReady();
  });

  afterAll(async () => {
    await fixtures?.cleanup();
  });

  it.only(`should return the correct response when the best solution cannot be found`, async () => {
    const response = await fixtures.WhenGettingBestSolutionAsOwner();
    fixtures.ThenNotFoundShouldBeResolved(response);
  });

  it(`should resolve best solution as owner`, async () => {
    const response = await fixtures.WhenGettingBestSolutionAsOwner();
    fixtures.ThenBestSolutionShouldBeResolved(response);
  });

  it(`should resolve best solution as contributor`, async () => {
    await fixtures.GivenContributorWasAddedToScenario();
    const response = await fixtures.WhenGettingBestSolutionAsContributor();
    fixtures.ThenBestSolutionShouldBeResolved(response);
  });

  it(`should resolve best solution as viewer`, async () => {
    await fixtures.GivenViewerWasAddedToScenario();
    const response = await fixtures.WhenGettingBestSolutionAsViewer();
    fixtures.ThenBestSolutionShouldBeResolved(response);
  });
});
