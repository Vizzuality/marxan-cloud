import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { GivenScenarioPuDataExists } from '../../steps/given-scenario-pu-data-exists';
import { WhenChangingPlanningUnitInclusivity } from './WhenChangingPlanningUnitInclusivity';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../../steps/given-project';

export const createWorld = async (app: INestApplication, jwt: string) => {
  const { cleanup, projectId } = await GivenProjectExists(app, jwt);
  const scenariosPuData: Repository<ScenariosPlanningUnitGeoEntity> = await app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  const scenarioId = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  return {
    scenarioId,
    GivenScenarioPuDataExists: async () =>
      (await GivenScenarioPuDataExists(scenariosPuData, scenarioId)).rows,
    WhenChangingPlanningUnitInclusivityForRandomPu: async () =>
      WhenChangingPlanningUnitInclusivity(app, scenarioId, jwt, [v4(), v4()]),
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
      await scenariosPuData.delete({ scenarioId });
      await ScenariosTestUtils.deleteScenario(app, jwt, scenarioId);
      await cleanup();
    },
  };
};
