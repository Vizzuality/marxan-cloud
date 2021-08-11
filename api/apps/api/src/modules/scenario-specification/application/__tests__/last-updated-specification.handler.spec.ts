import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './last-updated-specification.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`getting on non existing scenario`, async () => {
  const result = await fixtures.WhenGettingLastUpdatedSpecification();
  fixtures.ThenItIsNotFound(result);
});

test(`getting on scenario with no specifications`, async () => {
  const { scenarioId } = await fixtures.GivenScenarioWasCreated(false, false);
  const result = await fixtures.WhenGettingLastUpdatedSpecification(scenarioId);
  fixtures.ThenItIsNotFound(result);
});

test(`getting on scenario with candidate specification`, async () => {
  const { scenarioId, candidateId } = await fixtures.GivenScenarioWasCreated(
    true,
    false,
  );
  const result = await fixtures.WhenGettingLastUpdatedSpecification(scenarioId);
  fixtures.ThenSpecificationIsFound(result, candidateId);
});

test(`getting on scenario with both candidate and active specification`, async () => {
  const { scenarioId, activeId } = await fixtures.GivenScenarioWasCreated(
    true,
    true,
  );
  const result = await fixtures.WhenGettingLastUpdatedSpecification(scenarioId);
  fixtures.ThenSpecificationIsFound(result, activeId);
});
