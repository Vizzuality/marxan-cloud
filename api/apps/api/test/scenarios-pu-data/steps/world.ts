import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { GivenScenarioPuDataExists } from '../../steps/given-scenario-pu-data-exists';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export interface World {
  scenarioId: string;
  GivenScenarioPuDataExists: () => Promise<ScenariosPlanningUnitGeoEntity[]>;
  cleanup: () => Promise<void>;
}

export const createWorld = async (app: INestApplication): Promise<World> => {
  const scenarioId = v4();
  const scenariosPuData: Repository<ScenariosPlanningUnitGeoEntity> = await app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  return {
    scenarioId,
    GivenScenarioPuDataExists: async () =>
      (await GivenScenarioPuDataExists(scenariosPuData, scenarioId)).rows,
    cleanup: () =>
      scenariosPuData
        .delete({
          scenarioId,
        })
        .then(() => undefined),
  };
};
