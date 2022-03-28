import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './solutions.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`When getting scenario solution results`, () => {
  beforeEach(async () => {
    await fixtures.GivenScenarioHasSolutionsReady();
  });

  it(`should return the correct response when the given scenario id does not exists`, async () => {
    const response = await fixtures.WhenGettingSolutionsForAnScenarioThatDoesNotExists();

    fixtures.ThenScenarioNotFoundShouldBeResolved(response);
  });

  it(`should resolve solutions as owner`, async () => {
    const response = await fixtures.WhenGettingSolutionsAsOwner();
    fixtures.ThenSolutionsShouldBeResolved(response);
  });

  it(`should resolve solutions as contributor`, async () => {
    await fixtures.GivenContributorWasAddedToScenario();
    const response = await fixtures.WhenGettingSolutionsAsContributor();
    fixtures.ThenSolutionsShouldBeResolved(response);
  });

  it(`should resolve solutions as viewer`, async () => {
    await fixtures.GivenViewerWasAddedToScenario();
    const response = await fixtures.WhenGettingSolutionsAsViewer();
    fixtures.ThenSolutionsShouldBeResolved(response);
  });
});
