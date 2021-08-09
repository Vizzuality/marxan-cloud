import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`assign new candidate specification`, async () => {
  fixtures.GivenScenarioSpecificationWithNoCandidateWasCreated();
  await fixtures.WhenAssigningNewCandidateSpecification();
  await fixtures.ThenScenarioSpecificationIsSaved();
  fixtures.ThenCandidateSpecificationChanged();
});
