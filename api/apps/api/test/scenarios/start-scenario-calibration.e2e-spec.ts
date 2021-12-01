import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './start-scenario-calibration.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`starting an scenario calibration should work without sending a range`, async () => {
  await fixtures.GivenScenarioWasCreated();

  await fixtures
    .WhenScenarioCalibrationIsLaunchedItShouldNotFail()
    .WithoutRange();
});

test(`starting an scenario calibration should work when sending a range`, async () => {
  await fixtures.GivenScenarioWasCreated();

  await fixtures.WhenScenarioCalibrationIsLaunchedItShouldNotFail().WithRange();

  await fixtures.ThenWhenReadingProjectCalibrationItHasTheNewRange();
});

test(`updating a project calibration with incorrect ranges should throw an exception`, async () => {
  await fixtures.GivenScenarioWasCreated();

  await fixtures
    .ThenShouldFailWhenUpdatingProjectCalibrationWithA()
    .RangeWithAMinGreaterThanMax();
  await fixtures
    .ThenShouldFailWhenUpdatingProjectCalibrationWithA()
    .RangeWithValuesThatAreNotNumbers();
  await fixtures
    .ThenShouldFailWhenUpdatingProjectCalibrationWithA()
    .RangeWithNegativeNumbers();
});
