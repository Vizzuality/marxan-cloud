// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { convert } from 'geojson2shp';

import { INestApplication } from '@nestjs/common';
import { Feature, Polygon } from 'geojson';
import { Job } from 'bullmq';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { FromShapefileJobInput } from '@marxan/artifact-cache';
import { defaultSrid } from '@marxan/utils/geo/spatial-data-format';

import { getFixtures } from '../planning-unit-fixtures';
import { CostSurfaceShapefileRecord } from '@marxan-geoprocessing/modules/cost-surface/ports/cost-surface-shapefile-record';
import {
  FromProjectShapefileJobInput,
  ProjectCostSurfaceJobInput,
} from '@marxan/artifact-cache/surface-cost-job-input';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';

export const createWorld = async (app: INestApplication) => {
  const newCost = [199.99, 300, 1];
  const fixtures = await getFixtures(app);
  const shapefile = await getShapefileForPlanningUnits(
    fixtures.planningUnitsPuids,
    newCost,
  );

  return {
    newCost,
    cleanup: async () => {
      await fixtures.cleanup();
    },
    WhenTheJobIsProcessed: async (job: Job<ProjectCostSurfaceJobInput>) =>
      fixtures.projectCostSurfaceProcessor.process(job),
    GivenPuCostDataExists: fixtures.GivenPuCostDataExists,
    getShapefileForScenarioWithCost: () =>
      (({
        data: {
          scenarioId: fixtures.scenarioId,
          shapefile,
        },
        id: 'test-job',
      } as unknown) as Job<FromShapefileJobInput>),
    getShapefileForProjectWithCost: (
      projectId: string,
      costSurfaceId: string,
    ) =>
      (({
        data: {
          projectId,
          costSurfaceId,
          shapefile,
        },
        id: 'test-job',
      } as unknown) as Job<FromProjectShapefileJobInput>),
    ThenCostIsUpdated: async () => {
      const newCost = await fixtures.GetPuCostsData(fixtures.scenarioId);
      expect(newCost).toEqual(
        newCost.map((cost) => ({
          scenario_id: fixtures.scenarioId,
          cost: cost.cost,
          spud_id: expect.any(String),
        })),
      );
    },
    ThenTheInitialCostIsCalculated: async () =>
      fixtures.costSurfacePuDataRepo
        .find()
        .then((cost: CostSurfacePuDataEntity[]) =>
          cost.forEach((cost) => expect(cost.cost).toEqual(0)),
        ),
    ThenTheProjectCostSurfaceIsUpdated: async () =>
      fixtures.costSurfacePuDataRepo
        .find()
        .then((cost: CostSurfacePuDataEntity[]) =>
          expect(cost[0].cost).toEqual(199.99),
        ),
  };
};

const getShapefileForPlanningUnits = async (
  ids: number[],
  costs: number[],
): Promise<FromShapefileJobInput['shapefile']> => {
  const baseDir = AppConfig.get<string>(
    'storage.sharedFileStorage.localPath',
  ) as string;
  const fileName = 'shape-with-cost';
  const fileFullPath = `${baseDir}/${fileName}.zip`;
  const features: Feature<Polygon, CostSurfaceShapefileRecord>[] = ids.map(
    (puid, index) => ({
      type: 'Feature',
      bbox: [0, 0, 0, 0, 0, 0],
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [144.07145493000007, -6.195269735999943],
            [144.61439831100006, -6.249564073999977],
            [144.66583505300002, -5.955231609999942],
            [144.26577150900005, -5.889506884999946],
          ],
        ],
      },
      properties: { cost: costs[index], puid },
    }),
  );
  await convert(features, fileFullPath, options);

  return {
    filename: fileName,
    buffer: {} as any,
    mimetype: 'application/zip',
    path: fileFullPath,
    destination: baseDir,
    fieldname: 'attachment',
    size: 1,
    originalname: `${fileName}.zip`,
    stream: {} as any,
    encoding: '',
  };
};

const options = {
  layer: 'my-layer',
  targetCrs: defaultSrid,
};
