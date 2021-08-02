import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

describe(`When two features were submitted as draft`, () => {
  beforeEach(() => {
    fixtures.WhenCreatingCandidateWithTwoConfigurations();
  });

  test(`Then it informs that spec was created`, () => {
    fixtures.ThenCandidateSpecificationWasCreated();
  });

  describe(`When another draft was submitted`, () => {
    let previousSpecificationId: string;

    beforeEach(() => {
      previousSpecificationId = fixtures.scenarioSpec.getCandidateSpecification()!
        .id;

      fixtures.WhenCreatingCandidateWithTwoConfigurations();
    });

    test(`Then candidate was replaced`, () => {
      fixtures.ThenCandidateWasReplaced(previousSpecificationId);
    });
  });
});
