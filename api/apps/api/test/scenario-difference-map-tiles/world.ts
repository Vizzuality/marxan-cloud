import { INestApplication, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { decodeMvt } from '@marxan/utils/geo/decode-mvt';
import * as request from 'supertest';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { GivenScenarioPuDataExists } from '../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';

export const createWorld = async (app: INestApplication) => {
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const { cleanup, projectId } = await GivenProjectExists(app, ownerToken, {
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });

  const scenarioIdA = (
    await ScenariosTestUtils.createScenario(app, ownerToken, {
      name: `scenario-name-a`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  const scenarioIdB = (
    await ScenariosTestUtils.createScenario(app, ownerToken, {
      name: `scenario-name-b`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  const scenariosPuData: Repository<ScenariosPlanningUnitGeoEntity> = await app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  return {
    scenarioIdA,
    scenarioIdB,
    GivenScenarioAPuDataExists: async () =>
      await GivenScenarioPuDataExists(entityManager, projectId, scenarioIdA),
    GivenScenarioBPuDataExists: async () =>
      await GivenScenarioPuDataExists(entityManager, projectId, scenarioIdB),
    WhenRequestingTileToCompareScenarios: async (
      scenarioIdA: string,
      scenarioIdB: string,
    ) =>
      request(app.getHttpServer())
        .get(
          `/api/v1/scenarios/${scenarioIdA}/compare/${scenarioIdB}/tiles/9/189/291.mvt`,
        )
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
        .responseType('blob')
        .buffer()
        .then((response) => response.body)
        .catch((error) => {
          Logger.error(error);
          throw new Error(`[step] Could not Access tile preview grid tile`);
        }),
    ThenItContainsScenarioCompareTile: async (mvt: Buffer) => {
      const tile = decodeMvt(mvt);
      expect(tile.layers).toBeDefined();
    },

    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioIdA);
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioIdB);
      await cleanup();
    },
  };
};
