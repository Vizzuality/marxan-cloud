import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from '../e2e.config';

export const GivenUserIsLoggedIn = async (
  app: INestApplication,
): Promise<string> =>
  (
    await request(app.getHttpServer()).post('/auth/sign-in').send({
      username: E2E_CONFIG.users.basic.aa.username,
      password: E2E_CONFIG.users.basic.aa.password,
    })
  ).body.accessToken;
