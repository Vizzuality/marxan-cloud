import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import * as config from 'config';
import * as stream from 'stream';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import waitForExpect from 'wait-for-expect';
import { Queue } from 'bullmq';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { assertDefined } from '@marxan/utils';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { bootstrapApplication } from '../utils';
import {
  ArtifactType,
  CacheNotFound,
  ErrorWithSymbol,
  ScenarioCostSurfaceRepository,
} from '@marxan/scenario-cost-surface';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

jest.setTimeout(35000);

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe.skip(`when no jobs in the queue`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = await fixtures.scenarioWithData();
  });

  // then
  it(`
  there is no cache
  `, async () => {
    await fixtures.expectMissingCache(scenarioId);
  });
});

describe.skip(`when a job in the queue landed and processed`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = await fixtures.scenarioWithData();

    // when
    await fixtures.aJobAddedToQueue(scenarioId);
  });

  // then
  it(`
  should return the cost template from repo
  should left the temp empty
  `, async () => {
    await fixtures.expectShapefileZipInCache(scenarioId);
    await fixtures.expectEmptyTemp();
  });
});

describe.skip(`when a job in the queue landed and failed`, () => {
  let scenarioId: string;
  beforeEach(async () => {
    // given
    scenarioId = '00000000-0000-0000-0000-000000000000';

    // when
    const job = await fixtures.aJobAddedToQueue(scenarioId);
    await waitForExpect(
      async () => {
        const state = await job.getState();
        expect(state).toBe('unknown');
      },
      10000,
      100,
    );
  });

  // then
  it(`
  should left the temp empty
  `, async () => {
    await fixtures.expectEmptyTemp();
  });
});

async function getFixtures() {
  const application = await bootstrapApplication();
  const planningUnitsRepository: Repository<ScenariosPlanningUnitGeoEntity> = application.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      geoprocessingConnections.default,
    ),
  );
  const storagePath = AppConfig.get<string>(
    'storage.sharedFileStorage.localPath',
  );
  assertDefined(storagePath);

  const fileRepository = application.get(ScenarioCostSurfaceRepository);

  const queue = new Queue(`cost-surface-template-creation`, {
    ...config.get('redisApi'),
  });

  let processedScenario: string | undefined;

  return {
    async scenarioWithData() {
      const first = await planningUnitsRepository.findOne();
      assertDefined(first);
      return first.scenarioId;
    },
    async aJobAddedToQueue(scenarioId: string) {
      processedScenario = scenarioId;
      return await queue.add(`whatever`, undefined, {
        jobId: scenarioId,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
      });
    },
    async cleanup() {
      if (processedScenario) {
        await fileRepository.remove(
          processedScenario,
          ArtifactType.CostTemplate,
        );
        await queue.remove(processedScenario);
      }
      await queue.drain();
      await queue.close();
      await queue.disconnect();
      await application.close();
    },
    async expectEmptyTemp() {
      const exists = util.promisify(fs.exists);
      await waitForExpect(async () => {
        const costTemplatesPath = path.join(storagePath, 'cost-templates');
        if (await exists(costTemplatesPath))
          expect(await fs.promises.readdir(costTemplatesPath)).toEqual([]);
      });
    },
    async expectMissingCache(scenarioId: string) {
      await expect(
        new Promise((resolve, reject) => {
          const passThrough = new stream.PassThrough();
          passThrough.on('finish', resolve).on('error', reject);
          fileRepository.read(
            scenarioId,
            ArtifactType.CostTemplate,
            passThrough,
          );
        }),
      ).rejects.toStrictEqual(new ErrorWithSymbol(CacheNotFound));
    },
    async expectShapefileZipInCache(scenarioId: string) {
      await waitForExpect(
        async () => {
          const paths: string[] = [];
          const pass = new stream.PassThrough();
          pass.pipe(unzipper.Parse()).on('entry', (entry: unzipper.Entry) => {
            paths.push(entry.path);
            entry.autodrain();
          });
          await fileRepository.read(
            scenarioId,
            ArtifactType.CostTemplate,
            pass,
          );
          expect(paths).toEqual([
            'result.dbf',
            'result.prj',
            'result.shp',
            'result.shx',
          ]);
        },
        30000,
        1000,
      );
    },
  };
}
