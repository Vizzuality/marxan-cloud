import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';
import { Scenario } from 'modules/scenarios/scenario.api.entity';
import { pick } from 'lodash';

describe('ProjectsModule (e2e)', () => {
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

  describe('Projects', () => {
    let anOrganization: { id: string; type: 'organizations' };
    let minimalProject: { id: string; type: 'projects' };
    let completeProject: { id: string; type: 'projects' };
    let aScenarioInACompleteProject: {
      id: string;
      type: 'scenarios';
      data: Scenario;
    };

    it('Creates an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.organizations.valid.minimal())
        .expect(201);

      anOrganization = response.body.data;

      expect(anOrganization.type).toBe('organizations');
    });

    it('Creating a project with incomplete data should fail', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.projects.invalid.incomplete())
        .expect(400);
    });

    it('Creating a project with minimum required data should succeed', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const resources = response.body.data;
      minimalProject = resources;
      expect(resources.type).toBe('projects');
    });

    it('Creating a project with complete data should succeed', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.complete({ countryCode: 'ESP' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const resources = response.body.data;
      completeProject = resources;
      expect(resources.type).toBe('projects');

      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: completeProject.id,
      };

      const scenarioResponse = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);

      aScenarioInACompleteProject = scenarioResponse.body.data;
    });

    it('A user should be able to get a list of projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');
    });

    it('A user should be able to get a list of projects and related scenarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects?disablePagination=true&include=scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');

      const aKnownProject = resources.find(
        (i: { id: string }) => (i.id = completeProject.id),
      );
      expect(aKnownProject.relationships).toBeDefined();
      expect(aKnownProject.relationships.scenarios).toBeDefined();
      expect(aKnownProject.relationships.scenarios.data).toContainEqual(
        pick(aScenarioInACompleteProject, ['id', 'type']),
      );
    });

    it('A user should be get a list of projects without any included relationships if these have not been requested', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');

      const projectsWhichIncludeRelationships = resources.filter(
        (i: Record<string, unknown>) => i.relationships,
      );
      expect(projectsWhichIncludeRelationships).toHaveLength(0);
    });

    it('Deleting existing projects should succeed', async () => {
      const response1 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${minimalProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response1.body.data).toBeUndefined();

      const response2 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${completeProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response2.body.data).toBeUndefined();

      /**
       * Finally, we delete the organization we had created for these projects
       */
      await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${anOrganization.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });

    /**
     * @debt We should test that deleting a project which contains
     * scenarios must fail.
     */
  });
});
