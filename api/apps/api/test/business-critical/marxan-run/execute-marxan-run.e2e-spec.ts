import { PromiseType } from 'utility-types';
import { getFixtures } from './fixtures';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeAll(async () => {
  fixtures = await getFixtures();
});

afterAll(async () => {
  await fixtures.cleanup();
});

describe(`Marxan run`, () => {
  beforeAll(async () => {
    await fixtures.GivenUserIsLoggedIn();
    await fixtures.GivenProjectOrganizationExists();
    await fixtures.GivenScenarioExists(`Mouse`);
    await fixtures.GivenCostSurfaceTemplateFilled();
    await fixtures.WhenMarxanExecutionIsRequested();
    await fixtures.WhenMarxanExecutionIsCompleted();
    await fixtures.ThenResultsAreAvailable();
  });

  it(`should work in near future`, () => {
    expect(true).toBeTruthy();
  });
});
