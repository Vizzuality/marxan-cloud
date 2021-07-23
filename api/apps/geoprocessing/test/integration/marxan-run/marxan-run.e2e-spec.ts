import { PromiseType } from 'utility-types';
import { readFileSync } from 'fs';
import * as nock from 'nock';
import { v4 } from 'uuid';
import { last } from 'lodash';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import {
  ExecutionResult,
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';

import { bootstrapApplication, delay } from '../../utils';
import { GivenScenarioPuData } from '../../steps/given-scenario-pu-data-exists';
import { In, Repository } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { getRepositoryToken } from '@nestjs/typeorm';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`given input data is delayed`, () => {
  beforeEach(() => {
    fixtures.GivenInputFilesAreAvailable(5000);
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

fdescribe(`given input data is available`, () => {
  beforeEach(async () => {
    fixtures.GivenInputFilesAreAvailable();
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

  test.skip(`cancelling marxan run`, async (done) => {
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

afterEach(async () => {
  await fixtures.cleanup();
}, 50000);

const getFixtures = async () => {
  const scenarioId = v4();
  const outputsIds: string[] = [];

  nock.disableNetConnect();

  const app = await bootstrapApplication();
  const scenariosPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(ScenariosPlanningUnitGeoEntity),
  );
  const puOutputRepo: Repository<OutputScenariosPuDataGeoEntity> = app.get(
    getRepositoryToken(OutputScenariosPuDataGeoEntity),
  );
  const metadataRepo: Repository<MarxanExecutionMetadataGeoEntity> = app.get(
    getRepositoryToken(MarxanExecutionMetadataGeoEntity),
  );
  const sut: MarxanSandboxRunnerService = app.get(MarxanSandboxRunnerService);

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
      nockScope.done();
      nock.enableNetConnect();
    },
    progressMock: jest.fn(),
    async GivenMarxanIsRunning() {
      return await sut.run(
        scenarioId,
        resources.map((resource) => ({
          url: host + resource.assetUrl,
          relativeDestination: resource.targetRelativeDestination,
        })),
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
          await GivenScenarioPuData(scenariosPuDataRepo, scenarioId, 12178)
        ).rows.map((r) => r.id),
      );
    },
    ThenHasValidOutput(output: ExecutionResult) {
      expect(output.length).toEqual(100);
    },
    ThenOutputScenarioPuDataWasPersisted: async () => {
      const k = await puOutputRepo.count({
        where: {
          scenarioPuId: In(outputsIds),
        },
      });
      expect(k).toEqual(12178);
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
