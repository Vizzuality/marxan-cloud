import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const WhenRequestingStatus = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
) =>
  (
    await request(app.getHttpServer())
      .get(`/api/v1/scenarios/${scenarioId}/planning-units`)
      .set('Authorization', `Bearer ${jwtToken}`)
  ).body;
