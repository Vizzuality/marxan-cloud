import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './solutions.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(`When getting scenario best solution`, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();

    await fixtures.GivenScenarioHasSolutionsReady();
  });

  it(`should return the correct response when the given scenario id does not exists`, async () => {
    const response = await fixtures.WhenGettingBestSolutionForAnScenarioThatDoesNotExists();

    fixtures.ThenScenarioNotFoundShouldBeResolved(response);
  });

  it(`should return the correct response when the best solution cannot be found`, async () => {
    await fixtures.GivenScenarioDoesNotHaveBestSolutionReady();

    const response = await fixtures.WhenGettingBestSolutionAsOwner();

    fixtures.ThenBestSolutionNotFoundShouldBeResolved(response);
  });

  it(`should resolve best solution as owner`, async () => {
    await fixtures.GivenScenarioHasBestSolutionReady();

    const response = await fixtures.WhenGettingBestSolutionAsOwner();

    fixtures.ThenBestSolutionShouldBeResolved(response);
  });

  it(`should resolve best solution as contributor`, async () => {
    await fixtures.GivenScenarioHasBestSolutionReady();
    await fixtures.GivenContributorWasAddedToScenario();

    const response = await fixtures.WhenGettingBestSolutionAsContributor();

    fixtures.ThenBestSolutionShouldBeResolved(response);
  });

  it(`should resolve best solution as viewer`, async () => {
    await fixtures.GivenScenarioHasBestSolutionReady();
    await fixtures.GivenViewerWasAddedToScenario();

    const response = await fixtures.WhenGettingBestSolutionAsViewer();

    fixtures.ThenBestSolutionShouldBeResolved(response);
  });
});
