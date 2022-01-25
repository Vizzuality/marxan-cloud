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

  it(`starting a blm calibration as owner without sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    const response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsOwner()
      .WithoutRange();

    fixtures.ThenScenarioCalibrationIsCreated(response);
  });

  it(`starting a blm calibration as contributor without sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();

    const response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsContributor()
      .WithoutRange();

    fixtures.ThenScenarioCalibrationIsCreated(response);
  });

  it(`starting a blm calibration as viewer without sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();

    const response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsViewer()
      .WithoutRange();

    fixtures.ThenForbiddenIsReturned(response);
  });

  it(`starts an scenario calibration properly as owner when sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();

    let response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsOwner()
      .WithRange();
    fixtures.ThenScenarioCalibrationIsCreated(response);

    response = await fixtures.WhenReadingProjectCalibrationAsOwner();
    fixtures.ThenItHasTheUpdatedRange(response);
  });

  it(`starts an scenario calibration properly as contributor when sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();

    let response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsContributor()
      .WithRange();
    fixtures.ThenScenarioCalibrationIsCreated(response);

    response = await fixtures.WhenReadingProjectCalibrationAsContributor();
    fixtures.ThenItHasTheUpdatedRange(response);
  });

  it(`starts an scenario calibration properly as viewer when sending a range`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();

    let response = await fixtures
      .WhenScenarioCalibrationIsLaunchedAsViewer()
      .WithRange();
    fixtures.ThenForbiddenIsReturned(response);

    response = await fixtures.WhenReadingProjectCalibrationAsViewer();
    fixtures.ThenItHasNoUpdatedRange(response);
  });

  it(`throws an exception when providing an invalid range as owner`, async () => {
    await fixtures.GivenScenarioWasCreated();

    const minGreaterThanMaxResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsOwnerWithA()
      .RangeWithAMinGreaterThanMax();
    fixtures.ThenBadRequestIsReturned(minGreaterThanMaxResponse);
    const valuesNotNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsOwnerWithA()
      .RangeWithValuesThatAreNotNumbers();
    fixtures.ThenBadRequestIsReturned(valuesNotNumbersResponse);
    const negativeNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsOwnerWithA()
      .RangeWithNegativeNumbers();
    fixtures.ThenBadRequestIsReturned(negativeNumbersResponse);
  });

  it(`throws an exception when providing an invalid range as contributor`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();

    const minGreaterThanMaxResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsContributorWithA()
      .RangeWithAMinGreaterThanMax();
    fixtures.ThenBadRequestIsReturned(minGreaterThanMaxResponse);
    const valuesNotNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsContributorWithA()
      .RangeWithValuesThatAreNotNumbers();
    fixtures.ThenBadRequestIsReturned(valuesNotNumbersResponse);
    const negativeNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsContributorWithA()
      .RangeWithNegativeNumbers();
    fixtures.ThenBadRequestIsReturned(negativeNumbersResponse);
  });

  it(`throws an exception when providing an invalid range as viewer`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();

    /* This test checks for Bad Request and not Forbidden as the validator
    gets triggered before Nest can actually access the ACL check */
    const minGreaterThanMaxResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsViewerWithA()
      .RangeWithAMinGreaterThanMax();
    fixtures.ThenBadRequestIsReturned(minGreaterThanMaxResponse);
    const valuesNotNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsViewerWithA()
      .RangeWithValuesThatAreNotNumbers();
    fixtures.ThenBadRequestIsReturned(valuesNotNumbersResponse);
    const negativeNumbersResponse = await fixtures
      .WhenStartingAnScenarioCalibrationAsViewerWithA()
      .RangeWithNegativeNumbers();
    fixtures.ThenBadRequestIsReturned(negativeNumbersResponse);
  });

  it(`throws an exception if an export is running when starting calibration as owner`, async () => {
    await fixtures.GivenScenarioWasCreated();

    const response = await fixtures
      .WhenStartingAnScenarioCalibrationAsOwnerWithA()
      .RunningExport();

    fixtures.ThenBadRequestIsReturned(response);
  });
  it(`throws an exception if an export is running when starting calibration as contributor`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();

    const response = await fixtures
      .WhenStartingAnScenarioCalibrationAsContributorWithA()
      .RunningExport();

    fixtures.ThenBadRequestIsReturned(response);
  });
  it(`throws an exception if an export is running when starting calibration as viewer`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();

    const response = await fixtures
      .WhenStartingAnScenarioCalibrationAsViewerWithA()
      .RunningExport();

    fixtures.ThenForbiddenIsReturned(response);
  });
});
