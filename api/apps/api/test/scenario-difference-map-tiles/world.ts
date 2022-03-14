import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { GivenScenarioPuDataExists } from '../steps/given-scenario-pu-data-exists';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../steps/given-project';

export const createWorld = async (app: INestApplication, jwt: string) => {
  const { cleanup, projectId } = await GivenProjectExists(app, jwt, {
    countryCode: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const scenariosPuData: Repository<ScenariosPlanningUnitGeoEntity> = await app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  const scenarioIdA = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name-a`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  const scenarioIdB = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name-b`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  return {
    scenarioId,
    GivenScenarioPuDataExists: async () =>
      (await GivenScenarioPuDataExists(scenariosPuData, scenarioIdA)).rows,
    WhenChangingPlanningUnitInclusivityForRandomPu: async () =>
      WhenChangingPlanningUnitInclusivity(app, scenarioIdA, jwt, [v4(), v4()]),
    WhenChangingPlanningUnitInclusivityWithExistingPu: async () =>
      WhenChangingPlanningUnitInclusivity(
        app,
        scenarioId,
        jwt,
        (await GivenScenarioPuDataExists(scenariosPuData, scenarioId)).rows.map(
          (entity) => entity.id,
        ),
      ),
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, jwt, scenarioIdA);
      await ScenariosTestUtils.deleteScenario(app, jwt, scenarioIdB);
      await cleanup();
    },
  };
};
