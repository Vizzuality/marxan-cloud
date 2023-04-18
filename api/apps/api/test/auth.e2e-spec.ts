import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { bootstrapApplication } from './utils/api-application';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await bootstrapApplication();
  });

  describe('Authentication', () => {
    it('Retrieves a JWT token when authenticating with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.basic.aa.username,
          password: E2E_CONFIG.users.basic.aa.password,
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
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
