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
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { GivenUserExists } from '../steps/given-user-exists';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when an owner updates scenario with input data`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsOwner(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });

  // then
  it(`should return the same metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsOwner(
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
      "NUMREPS 10
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Fresh Alaska array
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
      PROP 1.5
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
      "
    `);
  });
});

describe(`when a contributor updates scenario with input data`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;
    await fixtures.GivenContributorWasAddedToScenario();

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsContributor(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });

  // then
  it(`should return the same metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsContributor(
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
      "NUMREPS 10
      INPUTDIR input
      PUNAME pu.dat
      SPECNAME spec.dat
      PUVSPRNAME puvspr.dat
      BOUNDNAME bound.dat
      OUTPUTDIR output
      _CLOUD_SCENARIO Save the world species
      _CLOUD_PROJECT Humanity for living.
      _CLOUD_ORGANIZATION Fresh Alaska array
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
      PROP 1.5
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
      "
    `);
  });
});

describe(`when a viewer updates scenario with input data`, () => {
  let scenarioId: string;
  let response: request.Response;
  let originalMetadata: Record<string, unknown> | undefined;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    await fixtures.GivenViewerWasAddedToScenario();

    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsViewer(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });

  // then
  it(`should return a forbidden error`, async () => {
    fixtures.ThenForbiddenWasReturned(response);
  });

  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsViewer(scenarioId, {
      metadata: originalMetadata,
    });
  });
});

describe(`when an owner user updates scenario with input data with verbosity`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsOwner(
      scenarioId,
      fixtures.scenarioMetadataWithVerbosity,
    );
  });

  // then
  it(`should return set metadata but without verbosity`, async () => {
    await fixtures.ThenScenarioHasMetadataAsOwner(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a contributor user updates scenario with input data with verbosity`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;
    await fixtures.GivenContributorWasAddedToScenario();

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsContributor(
      scenarioId,
      fixtures.scenarioMetadataWithVerbosity,
    );
  });

  // then
  it(`should return set metadata but without verbosity`, async () => {
    await fixtures.ThenScenarioHasMetadataAsContributor(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a viewer user updates scenario with input data with verbosity`, () => {
  let scenarioId: string;
  let response: request.Response;
  let originalMetadata: Record<string, unknown> | undefined;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    await fixtures.GivenViewerWasAddedToScenario();

    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsViewer(
      scenarioId,
      fixtures.scenarioMetadataWithVerbosity,
    );
  });

  // then
  it(`should return a forbidden error`, async () => {
    fixtures.ThenForbiddenWasReturned(response);
  });

  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsViewer(scenarioId, {
      metadata: originalMetadata,
    });
  });
});

describe(`when an owner updates scenario with input data with input keys`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsOwner(
      scenarioId,
      fixtures.scenarioMetadataWithInputKeys,
    );
  });

  // then
  it(`should return set metadata but without input keys`, async () => {
    await fixtures.ThenScenarioHasMetadataAsOwner(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a contributor updates scenario with input data with input keys`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = (await fixtures.GivenScenarioExists()).id;
    await fixtures.GivenContributorWasAddedToScenario();

    // when
    await fixtures.WhenUpdatesScenarioWithInputAsContributor(
      scenarioId,
      fixtures.scenarioMetadataWithInputKeys,
    );
  });

  // then
  it(`should return set metadata but without input keys`, async () => {
    await fixtures.ThenScenarioHasMetadataAsContributor(
      scenarioId,
      fixtures.scenarioMetadata,
    );
  });
});

describe(`when a viewer updates scenario with input data with input keys`, () => {
  let scenarioId: string;
  let response: request.Response;
  let originalMetadata: Record<string, unknown> | undefined;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    await fixtures.GivenViewerWasAddedToScenario();

    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsViewer(
      scenarioId,
      fixtures.scenarioMetadataWithInputKeys,
    );
  });

  // then
  it(`should return a forbidden error`, async () => {
    fixtures.ThenForbiddenWasReturned(response);
  });

  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsViewer(scenarioId, {
      metadata: originalMetadata,
    });
  });
});

describe(`when an owner updates scenario with invalid input data`, () => {
  let scenarioId: string;
  let originalMetadata: Record<string, unknown> | undefined;
  let response: request.Response;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsOwner(
      scenarioId,
      fixtures.scenarioMetadataInvalid,
    );
  });

  // then
  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsOwner(scenarioId, {
      metadata: originalMetadata,
    });
  });

  // and
  it(`should reject the request`, async () => {
    await fixtures.ThenRequestWasRejected(response);
  });
});

describe(`when a contributor updates scenario with invalid input data`, () => {
  let scenarioId: string;
  let originalMetadata: Record<string, unknown> | undefined;
  let response: request.Response;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    await fixtures.GivenContributorWasAddedToScenario();
    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsContributor(
      scenarioId,
      fixtures.scenarioMetadataInvalid,
    );
  });

  // then
  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsContributor(scenarioId, {
      metadata: originalMetadata,
    });
  });

  // and
  it(`should reject the request`, async () => {
    await fixtures.ThenRequestWasRejected(response);
  });
});

describe(`when a viewer updates scenario with invalid input data`, () => {
  let scenarioId: string;
  let originalMetadata: Record<string, unknown> | undefined;
  let response: request.Response;
  beforeEach(async () => {
    // given
    const scenarioData = await fixtures.GivenScenarioExists();
    scenarioId = scenarioData.id;
    originalMetadata = scenarioData.attributes.metadata;
    await fixtures.GivenViewerWasAddedToScenario();
    // when
    response = await fixtures.WhenUpdatesScenarioWithInputAsContributor(
      scenarioId,
      fixtures.scenarioMetadataInvalid,
    );
  });

  // then
  it(`should return a forbidden error`, async () => {
    fixtures.ThenForbiddenWasReturned(response);
  });

  it(`should return not changed metadata to user`, async () => {
    await fixtures.ThenScenarioHasMetadataAsViewer(scenarioId, {
      metadata: originalMetadata,
    });
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const cleanups: (() => Promise<unknown>)[] = [() => app.close()];
  const scenarios = app.get<Repository<Scenario>>(getRepositoryToken(Scenario));
  const ownerToken: string = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken: string = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken: string = await GivenUserIsLoggedIn(app, 'cc');
  let scenarioId: string;

  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  const fixtures = {
    async GivenScenarioExists() {
      const { projectId, cleanup } = await GivenProjectExists(
        app,
        ownerToken,
        {
          countryCode: 'NAM',
          name: 'Humanity for living.',
        },
        {
          name: 'Fresh Alaska array',
        },
      );
      cleanups.push(cleanup);
      const scenario = await ScenariosTestUtils.createScenario(
        app,
        ownerToken,
        {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId,
          name: 'Save the world species',
        },
      );
      cleanups.push(() => scenarios.delete(scenario.data.id));
      scenarioId = scenario.data.id;
      return scenario.data;
    },
    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),
    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),
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
    async WhenUpdatesScenarioWithInputAsOwner(
      id: string,
      input: {
        metadata: {
          marxanInputParameterFile: MarxanParameters;
        };
      },
    ) {
      return await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(input);
    },
    async WhenUpdatesScenarioWithInputAsContributor(
      id: string,
      input: {
        metadata: {
          marxanInputParameterFile: MarxanParameters;
        };
      },
    ) {
      return await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .send(input);
    },
    async WhenUpdatesScenarioWithInputAsViewer(
      id: string,
      input: {
        metadata: {
          marxanInputParameterFile: MarxanParameters;
        };
      },
    ) {
      return await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
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
    async ThenScenarioHasMetadataAsOwner(id: string, metadata: any) {
      const result = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
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
            customProtectedAreaIds: null,
            ranAtLeastOnce: false,
            status: null,
            type: 'marxan',
            wdpaIucnCategories: null,
            wdpaThreshold: null,
            ...metadata,
          },
          id,
          type: 'scenarios',
        },
        meta: {},
      });
    },
    async ThenScenarioHasMetadataAsContributor(id: string, metadata: any) {
      const result = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${contributorToken}`)
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
            customProtectedAreaIds: null,
            ranAtLeastOnce: false,
            status: null,
            type: 'marxan',
            wdpaIucnCategories: null,
            wdpaThreshold: null,
            ...metadata,
          },
          id,
          type: 'scenarios',
        },
        meta: {},
      });
    },
    async ThenScenarioHasMetadataAsViewer(id: string, metadata: any) {
      const result = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
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
            customProtectedAreaIds: null,
            ranAtLeastOnce: false,
            status: null,
            type: 'marxan',
            wdpaIucnCategories: null,
            wdpaThreshold: null,
            ...metadata,
          },
          id,
          type: 'scenarios',
        },
        meta: {},
      });
    },
    ThenRequestWasRejected(result: request.Response) {
      expect(result.status).toBe(400);
    },
    ThenForbiddenWasReturned(result: request.Response) {
      expect(result.status).toBe(403);
    },
  };
  return fixtures;
}
