import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarxanParametersDefaults } from '@marxan/marxan-input';
import { JobStatus, Scenario, ScenarioType } from '../../scenario.api.entity';
import { InputParameterFileProvider } from './input-parameter-file.provider';
import { ioSettingsToken } from './io-settings';
import { defaultBlmRange } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';
import { ProjectSourcesEnum } from '@marxan/projects';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());

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
INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output
_CLOUD_SCENARIO scenario name
_CLOUD_PROJECT project name
_CLOUD_ORGANIZATION n/a
_CLOUD_GENERATED_AT 2020-01-01T00:00:00.000Z
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
MARXANRUNKEY1 value1
MARXANRUNKEY2 value2
MARXANRUNKEY3 3
`);
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
INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output
_CLOUD_SCENARIO scenario name
_CLOUD_PROJECT project name
_CLOUD_ORGANIZATION n/a
_CLOUD_GENERATED_AT 2020-01-01T00:00:00.000Z
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
MARXANRUNKEY1 value1
MARXANRUNKEY2 value2
MARXANRUNKEY3 3
`);
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
  it(`should return a file with only io settings and program control`, () => {
    expect(parameterFile).toEqual(`NUMREPS 10
INPUTDIR input
PUNAME pu.dat
SPECNAME spec.dat
PUVSPRNAME puvspr.dat
BOUNDNAME bound.dat
OUTPUTDIR output
_CLOUD_SCENARIO scenario name
_CLOUD_PROJECT project name
_CLOUD_ORGANIZATION n/a
_CLOUD_GENERATED_AT 2020-01-01T00:00:00.000Z
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
`);
  });
});

async function getFixtures() {
  class FakeScenario implements Pick<Repository<Scenario>, 'findOne'> {
    db: Record<string, Scenario> = {};

    async findOne(findOneOptions: any): Promise<Scenario> {
      expect(findOneOptions).toHaveProperty('where.id');
      expect(findOneOptions).toHaveProperty('relations.project.organization');
      expect(typeof findOneOptions?.where?.id).toBe('string');
      expect(findOneOptions?.relations?.project?.organization).toBe(true);

      return this.db[findOneOptions?.where?.id];
    }
  }

  const testingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      InputParameterFileProvider,
      MarxanParametersDefaults,
      FakeScenario,
      {
        provide: getRepositoryToken(Scenario),
        useExisting: FakeScenario,
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
  const fakeRepo: FakeScenario = testingModule.get(FakeScenario);

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
        name: 'Scenario Name',
        projectId: '',
        scenarioBlm: {
          id: 'anId',
          values: [],
          defaults: [],
          range: defaultBlmRange,
        },
        costSurfaceId: '',
        costSurface: {
          id: '',
          name: 'some cost surface',
          projectId: '',
          isDefault: false,
          min: 0,
          max: 0,
          project: {
            name: 'Project Name',
            id: '',
            createdByUser: {} as any,
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            organizationId: '',
            createdBy: '',
            countryId: '',
            bbox: [0, 0, 0, 0, 0, 0],
            projectBlm: {
              id: '',
              range: [0, 0],
              values: [],
              defaults: [],
            },
            setIsPublicProperty: jest.fn(),
            sources: ProjectSourcesEnum.legacyImport,
          },
          createdAt: new Date(),
          lastModifiedAt: new Date(),
          scenarios: [],
        },
        project: {
          name: 'Project Name',
          id: '',
          createdByUser: {} as any,
          createdAt: new Date(),
          lastModifiedAt: new Date(),
          organizationId: '',
          createdBy: '',
          countryId: '',
          bbox: [0, 0, 0, 0, 0, 0],
          projectBlm: {
            id: '',
            range: [0, 0],
            values: [],
            defaults: [],
          },
          setIsPublicProperty: jest.fn(),
          sources: ProjectSourcesEnum.legacyImport,
        },
        status: JobStatus.created,
        type: ScenarioType.marxanWithZones,
        users: [],
        ranAtLeastOnce: false,
        solutionsAreLocked: false,
        projectScenarioId: 1,
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
