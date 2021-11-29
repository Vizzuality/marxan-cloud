import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './update-project-calibration.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`updating a project calibration range should work`, async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.WhenProjectCalibrationIsUpdated();

  await fixtures.ThenWhenReadingProjectCalibrationItHasTheNewRange();
});

test(`updating a project calibration with incorrect ranges should throw an exception`, async () => {
  await fixtures.GivenProjectWasCreated();

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
