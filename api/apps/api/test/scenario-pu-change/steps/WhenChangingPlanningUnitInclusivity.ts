import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getDtoByIds } from '../../../src/modules/scenarios/dto/__mocks__/dtos.data';
import { LockStatus } from '@marxan/scenarios-planning-unit';

export const WhenChangingPlanningUnitInclusivity = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
  puIds: string[],
) =>
  (
    await request(app.getHttpServer())
      .post(`/api/v1/scenarios/${scenarioId}/planning-units`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(getDtoByIds(puIds, [], []))
  ).body;

export const WhenClearingPuStatusesByKind = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
  kind: string,
) =>
  (
    await request(app.getHttpServer())
      .delete(`/api/v1/scenarios/${scenarioId}/planning-units/status/${kind}`)
      .set('Authorization', `Bearer ${jwtToken}`)
  ).body;
