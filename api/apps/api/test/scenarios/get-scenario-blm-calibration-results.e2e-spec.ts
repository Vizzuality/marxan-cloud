import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './get-scenario-blm-calibration-results.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe('get-scenario-blm-calibration-results', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 100000);

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it(`retrieves blm calibration results via API`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures.WhenBlmCalibrationIsLaunched();

    await fixtures.ThenCalibrationResultsShouldBeAvailableViaAPI();
  }, 100000);
});
