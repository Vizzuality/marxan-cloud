import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// debt: if we move toward Cucumber, token should already be within `World` Context
export const WhenUserGetsScenarioGapAnalysis = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
) =>
  (
    await request(app.getHttpServer())
      .get(`/api/v1/scenarios/${scenarioId}/scenarios-features`)
      .set('Authorization', `Bearer ${jwtToken}`)
  ).body;
