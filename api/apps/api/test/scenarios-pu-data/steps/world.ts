import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioPuDataExists } from '../../../../geoprocessing/test/steps/given-scenario-pu-data-exists';

export interface World {
  scenarioId: string;
  GivenScenarioPuDataExists: () => Promise<ScenariosPlanningUnitGeoEntity[]>;
  cleanup: () => Promise<void>;
}

export const createWorld = async (app: INestApplication): Promise<World> => {
  const projectId = v4();
  const scenarioId = v4();
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsPuRepo: Repository<ProjectsPuEntity> = entityManager.getRepository(
    ProjectsPuEntity,
  );
  const geomsRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );

  return {
    scenarioId,
    GivenScenarioPuDataExists: () =>
      GivenScenarioPuDataExists(entityManager, projectId, scenarioId),
    cleanup: async () => {
      const projectPus = await projectsPuRepo.find({ projectId });
      await geomsRepo.delete({ id: In(projectPus.map((pu) => pu.geomId)) });
    },
  };
};
