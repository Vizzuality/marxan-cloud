import { PromiseType } from 'utility-types';
import { readFileSync } from 'fs';
import * as nock from 'nock';
import { v4 } from 'uuid';
import { last } from 'lodash';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import {
  ExecutionResult,
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';

import { bootstrapApplication, delay } from '../../utils';
import { GivenScenarioPuData } from '../../steps/given-scenario-pu-data-exists';
import { In, Repository } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeatureTag, ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan-geoprocessing/modules/features/features.geo.entity';
import { SandboxRunner } from '@marxan-geoprocessing/marxan-sandboxed-runner';
import { SingleRunAdapterModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/single-run-adapter.module';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`given input data is delayed`, () => {
  beforeEach(() => {
    fixtures.GivenInputFilesAreAvailable(500000);
  });

  test(`cancelling marxan run during fetching assets`, async (done) => {
    expect.assertions(1);

    fixtures
      .GivenMarxanIsRunning()
      .then(() => {
        done(`Shouldn't finish Marxan run.`);
      })
      .catch((error) => {
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
      const output = await fixtures.GivenMarxanIsRunning();
      fixtures.ThenHasValidOutput(output);
      await fixtures.ThenOutputScenarioPuDataWasPersisted();
      fixtures.ThenProgressWasReported();
    },
    60000 * 15,
  );

  test(`cancelling marxan run`, async (done) => {
    expect.assertions(1);

    fixtures
      .GivenMarxanIsRunning()
      .then(() => {
        done(`Shouldn't finish Marxan run.`);
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
  await fixtures.cleanup();
}, 50000);

const NUMBER_OF_FEATURES_IN_SAMPLE = 59;
const NUMBER_OF_PU_IN_SAMPLE = 12178;
const NUMBER_OF_RUNS = 100;

const getFixtures = async () => {
  const scenarioId = v4();
  const outputsIds: string[] = [];
  const scenarioFeatures: string[] = [];

  nock.disableNetConnect();

  const app = await bootstrapApplication();
  const featuresData: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry),
  );
  const scenarioFeatureRepo: Repository<ScenarioFeaturesData> = app.get(
    getRepositoryToken(ScenarioFeaturesData),
  );
  const scenariosPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(ScenariosPlanningUnitGeoEntity),
  );
  const puOutputRepo: Repository<OutputScenariosPuDataGeoEntity> = app.get(
    getRepositoryToken(OutputScenariosPuDataGeoEntity),
  );
  const metadataRepo: Repository<MarxanExecutionMetadataGeoEntity> = app.get(
    getRepositoryToken(MarxanExecutionMetadataGeoEntity),
  );
  const featuresOutputRepo: Repository<OutputScenariosFeaturesDataGeoEntity> = app.get(
    getRepositoryToken(OutputScenariosFeaturesDataGeoEntity),
  );
  // note that SandboxRunner may be both single and blm-calibration one
  const singleRunModuleContext = app.select(SingleRunAdapterModule);
  const sut: MarxanSandboxRunnerService = singleRunModuleContext.get(
    SandboxRunner,
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
      await scenariosPuDataRepo.delete({
        scenarioId,
      });
      await scenarioFeatureRepo.delete({
        scenarioId,
      });
      // featuresOutputRepo removes on cascade
      nockScope.done();
      nock.enableNetConnect();
    },
    progressMock: jest.fn(),
    async GivenMarxanIsRunning() {
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
    GivenScenarioPuDataExists: async () => {
      outputsIds.push(
        ...(
          await GivenScenarioPuData(
            scenariosPuDataRepo,
            scenarioId,
            NUMBER_OF_PU_IN_SAMPLE,
          )
        ).rows.map((r) => r.id),
      );
    },
    GivenScenarioDataExists: async () => {
      const feature = await featuresData.save(
        featuresData.create({
          featuresId: v4(),
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
              featuresDataId: feature.id,
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
