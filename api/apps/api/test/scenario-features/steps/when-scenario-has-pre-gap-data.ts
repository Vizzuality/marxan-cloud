import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RemoteScenarioFeaturesData } from '../../../src/modules/scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { remoteConnectionName } from '../../../src/modules/scenarios-features/entities/remote-connection-name';

export const WhenScenarioHasPreGapData = async (
  app: INestApplication,
): Promise<{
  featuresData: RemoteScenarioFeaturesData[];
  scenarioId: string;
}> => {
  const repo: Repository<RemoteScenarioFeaturesData> = await app.get(
    getRepositoryToken(RemoteScenarioFeaturesData, remoteConnectionName),
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
