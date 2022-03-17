import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import * as request from 'supertest';
import { AppConfig } from '@marxan-api/utils/config.utils';

let app: INestApplication;

beforeEach(async () => {
  app = await bootstrapApplication();
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
    const secret = AppConfig.get('auth.xApiKey.secret', '');

    await request(app.getHttpServer())
      .get(`/api/v1/api-events`)
      .set('X-Api-Key', secret)
      .expect(200);
  });
});
