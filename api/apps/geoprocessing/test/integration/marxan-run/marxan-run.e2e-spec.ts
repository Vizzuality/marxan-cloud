import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import { SingleRunAdapterModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/single-run-adapter.module';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { sandboxRunnerToken } from '@marxan-geoprocessing/modules/scenarios/runs/tokens';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ScenarioFeaturesData } from '@marxan/features';
import {
  ExecutionResult,
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { last } from 'lodash';
import * as nock from 'nock';
import { EntityManager, In, Repository } from 'typeorm';
import { PromiseType } from 'utility-types';
import { v4 } from 'uuid';
import { GivenScenarioAndProjectPuData } from '../../steps/given-scenario-pu-data-exists';
import { bootstrapApplication } from '../../utils';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

const TEST_TIMEOUT_MULTIPLIER = 35000;

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`given input data is delayed`, () => {
  beforeEach(async () => {
    fixtures.GivenInputFilesAreAvailable(500000);
    await fixtures.GivenScenarioExistsInApiDb();
  });
  afterEach(async () => {
    await fixtures.apiDbCleanup();
  });

  test(
    `cancelling marxan run during fetching assets shouldn't finish Marxan run.`,
    async () => {
      expect.assertions(2);
      setTimeout(fixtures.WhenKillingMarxanRun, 1000);
      try {
        await fixtures.GivenBLMCalibrationIsRunning();
        fail();
      } catch (e) {
        await fixtures.ThenRanAtLeastOncePropertyForScenarioIsFalse();
        expect(e).toHaveProperty('signal', 'SIGTERM');
      }
    },
    TEST_TIMEOUT_MULTIPLIER,
  );
});

describe(`given input data is available`, () => {
  beforeEach(async () => {
    // We add a delay to the file loading mocks, so we can
    // artificially extend the duration of the Marxan run
    // thus ensuring it's still running when we cancel it
    fixtures.GivenInputFilesAreAvailable(500);
    await fixtures.GivenScenarioDataExists();
    await fixtures.GivenScenarioPuDataExists();
    await fixtures.GivenScenarioExistsInApiDb();
  }, TEST_TIMEOUT_MULTIPLIER * 4);
  afterEach(async () => {
    await fixtures.apiDbCleanup();
  });
  test(
    `marxan run during binary execution`,
    async () => {
      const output = await fixtures.GivenBLMCalibrationIsRunning();
      fixtures.ThenHasValidOutput(output);
      await fixtures.ThenOutputScenarioPuDataWasPersisted();
      fixtures.ThenProgressWasReported();
      await fixtures.ThenRanAtLeastOncePropertyForScenarioIsTrue();
    },
    TEST_TIMEOUT_MULTIPLIER * 30,
  );

  test(
    `cancelling marxan run shouldn't finish Marxan run.`,
    async () => {
      expect.assertions(1);

      setTimeout(fixtures.WhenKillingMarxanRun, 1000);
      try {
        await fixtures.GivenBLMCalibrationIsRunning();
        fail();
      } catch (e) {
        expect(JSON.parse(e)).toHaveProperty('signal', 'SIGTERM');
      }
      //return expect(     fixtures.GivenBLMCalibrationIsRunning(),     ).rejects.toHaveProperty('signal', 'SIGTERM');
    },
    TEST_TIMEOUT_MULTIPLIER,
  );
});

afterEach(async () => {
  await fixtures.cleanup();
}, TEST_TIMEOUT_MULTIPLIER * 2);

const NUMBER_OF_FEATURES_IN_SAMPLE = 59;
const NUMBER_OF_PU_IN_SAMPLE = 12178;
const NUMBER_OF_RUNS = 100;

const getFixtures = async () => {
  const projectId = v4();
  const scenarioId = v4();
  const featureId = v4();
  const costSurfaceId = v4();
  const organizationId = v4();
  const outputsIds: string[] = [];
  const scenarioFeatures: string[] = [];

  nock.disableNetConnect();

  const app = await bootstrapApplication();
  const entityManager = app.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager: EntityManager = app.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const featuresData: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry),
  );
  const scenarioFeatureRepo: Repository<ScenarioFeaturesData> = app.get(
    getRepositoryToken(ScenarioFeaturesData),
  );
  const planningUnitsGeomRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const puOutputRepo: Repository<OutputScenariosPuDataGeoEntity> = app.get(
    getRepositoryToken(OutputScenariosPuDataGeoEntity),
  );
  const metadataRepo: Repository<MarxanExecutionMetadataGeoEntity> = app.get(
    getRepositoryToken(MarxanExecutionMetadataGeoEntity),
  );
  const featuresOutputRepo: Repository<OutputScenariosFeaturesDataGeoEntity> =
    app.get(getRepositoryToken(OutputScenariosFeaturesDataGeoEntity));
  // note that SandboxRunner may be both single and blm-calibration one
  const singleRunModuleContext = app.select(SingleRunAdapterModule);
  const sut: MarxanSandboxRunnerService =
    singleRunModuleContext.get(sandboxRunnerToken);

  const nockScope = nock(host, {
    reqheaders: {
      'x-api-key':
        process.env.API_AUTH_X_API_KEY ?? 'sure it is valid in envs?',
    },
  });
  return {
    cleanup: async () => {
      await metadataRepo.delete({
        scenarioId,
      });
      await puOutputRepo.delete({});
      await featuresData.delete({
        featureId,
      });
      const projectPus = await entityManager.find(ProjectsPuEntity, {
        where: { projectId },
      });
      await planningUnitsGeomRepo.delete({
        id: In(projectPus.map((pu) => pu.geomId)),
      });
      // featuresOutputRepo removes on cascade
      nockScope.done();
      nock.enableNetConnect();
    },

    apiDbCleanup: async () => {
      await apiEntityManager.query(`DELETE FROM scenarios WHERE id = $1`, [
        scenarioId,
      ]);
      await apiEntityManager.query(`DELETE FROM projects WHERE id = $1`, [
        projectId,
      ]);
      await apiEntityManager.query(`DELETE FROM organizations WHERE id = $1`, [
        organizationId,
      ]);
      nockScope.done();
      nock.enableNetConnect();
    },
    progressMock: jest.fn(),
    async GivenBLMCalibrationIsRunning() {
      return await sut.run(
        {
          scenarioId,
          assets: resources.map((resource) => ({
            url: host + resource.assetUrl,
            relativeDestination: resource.targetRelativeDestination,
          })),
        },
        (value) => {
          this.progressMock(value);
        },
      );
    },
    WhenKillingMarxanRun: () => sut.kill(scenarioId),
    GivenInputFilesAreAvailable: (delayMs = 0) =>
      resources.forEach((resource) => {
        nockScope
          .get(resource.assetUrl)
          .delay(delayMs)
          .reply(200, resourceResponse(resource.targetRelativeDestination), {
            'content-type': 'plain/text',
          });
      }),
    GivenScenarioExistsInApiDb: async () => {
      await apiEntityManager.query(
        `INSERT INTO organizations (id, name) VALUES ($1, $2)`,
        [organizationId, 'test_organization'],
      );
      await apiEntityManager.query(
        `INSERT INTO projects (id, name, organization_id, sources) VALUES ($1, $2, $3, $4)`,
        [projectId, 'test_project', organizationId, 'legacy_import'],
      );
      await apiEntityManager.query(
        `INSERT INTO cost_surfaces (id, name, project_id, is_default, min, max) VALUES ($1, $2, $3, $4, $5, $6)`,
        [costSurfaceId, 'test_cost_surface', projectId, true, 0, 0],
      );
      await apiEntityManager.query(
        `INSERT INTO scenarios (id, name, project_id, cost_surface_id) VALUES ($1, $2, $3, $4)`,
        [scenarioId, 'test_scenario', projectId, costSurfaceId],
      );
    },
    GivenScenarioPuDataExists: async () => {
      outputsIds.push(
        ...(
          await GivenScenarioAndProjectPuData(
            entityManager,
            projectId,
            scenarioId,
            NUMBER_OF_PU_IN_SAMPLE,
          )
        ).rows.map((r) => r.id),
      );
    },
    GivenScenarioDataExists: async () => {
      const feature = await featuresData.save(
        featuresData.create({
          featureId,
          properties: {
            foo: v4(),
          },
          theGeom: {
            type: 'Polygon',
            coordinates: [
              [
                [-3.7023925781249996, 40.657722371758105],
                [-4.3450927734375, 40.029717557833266],
                [-3.04046630859375, 39.9434364619742],
                [-3.7023925781249996, 40.657722371758105],
              ],
            ],
          },
        }),
      );
      scenarioFeatures.push(
        ...(
          await scenarioFeatureRepo.save(
            [...Array(NUMBER_OF_FEATURES_IN_SAMPLE).keys()].map((index) => ({
              scenarioId,
              featureId: index + 1,
              coverageTarget: 0,
              coverageTargetArea: 1000,
              featureDataId: feature.id,
              apiFeatureId: featureId,
              currentArea: 200,
              fpf: 1,
              met: 1,
              target: 300,
              metArea: 200,
              onTarget: false,
              target2: 200,
              totalArea: 40000,
              metadata: {},
            })),
          )
        ).map((entity) => entity.id),
      );
    },
    ThenHasValidOutput(output: ExecutionResult) {
      expect(output.length).toEqual(100);
    },
    ThenOutputScenarioPuDataWasPersisted: async () => {
      expect(
        await puOutputRepo.count({
          where: {
            scenarioPuId: In(outputsIds),
          },
        }),
      ).toEqual(12178);
      expect(
        await featuresOutputRepo.count({
          where: {
            scenarioFeaturesId: In(scenarioFeatures),
          },
        }),
      ).toEqual(NUMBER_OF_FEATURES_IN_SAMPLE * NUMBER_OF_RUNS);
    },
    ThenProgressWasReported() {
      // checking only the last call, otherwise the test is flaky as it depends on chunking the buffer
      const { calls } = this.progressMock.mock;
      expect(last(calls)).toEqual([1]);
    },

    ThenRanAtLeastOncePropertyForScenarioIsFalse: async () => {
      const scenario = await apiEntityManager.query(
        `SELECT * FROM scenarios WHERE id = $1;`,
        [scenarioId],
      );
      expect(scenario[0].ran_at_least_once).toBe(false);
    },

    ThenRanAtLeastOncePropertyForScenarioIsTrue: async () => {
      const scenario = await apiEntityManager.query(
        `SELECT * FROM scenarios WHERE id = $1;`,
        [scenarioId],
      );
      expect(scenario[0].ran_at_least_once).toBe(true);
    },
  };
};

const host = `http://localhost:3000`;
const resources = [
  {
    name: `input.dat`,
    assetUrl: `/input.dat`,
    targetRelativeDestination: `input.dat`,
  },
  {
    name: `pu.dat`,
    assetUrl: `/pu.dat`,
    targetRelativeDestination: `input/pu.dat`,
  },
  {
    name: `spec.dat`,
    assetUrl: `/spec.dat`,
    targetRelativeDestination: `input/spec.dat`,
  },
  {
    name: `puvsp.dat`,
    assetUrl: `/puvsp.dat`,
    targetRelativeDestination: `input/puvsp.dat`,
  },
  {
    name: `puvsp_sporder.dat`,
    assetUrl: `/puvsp_sporder.dat`,
    targetRelativeDestination: `input/puvsp_sporder.dat`,
  },
  {
    name: `bound.dat`,
    assetUrl: `/bound.dat`,
    targetRelativeDestination: `input/bound.dat`,
  },
];

const resourceResponse = (resourceAddress: string) =>
  readFileSync(
    process.cwd() +
      `/apps/geoprocessing/src/marxan-sandboxed-runner/__mocks__/sample-input/${resourceAddress}`,
  );
