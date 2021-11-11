import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScenarioFeaturesData } from '@marxan/features';
import { DbConnections } from '@marxan-api/ormconfig.connections';
/**
 * @TODO: This should be done after recreating an scenario and linking the feature data using a copy operation
 */
export const WhenScenarioHasPreGapData = async (
  app: INestApplication,
): Promise<{
  featuresData: ScenarioFeaturesData[];
  scenarioId: string;
}> => {
  const repo: Repository<ScenarioFeaturesData> = await app.get(
    getRepositoryToken(ScenarioFeaturesData, DbConnections.geoprocessingDB),
  );
  const rows = await repo.find();
  if (rows.length === 0) {
    throw new Error('Missing scenario_features_data seeds!');
  }
  const scenarioId = rows[0].scenarioId;
  if (!scenarioId) {
    throw new Error(`Missing scenario ID!`);
  }
  return {
    featuresData: rows.filter((row) => row.scenarioId === scenarioId),
    scenarioId,
  };
};
