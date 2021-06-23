import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import {
  InputParameterFileProvider,
  ioSettingsToken,
} from './input-parameter-file.provider';
import { JobStatus, Scenario, ScenarioType } from './scenario.api.entity';
import { ScenariosCrudService } from './scenarios-crud.service';

jest.mock('config', () => ({
  get: () => 'value',
  has: () => true,
}));

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let sut: InputParameterFileProvider;

beforeEach(async () => {
  fixtures = await getFixtures();
  sut = fixtures.getInputParameterFileProvider();
});

describe(`when a full scenario available`, () => {
  let parameterFile: string;
  beforeEach(async () => {
    // given
    const scenarioId = await fixtures.hasInDb({
      ...fixtures.scenario(),
      ...fixtures.withBoundaryLengthModifier(),
      ...fixtures.withNumberOfRuns(),
      ...fixtures.withInputParameters(),
    });

    // when
    parameterFile = await sut.getInputParameterFile(scenarioId);
  });

  // then
  it(`should return a string with valid format`, () => {
    expect(parameterFile).toEqual(`BLM 0
NUMREPS 100
MARXANRUNKEY1 value1
MARXANRUNKEY2 value2
MARXANRUNKEY3 3
INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output`);
  });
});

describe(`when a full scenario with duplicated BLM & NUMREPS available`, () => {
  let parameterFile: string;
  beforeEach(async () => {
    // given
    const scenarioId = await fixtures.hasInDb({
      ...fixtures.scenario(),
      ...fixtures.withBoundaryLengthModifier(),
      ...fixtures.withNumberOfRuns(),
      ...fixtures.withInputParameters(),
    });

    // when
    parameterFile = await sut.getInputParameterFile(scenarioId);
  });

  // then
  it(`should return a file without duplications`, () => {
    expect(parameterFile).toEqual(`BLM 0
NUMREPS 100
MARXANRUNKEY1 value1
MARXANRUNKEY2 value2
MARXANRUNKEY3 3
INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output`);
  });
});
describe(`when a scenario without parameters`, () => {
  let parameterFile: string;
  beforeEach(async () => {
    // given
    const scenarioId = await fixtures.hasInDb({
      ...fixtures.scenario(),
    });

    // when
    parameterFile = await sut.getInputParameterFile(scenarioId);
  });

  // then
  it(`should return a file with only io settings`, () => {
    expect(parameterFile).toEqual(`INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output`);
  });
});

async function getFixtures() {
  class FakeScenario implements Pick<ScenariosCrudService, 'getById'> {
    db: Record<string, Scenario> = {};

    async getById(scenarioId: string): Promise<Scenario> {
      return this.db[scenarioId];
    }
  }

  const testingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      InputParameterFileProvider,
      {
        provide: ScenariosCrudService,
        useClass: FakeScenario,
      },
      {
        provide: ioSettingsToken,
        useValue: {
          INPUTDIR: 'input',
          PUNAME: 'pu.dat',
          SPECNAME: 'spec.dat',
          PUVSPRNAME: 'puvspr.dat',
          BOUNDNAME: 'bound.dat',
          OUTPUTDIR: 'output',
        },
      },
    ],
  }).compile();
  const fakeRepo: FakeScenario = testingModule.get(ScenariosCrudService);

  return {
    async hasInDb(scenario: Scenario) {
      fakeRepo.db[scenario.id] = scenario;
      return scenario.id;
    },
    scenario(): Scenario {
      return {
        createdAt: new Date(),
        createdBy: '',
        createdByUser: {} as any,
        id: 'anId',
        lastModifiedAt: new Date(),
        name: '',
        projectId: '',
        status: JobStatus.done,
        type: ScenarioType.marxanWithZones,
        users: [],
      };
    },
    withInputParameters() {
      return {
        metadata: {
          marxanInputParameterFile: {
            MARXANRUNKEY1: 'value1',
            MARXANRUNKEY2: 'value2',
            MARXANRUNKEY3: 3,
          },
        },
      };
    },
    withInputParametersContainingBLMAndNUMREPS() {
      return {
        metadata: {
          marxanInputParameterFile: {
            MARXANRUNKEY1: 'value1',
            MARXANRUNKEY2: 'value2',
            MARXANRUNKEY3: 3,
            BLM: 123,
            NUMREPS: 432,
          },
        },
      };
    },
    withBoundaryLengthModifier() {
      return {
        boundaryLengthModifier: 0,
      };
    },
    withNumberOfRuns() {
      return {
        numberOfRuns: 100,
      };
    },
    getInputParameterFileProvider() {
      return testingModule.get(InputParameterFileProvider);
    },
  };
}
