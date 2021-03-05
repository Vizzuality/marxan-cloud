import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const aNewPassword = faker.random.uuid();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        // In most tests we use seed user `aa@example.com` but here we use
        // bb@example.com to avoid messing with the main user we use in e2e
        // tests.
        username: E2E_CONFIG.users.basic.bb.username,
        password: E2E_CONFIG.users.basic.bb.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Users - metadata', () => {
    it('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(200);

      expect(results);
    });

    it('A user should be able to update their own metadata', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(200);
    });
  });

  describe('Users - password updates which should fail', () => {
    it('A user should not be able to change their password as part of the user update lifecycle', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.users.updated.bb(),
          password: faker.random.alphaNumeric(),
        })
        .expect(403);
    });

    it('A user should be not able to change their password if they provide an incorrect current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: faker.random.uuid(),
          newPassword: aNewPassword,
        })
        .expect(403);
    });
  });

  describe('Users - password updates which should succeed (1/2)', () => {
    it('A user should be able to change their password if they provide the correct current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: E2E_CONFIG.users.basic.bb.password,
          newPassword: aNewPassword,
        })
        .expect(200);
    });
  });

  describe('Users - password updates which should succeed (2/2)', () => {
    it('A user should be able to change their password if they provide the correct current password (take 2, back to initial password)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: aNewPassword,
          newPassword: E2E_CONFIG.users.basic.bb.password,
        })
        .expect(200);
    });
  });

  describe('Users - account deletion', () => {
    it('A user should be able to delete their own account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(200);
    });
  });

  describe('Users - locked out after account deletion', () => {
    it('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(401);
    });

    it('Once a user account is marked as deleted, the user should not be able to log back in', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.basic.bb.username,
          password: E2E_CONFIG.users.basic.bb.password,
        })
        .expect(401);
    });
  });
});
