import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Authentication', () => {
    let jwtToken: string;

    it('Retrieves a JWT token when authenticating with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.aa.username,
          password: E2E_CONFIG.users.aa.password,
        })
        .expect(201);

      jwtToken = response.body.accessToken;
    });

    it('Fails to authenticate a user with an incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: E2E_CONFIG.users.aa.username, password: 'wrong' })
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

    it('Gets projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');
    });

    let anOrganization: { id: string; type: 'organizations' };

    it('Gets organizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      anOrganization = resources[0];
      expect(resources[0].type).toBe('organizations');
    });

    it('Creates a project', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Test Project 1234',
          description: 'Description for this awesome project',
          organizationId: anOrganization.id,
        })
        .expect(201);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');
    });
  });
});
