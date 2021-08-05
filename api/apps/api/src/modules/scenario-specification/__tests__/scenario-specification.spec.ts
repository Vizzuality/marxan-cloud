import { getFixtures } from './fixtures';
import { v4 } from 'uuid';
import { SpecificationId } from '../specification.id';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

test(`activate empty candidate`, () => {
  const scenarioSpecification = fixtures.GivenEmptyScenarioSpecification();
  const result = fixtures.WhenCandidateSpecificationIsActivated(
    scenarioSpecification,
  );
  fixtures.ThenNoCandidateIsRaised(result);
});

test(`activate candidate with different id`, () => {
  const scenarioSpecification = fixtures.GivenScenarioSpecificationWithCandidate();
  const result = fixtures.WhenCandidateSpecificationIsActivated(
    scenarioSpecification,
    new SpecificationId(v4()),
  );
  fixtures.ThenNoLongerACandidateIsRaised(result);
});

test(`activate current candidate`, () => {
  const scenarioSpecification = fixtures.GivenScenarioSpecificationWithCandidate();
  const result = fixtures.WhenCandidateSpecificationIsActivated(
    scenarioSpecification,
    scenarioSpecification.currentCandidateSpecification,
  );
  fixtures.ThenSpecificationIsActivated(scenarioSpecification, result);
  fixtures.ThenCandidateSpecificationIsRemoved(scenarioSpecification);
});

test(`assign candidate`, () => {
  const scenarioSpecification = fixtures.GivenScenarioSpecificationWithCandidate();
  const specification = fixtures.WhenCandidateSpecificationIsAssigned(
    scenarioSpecification,
  );
  fixtures.ThenCandidateSpecificationChanges(
    scenarioSpecification,
    specification,
  );
});
