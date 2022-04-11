import { BlmPartialResultEntity } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.geo.entity';
import {
  BlmRunAdapterModule,
  blmSandboxRunner,
} from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-run-adapter.module';
import { MarxanSandboxBlmRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/marxan-sandbox-blm-runner.service';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { FeatureTag, ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  ExecutionResult,
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { last } from 'lodash';
import * as nock from 'nock';
import { EntityManager, In, Repository } from 'typeorm';
import { PromiseType } from 'utility-types';
import { v4 } from 'uuid';
import { GivenScenarioPuData } from '../../steps/given-scenario-pu-data-exists';
import { delay } from '../../utils';
import { Test } from '@nestjs/testing';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { GivenScenarioExists } from '../clonning/fixtures';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`given input data is delayed`, () => {
  beforeEach(() => {
    fixtures.GivenInputFilesAreAvailable(500000);
  });

  test(`cancelling blm calibration run during fetching assets`, async (done) => {
    expect.assertions(1);

    fixtures
      .GivenBLMCalibrationIsRunning()
      .then(() => {
        throw new Error(`BLM calibration run shouldn't finish`);
      })
      .catch(async (error) => {
        expect(error.signal).toEqual('SIGTERM');
        done();
      });

    await delay(1000);
    fixtures.WhenKillingMarxanRun();
  }, 30000);
});

describe(`given input data is available`, () => {
  beforeEach(async () => {
    fixtures.GivenInputFilesAreAvailable();
    await fixtures.GivenScenarioDataExists();
    await fixtures.GivenScenarioPuDataExists();
  }, 60000 * 2);

  test(
    `marxan run during binary execution`,
    async () => {
      await fixtures.GivenBLMCalibrationIsRunning();
      await fixtures.ThenBlmFinalResultsArePersisted();
      await fixtures.ThenBlmPartialResultsHaveBeenDeleted();
    },
    60000 * 15,
  );

  test(`cancelling BLM calibration run`, async (done) => {
    expect.assertions(1);

    fixtures
      .GivenBLMCalibrationIsRunning()
      .then(() => {
        done(`Shouldn't finish BLM calibration run.`);
      })
      .catch((error) => {
        expect(JSON.parse(error).signal).toEqual('SIGTERM');
        done();
      });

    await delay(1000);
    fixtures.WhenKillingMarxanRun();
  }, 30000);
});

afterEach(async () => {
  await fixtures?.cleanup();
}, 50000);

const NUMBER_OF_FEATURES_IN_SAMPLE = 59;
const NUMBER_OF_PU_IN_SAMPLE = 12178;
const NUMBER_OF_RUNS = 100;

const getFixtures = async () => {
  const projectId = v4();
  const organizationId = v4();
  const scenarioId = v4();
  const featureId = v4();
  const outputsIds: string[] = [];
  const scenarioFeatures: string[] = [];

  nock.disableNetConnect();

  const app = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([]),
      TypeOrmModule.forFeature([], geoprocessingConnections.apiDB.name),
      BlmRunAdapterModule,
    ],
  }).compile();

  const apiEntityManager: EntityManager = app.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  await GivenScenarioExists(
    apiEntityManager,
    scenarioId,
    projectId,
    organizationId,
  );
  const entityManager = app.get<EntityManager>(getEntityManagerToken());
  const featuresData: Repository<GeoFeatureGeometry> = entityManager.getRepository(
    GeoFeatureGeometry,
  );
  const scenarioFeatureRepo: Repository<ScenarioFeaturesData> = entityManager.getRepository(
    ScenarioFeaturesData,
  );
  const planningUnitsGeomRepo: Repository<PlanningUnitsGeom> = entityManager.getRepository(
    PlanningUnitsGeom,
  );
  const puOutputRepo: Repository<OutputScenariosPuDataGeoEntity> = entityManager.getRepository(
    OutputScenariosPuDataGeoEntity,
  );
  const metadataRepo: Repository<MarxanExecutionMetadataGeoEntity> = entityManager.getRepository(
    MarxanExecutionMetadataGeoEntity,
  );
  const featuresOutputRepo: Repository<OutputScenariosFeaturesDataGeoEntity> = entityManager.getRepository(
    OutputScenariosFeaturesDataGeoEntity,
  );
  const blmFinalResultsRepo: Repository<BlmFinalResultEntity> = entityManager.getRepository(
    BlmFinalResultEntity,
  );
  const blmPartialResultsRepo: Repository<BlmPartialResultEntity> = entityManager.getRepository(
    BlmPartialResultEntity,
  );
  // note that SandboxRunner may be both single and blm-calibration one
  const runModuleContext = app.select(BlmRunAdapterModule);

  const sut: MarxanSandboxBlmRunnerService = runModuleContext.get(
    blmSandboxRunner,
  );

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

      const projectPus = await entityManager.find(ProjectsPuEntity, {
        where: { projectId },
      });
      await planningUnitsGeomRepo.delete({
        id: In(projectPus.map((pu) => pu.geomId)),
      });

      await featuresData.delete({
        featureId,
      });
      await blmFinalResultsRepo.delete({
        scenarioId,
      });
      // featuresOutputRepo removes on cascade
      nockScope.done();
      nock.enableNetConnect();
    },
    progressMock: jest.fn(),
    async GivenBLMCalibrationIsRunning() {
      return await sut.run(
        {
          blmValues: [0.1, 1, 10],
          scenarioId,
          assets: resources.map((resource) => ({
            url: host + resource.assetUrl,
            relativeDestination: resource.targetRelativeDestination,
          })),
          config: { baseUrl: 'example/png', cookie: 'randomPngCookie' },
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
    GivenScenarioPuDataExists: async () => {
      outputsIds.push(
        ...(
          await GivenScenarioPuData(
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
              currentArea: 200,
              fpf: 1,
              met: 1,
              tag: FeatureTag.Bioregional,
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
            featureScenarioId: In(scenarioFeatures),
          },
        }),
      ).toEqual(NUMBER_OF_FEATURES_IN_SAMPLE * NUMBER_OF_RUNS);
    },
    ThenBlmFinalResultsArePersisted: async () => {
      const count = await blmFinalResultsRepo.count({
        where: { scenarioId },
      });
      expect(count).toEqual(3);
    },
    ThenBlmPartialResultsHaveBeenDeleted: async () => {
      const count = await blmPartialResultsRepo.count({
        where: { scenarioId },
      });
      expect(count).toEqual(0);
    },
    ThenProgressWasReported() {
      // checking only the last call, otherwise the test is flaky as it depends on chunking the buffer
      const { calls } = this.progressMock.mock;
      expect(last(calls)).toEqual([1]);
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
