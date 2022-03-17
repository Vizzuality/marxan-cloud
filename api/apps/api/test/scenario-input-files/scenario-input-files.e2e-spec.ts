import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './scenario-input-files.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`when getting input.zip`, () => {
  it(`as owner, should contain required input files`, async () => {
    const archiveResponse = await fixtures.WhenGettingArchivedInputAsOwner();
    await fixtures.ThenArchiveContainsRequiredFiles(archiveResponse);
  });
  it(`as contributor, should contain required input files`, async () => {
    await fixtures.GivenContributorWasAddedToScenario();
    const archiveResponse = await fixtures.WhenGettingArchivedInputAsContributor();
    await fixtures.ThenArchiveContainsRequiredFiles(archiveResponse);
  });
  it(`as viewer, should contain required input files`, async () => {
    await fixtures.GivenViewerWasAddedToScenario();
    const archiveResponse = await fixtures.WhenGettingArchivedInputAsViewer();
    await fixtures.ThenArchiveContainsRequiredFiles(archiveResponse);
  });
  it(`as user not in scenario, should contain required input files`, async () => {
    const archiveResponse = await fixtures.WhenGettingArchivedInputAsUserNotInScenario();
    fixtures.ThenForbiddenIsReturned(archiveResponse);
  });
});

describe(`when getting spec.dat`, () => {
  const snapshotToMatch = `"id	target	prop	spf	target2	targetocc	sepnum	sepdistance"`;

  it(`as owner, should resolve text/*`, async () => {
    expect(
      (await fixtures.WhenGettingSpecDatAsOwner()).text,
    ).toMatchInlineSnapshot(snapshotToMatch);
  });
  it(`as contributor, should resolve text/*`, async () => {
    await fixtures.GivenContributorWasAddedToScenario();
    expect(
      (await fixtures.WhenGettingSpecDatAsContributor()).text,
    ).toMatchInlineSnapshot(snapshotToMatch);
  });
  it(`as viewer, should resolve text/*`, async () => {
    await fixtures.GivenViewerWasAddedToScenario();
    expect(
      (await fixtures.WhenGettingSpecDatAsViewer()).text,
    ).toMatchInlineSnapshot(snapshotToMatch);
  });
  it(`as user not in scenario, should resolve text/*`, async () => {
    const response = await fixtures.WhenGettingSpecDatAsUserNotInScenario();
    fixtures.ThenForbiddenIsReturned(response);
  });
});

describe(`when getting input.dat`, () => {
  it(`as owner, should resolve text/*`, async () => {
    const text = (await fixtures.WhenGettingInputDatAsOwner()).text;
    expect(
      text.replace(
        /^_CLOUD_GENERATED_AT (.*)$/gm,
        '_CLOUD_GENERATED_AT __ISO_DATE__',
      ),
    ).toMatchInlineSnapshot(`
      "NUMREPS 10
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Alaska
      _CLOUD_GENERATED_AT __ISO_DATE__
      VERBOSITY 2
      SCENNAME output
      SAVESOLUTIONSMATRIX 3
      SAVERUN 3
      SAVEBEST 3
      SAVESUMMARY 3
      SAVESCEN 3
      SAVETARGMET 3
      SAVESUMSOLN 3
      SAVELOG 3
      SAVESNAPSTEPS 0
      SAVESNAPCHANGES 0
      SAVESNAPFREQUENCY 0
      PROP 0.5
      COOLFAC 0
      NUMITNS 1000000
      NUMTEMP 10000
      RUNMODE 1
      HEURTYPE -1
      RANDSEED -1
      BESTSCORE 0
      CLUMPTYPE 0
      ITIMPTYPE 0
      MISSLEVEL 1
      STARTTEMP 1000000
      COSTTHRESH 0
      THRESHPEN1 0
      THRESHPEN2 0
      "
    `);
  });
  it(`as contributor, should resolve text/*`, async () => {
    await fixtures.GivenContributorWasAddedToScenario();
    const text = (await fixtures.WhenGettingInputDatAsContributor()).text;
    expect(
      text.replace(
        /^_CLOUD_GENERATED_AT (.*)$/gm,
        '_CLOUD_GENERATED_AT __ISO_DATE__',
      ),
    ).toMatchInlineSnapshot(`
      "NUMREPS 10
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Alaska
      _CLOUD_GENERATED_AT __ISO_DATE__
      VERBOSITY 2
      SCENNAME output
      SAVESOLUTIONSMATRIX 3
      SAVERUN 3
      SAVEBEST 3
      SAVESUMMARY 3
      SAVESCEN 3
      SAVETARGMET 3
      SAVESUMSOLN 3
      SAVELOG 3
      SAVESNAPSTEPS 0
      SAVESNAPCHANGES 0
      SAVESNAPFREQUENCY 0
      PROP 0.5
      COOLFAC 0
      NUMITNS 1000000
      NUMTEMP 10000
      RUNMODE 1
      HEURTYPE -1
      RANDSEED -1
      BESTSCORE 0
      CLUMPTYPE 0
      ITIMPTYPE 0
      MISSLEVEL 1
      STARTTEMP 1000000
      COSTTHRESH 0
      THRESHPEN1 0
      THRESHPEN2 0
      "
    `);
  });
  it(`as viewer, should resolve text/*`, async () => {
    await fixtures.GivenViewerWasAddedToScenario();
    const text = (await fixtures.WhenGettingInputDatAsViewer()).text;
    expect(
      text.replace(
        /^_CLOUD_GENERATED_AT (.*)$/gm,
        '_CLOUD_GENERATED_AT __ISO_DATE__',
      ),
    ).toMatchInlineSnapshot(`
      "NUMREPS 10
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Alaska
      _CLOUD_GENERATED_AT __ISO_DATE__
      VERBOSITY 2
      SCENNAME output
      SAVESOLUTIONSMATRIX 3
      SAVERUN 3
      SAVEBEST 3
      SAVESUMMARY 3
      SAVESCEN 3
      SAVETARGMET 3
      SAVESUMSOLN 3
      SAVELOG 3
      SAVESNAPSTEPS 0
      SAVESNAPCHANGES 0
      SAVESNAPFREQUENCY 0
      PROP 0.5
      COOLFAC 0
      NUMITNS 1000000
      NUMTEMP 10000
      RUNMODE 1
      HEURTYPE -1
      RANDSEED -1
      BESTSCORE 0
      CLUMPTYPE 0
      ITIMPTYPE 0
      MISSLEVEL 1
      STARTTEMP 1000000
      COSTTHRESH 0
      THRESHPEN1 0
      THRESHPEN2 0
      "
    `);
  });
  it(`as user not in scenario, should resolve text/*`, async () => {
    const response = await fixtures.WhenGettingInputDatAsUserNotInScenario();
    fixtures.ThenForbiddenIsReturned(response);
  });
});
