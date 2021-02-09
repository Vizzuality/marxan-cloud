import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as faker from 'faker';
import { E2E_CONFIG } from './e2e.config';
import { Project } from 'modules/projects/project.api.entity';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';
import { inspect } from 'util';

describe('ScenariosModule (e2e)', () => {
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
        username: E2E_CONFIG.users.aa.username,
        password: E2E_CONFIG.users.aa.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Scenarios', () => {
    let aScenario: { id: string; type: 'scenarios' };
    let projects: { id: string }[] = [];

    it('Gets scenarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
    });

    it('Gets projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      projects = resources;
      expect(resources[0].type).toBe('projects');
    });

    it('Creating a scenario with incomplete data should fail', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: faker.random.words(3),
          description: faker.lorem.sentence(),
        })
        .expect(400);

      const resources = response.body.data;
    });

    it('Creating a scenario with complete data should succeed', async () => {
      const createScenarioDTO: CreateScenarioDTO = {
        ...E2E_CONFIG.scenarios.validScenarios[0],
        projectId: projects[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201)

      const resources = response.body.data;
      aScenario = resources[0];
      expect(aScenario.type).toBe('scenarios');
      expect(resources.length).toBe(1);
    });

    it('Gets scenarios (paginated; pages of up to 5 items, no explicit page number - should default to 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('scenarios');
      expect(resources.length).toBeLessThanOrEqual(5);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Gets scenarios (paginated; pages of up to 5 items, first page)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5&page[number]=1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('scenarios');
      expect(resources.length).toBeLessThanOrEqual(5);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Deletes the newly created scenario', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/scenarios/' + aScenario.id)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources).toBeUndefined();
    });
  });
});
