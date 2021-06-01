// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { convert } from 'geojson2shp';

import { INestApplication } from '@nestjs/common';
import { Feature, Polygon } from 'geojson';
import { Job } from 'bullmq';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { defaultSrid } from '@marxan-geoprocessing/types/spatial-data-format';
import { PlanningUnitCost } from '@marxan-geoprocessing/modules/surface-cost/ports/planning-unit-cost';
import { CostSurfaceJobInput } from '@marxan-geoprocessing/modules/surface-cost/cost-surface-job-input';

import { getFixtures } from '../../planning-unit-fixtures';

export const createWorld = async (app: INestApplication) => {
  const newCost = 199.99;
  const fixtures = await getFixtures(app);
  const shapefile = await getShapefileForPlanningUnits(
    fixtures.planningUnitsIds,
    newCost,
  );

  return {
    newCost,
    cleanup: async () => {
      await fixtures.cleanup();
    },
    GivenPuCostDataExists: fixtures.GivenPuCostDataExists,
    GetPuCostsData: () => fixtures.GetPuCostsData(fixtures.scenarioId),
    getShapefileWithCost: () =>
      (({
        data: {
          scenarioId: fixtures.scenarioId,
          shapefile,
        },
        id: 'test-job',
      } as unknown) as Job<CostSurfaceJobInput>),
  };
};

const getShapefileForPlanningUnits = async (
  ids: string[],
  cost: number,
): Promise<CostSurfaceJobInput['shapefile']> => {
  const baseDir = AppConfig.get<string>(
    'storage.sharedFileStorage.localPath',
  ) as string;
  const fileName = 'shape-with-cost';
  const fileFullPath = `${baseDir}/${fileName}.zip`;
  const features: Feature<Polygon, PlanningUnitCost>[] = ids.map((puId) => ({
    type: 'Feature',
    bbox: [0, 0, 0, 0, 0, 0],
    geometry: { type: 'Polygon', coordinates: [[[0, 0]]] },
    properties: { cost, puId },
  }));
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
