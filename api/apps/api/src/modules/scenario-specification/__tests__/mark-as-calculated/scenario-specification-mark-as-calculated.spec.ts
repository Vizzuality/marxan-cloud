import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

describe(`When marked one of pending calculations as done`, () => {
  beforeEach(() => {
    fixtures.scenarioSpec.markFeaturesAsCalculated([
      fixtures.nonCalculatedFeatureOne,
    ]);
  });

  test(`Then specification isn't yet activated`, () => {
    fixtures.ThenSpecificationIsNotActivated();
  });

  describe(`When marking remaining pending feature`, () => {
    beforeEach(() => {
      fixtures.scenarioSpec.markFeaturesAsCalculated([
        fixtures.nonCalculatedFeatureTwo,
      ]);
    });

    test(`ThenSpecificationIsActivated`, () => {
      fixtures.ThenSpecificationIsActivated();
    });
  });
});
