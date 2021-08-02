import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

describe(`Draft specification with non-calculated features determined`, () => {
  beforeEach(() => {
    fixtures.GivenCandidateDraftWasCreated();
    fixtures.WhenFeaturesAreDetermined(false);
  });

  test(`Then specification isn't published`, () => {
    fixtures.ThenSpecificationIsNotPublished();
  });
});

describe(`Draft specification with all-calculated features determined`, () => {
  beforeEach(() => {
    fixtures.GivenCandidateDraftWasCreated();
    fixtures.WhenFeaturesAreDetermined(true);
  });

  test(`Then specification isn't published`, () => {
    fixtures.ThenSpecificationIsNotPublished();
  });
});

describe(`"Created" specification with non-calculated features determined`, () => {
  beforeEach(() => {
    fixtures.GivenCandidateWasCreated();
    fixtures.WhenFeaturesAreDetermined(false);
  });

  test(`Then specification is published`, () => {
    fixtures.ThenSpecificationIsPublished();
  });
});

describe(`"Created" specification with features determined (proved to be already calculated)`, () => {
  beforeEach(() => {
    fixtures.GivenCandidateWasCreated();
    fixtures.WhenFeaturesAreDetermined(true);
  });

  test(`Then specification is activated`, () => {
    fixtures.ThenSpecificationIsActivated();
    fixtures.ThenSpecCandidateIsEmpty();
  });
});
