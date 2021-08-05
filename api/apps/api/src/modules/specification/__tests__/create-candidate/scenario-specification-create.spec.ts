import { getFixtures } from './fixtures';

let fixtures: ReturnType<typeof getFixtures>;

beforeEach(() => {
  fixtures = getFixtures();
});

test(`creating draft specification`, () => {
  const spec = fixtures.WhenDraftWithTwoConfigurationsCreates();
  fixtures.ThenSpecificationIsCreated(spec);
});
