import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 } from 'uuid';
import { getDtoByIds } from '../../../src/modules/scenarios/dto/__mocks__/dtos.data';

export const WhenChangingInclusivityWithGeo = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
) =>
  // TODO modify with real IDS once the feature will be implemented
  (
    await request(app.getHttpServer())
      .patch(`/api/v1/scenarios/${scenarioId}/planning-units`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(getDtoByIds([v4(), v4()], [v4()]))
  ).body;
