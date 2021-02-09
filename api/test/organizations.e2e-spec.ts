import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as faker from 'faker';

describe('OrganizationsController (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: 'aa@example.com',
        password: 'aauserpassword',
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Organizations', () => {
    it('Gets projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');
    });

    let anOrganization: { id: string; type: 'organizations' };

    it('Creates an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: faker.random.words(3),
          description: faker.lorem.sentence(),
        })
        .expect(201);

      const resources = response.body.data;

      anOrganization = resources[0];
      expect(anOrganization.type).toBe('organizations');
    });

    it('Gets organizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('organizations');
    });

    let aProject: { id: string; type: 'organizations' };

    it('Creates a project in the newly created organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          organizationId: anOrganization.id,
        })
        .expect(201);

      const resources = response.body.data;
      aProject = resources[0];
      expect(aProject.type).toBe('projects');
    });

    it('Deletes the newly created project', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/projects/' + aProject.id)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources).toBeUndefined();
    });

    it('Deletes the newly created organization', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/organizations/' + anOrganization.id)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources).toBeUndefined();
    });
  });
});
