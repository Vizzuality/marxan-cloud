import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './get-scenario-blm-calibration-results.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe('get-scenario-blm-calibration-results', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 100000);

  it(`retrieves blm calibration results via API as owner`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures.WhenBlmCalibrationIsLaunchedAsOwner();

    await fixtures.ThenCalibrationResultsShouldBeAvailable();
  }, 100000);

  it(`retrieves blm calibration results as contributor`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();

    await fixtures.WhenContributorLaunchesCalibration();

    await fixtures.ThenCalibrationResultsShouldBeAvailable();
  }, 100000);

  it(`retrieves blm calibration results as viewer`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();

    const response = await fixtures.WhenViewerLaunchesCalibration();

    await fixtures.ThenForbiddenIsReturned(response);
  });
});
