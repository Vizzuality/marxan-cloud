import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getDtoByIds } from '../../../src/modules/scenarios/dto/__mocks__/dtos.data';

export const WhenChangingPlanningUnitInclusivity = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
  puIds: string[],
) =>
  (
    await request(app.getHttpServer())
      .patch(`/api/v1/scenarios/${scenarioId}/planning-units`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(getDtoByIds(puIds, []))
  ).body;
