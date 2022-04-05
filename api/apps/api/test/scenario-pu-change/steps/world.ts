import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioPuDataExists } from '../../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { GivenProjectExists } from '../../steps/given-project';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import { WhenChangingPlanningUnitInclusivity } from './WhenChangingPlanningUnitInclusivity';

export const createWorld = async (app: INestApplication, jwt: string) => {
  const { cleanup, projectId } = await GivenProjectExists(app, jwt, {
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsPuRepo = entityManager.getRepository(ProjectsPuEntity);
  const geomsRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );

  const scenarioId = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  const scenariosPuData = await GivenScenarioPuDataExists(
    entityManager,
    projectId,
    scenarioId,
  );

  return {
    scenarioId,
    WhenChangingPlanningUnitInclusivityForRandomPu: async () =>
      WhenChangingPlanningUnitInclusivity(app, scenarioId, jwt, [v4(), v4()]),
    WhenChangingPlanningUnitInclusivityWithExistingPu: async () =>
      WhenChangingPlanningUnitInclusivity(
        app,
        scenarioId,
        jwt,
        scenariosPuData.map((pu) => pu.id),
      ),
    cleanup: async () => {
      const projectPus = await projectsPuRepo.find({ projectId });
      await geomsRepo.delete({ id: In(projectPus.map((pu) => pu.geomId)) });
      await ScenariosTestUtils.deleteScenario(app, jwt, scenarioId);
      await cleanup();
    },
  };
};
