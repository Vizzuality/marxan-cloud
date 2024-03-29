import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  GivenScenarioPuDataExists,
  GivenScenarioPuDataWithStatusesSetByUserExists,
} from '../../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { GivenProjectExists } from '../../steps/given-project';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import {
  WhenChangingPlanningUnitInclusivity,
  WhenClearingPuStatusesByKind,
} from './WhenChangingPlanningUnitInclusivity';
import { LockStatus } from '@marxan/scenarios-planning-unit';

export const createWorld = async (app: INestApplication, jwt: string) => {
  const { projectId } = await GivenProjectExists(app, jwt, {
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );

  const scenarioId = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;

  const scenariosPuData = await GivenScenarioPuDataWithStatusesSetByUserExists(
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
    WhenClearingLockedInPUsStatusWithExistingPu: async () =>
      WhenClearingPuStatusesByKind(app, scenarioId, jwt, LockStatus.LockedIn),
    WhenClearingLockedOutPUsStatusWithExistingPu: async () =>
      WhenClearingPuStatusesByKind(app, scenarioId, jwt, LockStatus.LockedOut),
    WhenClearingAvailablePUsStatusWithExistingPu: async () =>
      WhenClearingPuStatusesByKind(app, scenarioId, jwt, LockStatus.Available),
    WhenClearingAvailablePUsStatusWithIncorrectStatusType: async () =>
      WhenClearingPuStatusesByKind(
        app,
        scenarioId,
        jwt,
        'incorrect-status-type',
      ),
  };
};
