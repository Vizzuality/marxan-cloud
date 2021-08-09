import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './activate-candidate-specification.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`activate current candidate specification`, async () => {
  fixtures.GivenScenarioSpecificationWithCandidateWasCreated();
  await fixtures.WhenActivatingCandidateSpecification();
  await fixtures.ThenScenarioSpecificationIsSaved();
  fixtures.ThenSpecificationIsActivated();
});

test(`activate not current specification candidate`, async () => {
  fixtures.GivenScenarioSpecificationWithCandidateWasCreated();
  const result = await fixtures.WhenActivatingAnotherSpecification();
  await fixtures.ThenSpecificationIsNotActivated(result);
});

test(`activate non-existing scenario specification`, async () => {
  const result = await fixtures.WhenActivatingAnotherSpecification();
  await fixtures.ThenSpecificationIsNotActivated(result);
});
