import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

test(`draft specification determines features with some being non calculated`, () => {
  const specification = fixtures.GivenCandidateDraftWasCreated();
  fixtures.WhenDeterminesFeatures(specification, false);
  fixtures.ThenSpecificationWasNotPublished(specification);
});

test(`draft specification determines features with all being calculated`, () => {
  const specification = fixtures.GivenCandidateDraftWasCreated();
  fixtures.WhenDeterminesFeatures(specification, true);
  fixtures.ThenSpecificationWasNotPublished(specification);
  fixtures.ThenSpecificationWasNotCalculated(specification);
});

test(`'created' specification determines features with some being non calculated`, () => {
  const specification = fixtures.GivenCandidateWasCreated();
  fixtures.WhenDeterminesFeatures(specification, false);
  fixtures.ThenSpecificationIsPublished(specification);
});

test(`'created' specification determines features with all being calculated`, () => {
  const specification = fixtures.GivenCandidateWasCreated();
  fixtures.WhenDeterminesFeatures(specification, true);
  fixtures.ThenSpecificationIsReady(specification);
});
