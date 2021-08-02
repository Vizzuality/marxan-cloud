import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ClumpType,
  HeuristicType,
  IterativeImprovementType,
  MarxanParameters,
  RunMode,
} from '@marxan/marxan-input';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { E2E_CONFIG } from '../e2e.config';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when a user updates scenario with input data`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInput(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });

  // then
  it(`should return the same metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadata(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });

  it(`should return the same metadata when accessing with x-api-key`, async () => {
    expect(
      (await fixtures.ThenScenarioHasMetadataForMarxan(scenarioId)).replace(
        /^_CLOUD_GENERATED_AT (.*)$/gm,
        '_CLOUD_GENERATED_AT __ISO_DATE__',
      ),
    ).toMatchInlineSnapshot(`
      "PROP 1.5
      COOLFAC 5
      NUMITNS 1000003
      NUMTEMP 10006
      RUNMODE 5
      HEURTYPE 1
      RANDSEED -1.5
      BESTSCORE 2
      CLUMPTYPE 3
      ITIMPTYPE 3
      MISSLEVEL 11
      STARTTEMP 1000004
      COSTTHRESH 7
      THRESHPEN1 8
      THRESHPEN2 9
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Fresh Alaska array
      _CLOUD_GENERATED_AT __ISO_DATE__
      VERBOSITY 2
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
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output"
    `);
  });
});

describe(`when a user updates scenario with input data with verbosity`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInput(
      scenarioId,
      fixtures.scenarioMetadataWithVerbosity,
    );
  });

  // then
  it(`should return set metdata but without verbosity`, async () => {
    await fixtures.ThenScenarioHasMetadata(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a user updates scenario with input data with input keys`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInput(
      scenarioId,
      fixtures.scenarioMetadataWithInputKeys,
    );
  });

  // then
  it(`should return set metdata but without input keys`, async () => {
    await fixtures.ThenScenarioHasMetadata(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a user updates scenario with invalid input data`, () => {
  let scenarioId: string;
  let originalMedatadata: Record<string, unknown> | undefined;
  let result: request.Response;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMedatadata = scenarioData.attributes.metadata;
    // when
    result = await fixtures.WhenUpdatesScenarioWithInput(
      scenarioId,
      fixtures.scenarioMetadataInvalid,
    );
  });

  // then
  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadata(scenarioId, {
      metadata: originalMedatadata,
    });
  });

  // and
  it(`should reject the request`, async () => {
    await fixtures.ThenRequestWasRejected(result);
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const cleanups: (() => Promise<unknown>)[] = [() => app.close()];
  const scenarios = app.get<Repository<Scenario>>(getRepositoryToken(Scenario));
  let jwtToken: string;
  const fixtures = {
    async GivenScenarioExists() {
      jwtToken = await GivenUserIsLoggedIn(app);
      const { projectId, cleanup } = await GivenProjectExists(
        app,
        jwtToken,
        {
          countryCode: 'NAM',
          name: 'Humanity for living.',
        },
        {
          name: 'Fresh Alaska array',
        },
      );
      cleanups.push(cleanup);
      const scenario = await ScenariosTestUtils.createScenario(app, jwtToken, {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId,
        name: 'Save the world species',
      });
      cleanups.push(() => scenarios.delete(scenario.data.id));
      return scenario.data;
    },
    async cleanup() {
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
    },
    get scenarioMetadata() {
      const params: MarxanParameters = {
        BLM: 2,
        PROP: 1.5,
        RANDSEED: -1.5,
        BESTSCORE: 2,
        NUMREPS: 12,
        NUMITNS: 1000003,
        STARTTEMP: 1000004,
        COOLFAC: 5,
        NUMTEMP: 10006,
        COSTTHRESH: 7,
        THRESHPEN1: 8,
        THRESHPEN2: 9,
        RUNMODE: RunMode.HeuristicAndIterativeImprovement,
        MISSLEVEL: 11,
        ITIMPTYPE: IterativeImprovementType.NormalFollowedByTwoStep,
        HEURTYPE: HeuristicType.Greedy,
        CLUMPTYPE: ClumpType.GraduatedPenalty,
      };
      return {
        metadata: {
          marxanInputParameterFile: params,
        },
      };
    },
    get scenarioMetadataWithVerbosity() {
      const metadata = fixtures.scenarioMetadata;
      (metadata.metadata.marxanInputParameterFile as any).VERBOSITY = 2;
      return metadata;
    },
    get scenarioMetadataWithInputKeys() {
      const metadata = fixtures.scenarioMetadata;
      (metadata.metadata.marxanInputParameterFile as any).INPUTDIR = 'inputdir';
      (metadata.metadata.marxanInputParameterFile as any).SPECNAME = 'specname';
      (metadata.metadata.marxanInputParameterFile as any).PUNAME = 'puname';
      (metadata.metadata.marxanInputParameterFile as any).PUVSPRNAME =
        'puvsprname';
      (metadata.metadata.marxanInputParameterFile as any).BOUNDNAME =
        'boundname';
      (metadata.metadata.marxanInputParameterFile as any).BLOCKDEFNAME =
        'blockdefname';
      return metadata;
    },
    get scenarioMetadataInvalid() {
      const metadata = fixtures.scenarioMetadata;
      metadata.metadata.marxanInputParameterFile.NUMITNS = 'dir' as any;
      return metadata;
    },
    async WhenUpdatesScenarioWithInput(
      id: string,
      input: {
        metadata: {
          marxanInputParameterFile: MarxanParameters;
        };
      },
    ) {
      return await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(input);
    },
    async ThenScenarioHasMetadataForMarxan(id: string) {
      return await request(app.getHttpServer())
        .get(`/api/v1/marxan-run/scenarios/${id}/marxan/dat/input.dat`)
        .set(
          'X-Api-Key',
          process.env.API_AUTH_X_API_KEY ?? 'sure it is valid in envs?',
        )
        .send()
        .then((response) => response.text);
    },
    async ThenScenarioHasMetadata(id: string, metadata: any) {
      const result = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .then((response) => response.body);

      expect(result).toStrictEqual({
        data: {
          attributes: {
            boundaryLengthModifier: null,
            createdAt: expect.any(String),
            description: null,
            id,
            lastModifiedAt: expect.any(String),
            name: expect.any(String),
            numberOfRuns: null,
            projectId: expect.any(String),
            protectedAreaFilterByIds: null,
            status: null,
            type: 'marxan',
            wdpaIucnCategories: null,
            wdpaThreshold: null,
            ...metadata,
          },
          id,
          type: 'scenarios',
        },
      });
    },
    ThenRequestWasRejected(result: request.Response) {
      expect(result.status).toBe(400);
    },
  };
  return fixtures;
}
