import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const SubmitsProjectsPaShapefile = (
  app: INestApplication,
  jwt: string,
  scenarioId: string,
  /**
   * path to file
   */
  shapefile: string,
) =>
  request(app.getHttpServer())
    .post(`/api/v1/scenarios/${scenarioId}/protected-areas/shapefile`)
    .set('Authorization', `Bearer ${jwt}`)
    .attach(`file`, shapefile);
