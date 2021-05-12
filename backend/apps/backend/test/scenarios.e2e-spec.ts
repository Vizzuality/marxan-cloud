import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';

describe('ScenariosModule (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: E2E_CONFIG.users.basic.aa.username,
        password: E2E_CONFIG.users.basic.aa.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Scenarios', () => {
    let aScenario: { id: string; type: 'scenarios' };
    let projects: { id: string }[] = [];

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
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.scenarios.invalid.missingRequiredFields())
        .expect(400);
    });

    it('Creating a scenario with minimum required data should succeed', async () => {
      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: projects[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);

      aScenario = response.body.data;
      expect(aScenario.type).toBe('scenarios');
    });

    it('Creating a scenario with complete data should succeed', async () => {
      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.complete(),
        projectId: projects[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);

      aScenario = response.body.data;
      expect(aScenario.type).toBe('scenarios');
    });

    it('Gets scenarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
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
