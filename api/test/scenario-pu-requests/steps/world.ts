import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ScenarioPuRequestGeo } from '../../../src/modules/analysis/scenario-pu-request/entity/scenario-pu-request.geo.entity';
import { DbConnections } from '../../../src/ormconfig.connections';
import {
  geometryBannedBySpatialFlag,
  invalidMultiPolygon,
  invalidPuIds,
  sampleGeometry,
  validPuIds,
} from './data/sample-multi-polygon';

export interface World {
  scenarioId: string;
  WhenScenarioPuRequestIsAvailable: () => Promise<void>;
  WhenInsertingInvalidMultiPolygon: () => Promise<void>;
  WhenInsertingNonMultiPolygon: () => Promise<void>;
  cleanup: () => Promise<void>;
}

export const createWorld = async (app: INestApplication): Promise<World> => {
  const scenarioId = v4();
  const repo: Repository<ScenarioPuRequestGeo> = await app.get(
    getRepositoryToken(ScenarioPuRequestGeo, DbConnections.geoprocessingDB),
  );

  return {
    scenarioId,
    WhenInsertingNonMultiPolygon: async () =>
      repo
        .save(
          repo.create({
            scenarioId,
            excludedFromGeoJson: sampleGeometry(),
            excludedFromShapefile: sampleGeometry(),
            includedFromGeoJson: geometryBannedBySpatialFlag(),
            includedFromShapefile: sampleGeometry(),
          }),
        )
        .then(() => undefined),
    WhenInsertingInvalidMultiPolygon: async () =>
      repo
        .save(
          repo.create({
            scenarioId,
            excludedFromGeoJson: sampleGeometry(),
            excludedFromShapefile: sampleGeometry(),
            includedFromGeoJson: invalidMultiPolygon(),
            includedFromShapefile: sampleGeometry(),
          }),
        )
        .then(() => undefined),
    WhenScenarioPuRequestIsAvailable: async () =>
      repo
        .save(
          repo.create({
            scenarioId,
            includedPlantingUnits: validPuIds(),
            excludedFromGeoJson: sampleGeometry(),
            excludedFromShapefile: sampleGeometry(),
            includedFromGeoJson: sampleGeometry(),
            includedFromShapefile: sampleGeometry(),
          }),
        )
        .then(() => undefined),
    cleanup: async () =>
      repo
        .delete({
          scenarioId,
        })
        .then(() => undefined),
  };
};
