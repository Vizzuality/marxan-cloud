import { MarxanInput } from './marxan-input';
import { HeuristicType, RunMode } from './marxan-parameters';

const sut = new MarxanInput();

describe(`when providing unsupported values for enums`, () => {
  it(`should throw`, () => {
    expect.assertions(1);
    try {
      sut.from({
        HEURTYPE: 9999999 as HeuristicType,
      });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});

describe(`when unwanted properties are provided`, () => {
  it(`should skip them`, () => {
    const params = sut.from({
      VERBOSITY: 3,
      SAVESUMMARY: 0,
      OUTPUTDIR: '/etc/passwd',
    } as any);

    expect('VERBOSITY' in params).toBeFalsy();
    expect('SAVESUMMARY' in params).toBeFalsy();
    expect('OUTPUTDIR' in params).toBeFalsy();
    expect('BLM' in params).toBeTruthy();
  });
});

describe(`when providing some values`, () => {
  const input = {
    HEURTYPE: HeuristicType.SummationIrreplaceability,
    MISSLEVEL: 999,
    BESTSCORE: 1337,
    RUNMODE: RunMode.OnlySimulatedAnnealing,
  };
  it(`should override defaults`, () => {
    const params = sut.from(input);
    expect(params).toMatchSnapshot();
  });
});

describe(`when empty input is provided`, () => {
  it(`should resolve to defaults`, () => {
    expect(sut.from({})).toMatchInlineSnapshot(`
      MarxanParameters {
        "BESTSCORE": 0,
        "BLM": 1,
        "CLUMPTYPE": 0,
        "COOLFAC": 0,
        "COSTTHRESH": 0,
        "HEURTYPE": -1,
        "ITIMPTYPE": 0,
        "MISSLEVEL": 1,
        "NUMITNS": 1000000,
        "NUMREPS": 10,
        "NUMTEMP": 10000,
        "PROP": 0.5,
        "RANDSEED": -1,
        "RUNMODE": 1,
        "STARTTEMP": 1000000,
        "THRESHPEN1": 0,
        "THRESHPEN2": 0,
      }
    `);
  });
});
