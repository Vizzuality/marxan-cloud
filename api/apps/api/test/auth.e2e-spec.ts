import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { tearDown } from './utils/tear-down';
import { bootstrapApplication } from './utils/api-application';

afterAll(async () => {
  await tearDown();
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    try {
      app = await bootstrapApplication();
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Authentication', () => {
    it('Retrieves a JWT token when authenticating with valid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.basic.aa.username,
          password: E2E_CONFIG.users.basic.aa.password,
        })
        .expect(201);
    });

    it('Fails to authenticate a user with an incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: E2E_CONFIG.users.basic.aa.username, password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });

    it('Fails to authenticate a non-existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });
  });
});
