import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const SubmitsScenariosPaShapefile = (
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

export const SubmitsProjectsPaShapefile = (
  app: INestApplication,
  jwt: string,
  projectId: string,
  /**
   * path to file
   */
  shapefile: string,
) =>
  request(app.getHttpServer())
    .post(`/api/v1/projects/${projectId}/protected-areas/shapefile`)
    .set('Authorization', `Bearer ${jwt}`)
    .attach(`file`, shapefile);
