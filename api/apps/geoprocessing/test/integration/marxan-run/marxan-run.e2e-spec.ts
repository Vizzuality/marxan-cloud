import { getRepositoryToken } from '@nestjs/typeorm';
import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import * as nock from 'nock';
import { v4 } from 'uuid';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { ScenariosOutputResultsApiEntity } from '@marxan/scenarios-planning-unit';

import { bootstrapApplication, delay } from '../../utils';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeAll(async () => {
  fixtures = await getFixtures();
});

describe(`given input data is available`, () => {
  beforeEach(() => {
    fixtures.GivenInputFilesAreAvailable();
  });
  test(`marxan run during binary execution`, async () => {
    await fixtures.GivenMarxanIsRunning();

    // expect(await fixtures.ThenExecutionOutput()).toBeGreaterThan(0);
  }, 60000);

  test(`marxan run`, async () => {
    await fixtures.WhenRunningMarxan();

    expect(await fixtures.ThenExecutionOutput()).toBeGreaterThan(0);
  }, 30000);
});

afterAll(async () => {
  await fixtures.cleanup();
});

const getFixtures = async () => {
  const scenarioId = v4();

  nock.disableNetConnect();

  const app = await bootstrapApplication();
  const sut: MarxanSandboxRunnerService = app.get(MarxanSandboxRunnerService);
  const tempRepoReference: Repository<ScenariosOutputResultsApiEntity> = app.get(
    getRepositoryToken(
      ScenariosOutputResultsApiEntity,
      geoprocessingConnections.apiDB,
    ),
  );

  const nockScope = nock(host, {
    reqheaders: {
      'x-api-key':
        process.env.API_AUTH_X_API_KEY ?? 'sure it is valid in envs?',
    },
  });
  return {
    cleanup: async () => {
      nockScope.done();
      nock.enableNetConnect();
      await tempRepoReference.delete({
        scenarioId,
      });
    },
    WhenRunningMarxan: async () =>
      await sut.run(
        scenarioId,
        resources.map((resource) => ({
          url: host + resource.assetUrl,
          relativeDestination: resource.targetRelativeDestination,
        })),
      ),
    ThenExecutionOutput: async () =>
      await tempRepoReference.count({
        where: {
          scenarioId,
        },
      }),
    GivenInputFilesAreAvailable: () =>
      resources.forEach((resource) => {
        nockScope
          .get(resource.assetUrl)
          .reply(200, resourceResponse(resource.targetRelativeDestination), {
            'content-type': 'plain/text',
          });
      }),
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
