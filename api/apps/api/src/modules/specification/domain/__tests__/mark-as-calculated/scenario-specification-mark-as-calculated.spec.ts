import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

test(`draft specification with determined features marks all as calculated`, () => {
  const specification =
    fixtures.GivenCandidateDraftWasCreatedWithDeterminedFeatures();
  fixtures.WhenMarksAllAsCalculated(specification);
  fixtures.ThenSpecificationIsNotReady(specification);
});

test(`'created' specification with determined features marks all as calculated`, () => {
  const specification =
    fixtures.GivenCandidateWasCreatedWithDeterminedFeatures();
  fixtures.WhenMarksAllAsCalculated(specification);
  fixtures.ThenSpecificationIsReady(specification);
});

test(`'created' specification with determined features marks some as calculated`, () => {
  const specification =
    fixtures.GivenCandidateWasCreatedWithDeterminedFeatures();

  fixtures.WhenFeatureIsCalculated(
    specification,
    fixtures.nonCalculatedFeatureOne,
  );
  fixtures.ThenSpecificationIsNotReady(specification);
});

test(`'created' specification with determined features marks some as calculated in a few steps`, () => {
  const specification =
    fixtures.GivenCandidateWasCreatedWithDeterminedFeatures();

  fixtures.WhenFeatureIsCalculated(
    specification,
    fixtures.nonCalculatedFeatureOne,
  );
  fixtures.WhenFeatureIsCalculated(
    specification,
    fixtures.nonCalculatedFeatureTwo,
  );
  fixtures.ThenSpecificationIsReady(specification);
});
