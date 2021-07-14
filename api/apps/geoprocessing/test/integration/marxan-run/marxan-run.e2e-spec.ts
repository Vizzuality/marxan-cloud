import { PromiseType } from 'utility-types';
import { readFileSync } from 'fs';
import * as nock from 'nock';
import { v4 } from 'uuid';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { ExecutionResult } from '@marxan/marxan-output';

import { bootstrapApplication, delay } from '../../utils';

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
  beforeEach(() => {
    fixtures.GivenInputFilesAreAvailable();
  });
  test(`marxan run during binary execution`, async () => {
    const output = await fixtures.GivenMarxanIsRunning();
    fixtures.ThenHasValidOutput(output);
  }, 60000);

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
});

const getFixtures = async () => {
  const scenarioId = v4();

  nock.disableNetConnect();

  const app = await bootstrapApplication();
  const sut: MarxanSandboxRunnerService = app.get(MarxanSandboxRunnerService);

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
    },
    GivenMarxanIsRunning: async () =>
      await sut.run(
        scenarioId,
        resources.map((resource) => ({
          url: host + resource.assetUrl,
          relativeDestination: resource.targetRelativeDestination,
        })),
      ),
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
    ThenHasValidOutput(output: ExecutionResult) {
      expect(output.length).toEqual(100);
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
