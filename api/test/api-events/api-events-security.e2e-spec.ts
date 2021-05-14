import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import * as request from 'supertest';

let app: INestApplication;

beforeAll(async () => {
  app = await bootstrapApplication();
});

afterAll(async () => {
  await Promise.all([app.close()]);
});

describe(`when getting events without api-key`, () => {
  it(`should deny the access`, async () => {
    return request(app.getHttpServer())
      .get(`/api/v1/api-events`)
      .set('X-Api-Key', '')
      .expect(403);
  });
});

describe(`when getting events with valid api-key`, () => {
  it(`should allow the access`, async () => {
    return request(app.getHttpServer())
      .get(`/api/v1/api-events`)
      .set(
        'X-Api-Key',
        process.env.API_AUTH_X_API_KEY ?? 'sure it is valid in envs?',
      )
      .expect(200);
  });
});
