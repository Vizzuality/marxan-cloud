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

  it(`starts an scenario calibration properly without sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .WhenScenarioCalibrationIsLaunchedItShouldNotFail()
      .WithoutRange();
  });

  it(`starts an scenario calibration properly when sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .WhenScenarioCalibrationIsLaunchedItShouldNotFail()
      .WithRange();

    await fixtures.ThenWhenReadingProjectCalibrationItHasTheNewRange();
  });

  it(`throws an exception when providing an invalid range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures
      .ThenShouldFailWhenStartingAnScenarioCalibrationWithA()
      .RangeWithAMinGreaterThanMax();

    await fixtures
      .ThenShouldFailWhenStartingAnScenarioCalibrationWithA()
      .RangeWithValuesThatAreNotNumbers();
    await fixtures
      .ThenShouldFailWhenStartingAnScenarioCalibrationWithA()
      .RangeWithNegativeNumbers();
  });
});
