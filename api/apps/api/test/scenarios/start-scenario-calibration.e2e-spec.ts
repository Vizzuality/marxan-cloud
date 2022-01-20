import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './start-scenario-calibration.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe('start-scenario-calibration', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it(`starting a blm calibration without sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .WhenScenarioCalibrationIsLaunchedItShouldNotFail()
      .WithoutRange();
  });

  it(`starts a scenario calibration properly when sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .WhenScenarioCalibrationIsLaunchedItShouldNotFail()
      .WithRange();

    await fixtures.ThenWhenReadingProjectCalibrationItHasTheNewRange();
  });

  it(`throws an exception if an export is running`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .ThenShouldFailWhenStartingAScenarioCalibrationWithA()
      .RunningExport();
  });

  it(`throws an exception when providing an invalid range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .ThenShouldFailWhenStartingAScenarioCalibrationWithA()
      .RangeWithAMinGreaterThanMax();

    await fixtures
      .ThenShouldFailWhenStartingAScenarioCalibrationWithA()
      .RangeWithValuesThatAreNotNumbers();
    await fixtures
      .ThenShouldFailWhenStartingAScenarioCalibrationWithA()
      .RangeWithNegativeNumbers();
  });
});
