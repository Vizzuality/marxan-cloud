import { PromiseType } from 'utility-types';
import { createWorld } from './world';

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeEach(async () => {
  world = await createWorld();
});

afterEach(async () => {
  await world?.cleanup();
});

describe(`when getting input.zip`, () => {
  it(`should contain required input files`, async () => {
    const archiveResponse = await world.WhenGettingArchivedInput();
    await world.ThenArchiveContainsRequiredFiles(archiveResponse);
  });
});

describe(`when getting spec.dat`, () => {
  it(`should resolve text/*`, async () => {
    expect((await world.WhenGettingSpecDat()).text).toMatchInlineSnapshot(
      `"id	target	prop	spf	target2	targetocc	sepnum	sepdistance"`,
    );
  });
});

describe(`when getting input.dat`, () => {
  it(`should resolve text/*`, async () => {
    const text = (await world.WhenGettingInputDat()).text;
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
});
