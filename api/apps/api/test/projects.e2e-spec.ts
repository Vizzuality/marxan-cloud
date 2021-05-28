import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@marxan-api/app.module';
import { E2E_CONFIG } from './e2e.config';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import * as JSONAPISerializer from 'jsonapi-serializer';
import {
  Project,
  ProjectResultPlural,
  ProjectResultSingular,
} from '@marxan-api/modules/projects/project.api.entity';
import {
  Organization,
  OrganizationResultSingular,
} from '@marxan-api/modules/organizations/organization.api.entity';
import { tearDown } from './utils/tear-down';

afterAll(async () => {
  await tearDown();
});

describe('ProjectsModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });

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
    let anOrganization: Organization;
    let minimalProject: Project;
    let completeProject: Project;
    let aScenarioInACompleteProject: Scenario;

    test('Creates an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.organizations.valid.minimal())
        .expect(201);

      const jsonAPIResponse: OrganizationResultSingular = response.body;
      anOrganization = await Deserializer.deserialize(response.body);
      expect(jsonAPIResponse.data.type).toBe('organizations');
    });

    test('Creating a project with incomplete data should fail', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.projects.invalid.incomplete())
        .expect(400);
    });

    test('Creating a project with minimum required data should succeed', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const jsonAPIResponse: ProjectResultSingular = response.body;
      minimalProject = await Deserializer.deserialize(response.body);
      expect(jsonAPIResponse.data.type).toBe('projects');
    });

    test('Creating a project with complete data should succeed', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.complete({ countryCode: 'ESP' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const jsonAPIResponse: ProjectResultSingular = response.body;
      completeProject = await Deserializer.deserialize(response.body);
      expect(jsonAPIResponse.data.type).toBe('projects');

      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: completeProject.id,
      };

      const scenarioResponse = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);

      aScenarioInACompleteProject = await Deserializer.deserialize(
        scenarioResponse.body,
      );
    });

    test('A user should be able to get a list of projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const jsonAPIResponse: ProjectResultPlural = response.body;

      expect(jsonAPIResponse.data[0].type).toBe('projects');
    });

    test.skip('A user should be able to get a list of projects and related scenarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects?disablePagination=true&include=scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const jsonAPIResponse: ProjectResultPlural = response.body;
      const allProjects: Project[] = await Deserializer.deserialize(
        response.body,
      );

      expect(jsonAPIResponse.data[0].type).toBe('projects');

      const aKnownProject: Project | undefined = allProjects.find(
        (i) => (i.id = completeProject.id),
      );
      expect(aKnownProject?.scenarios).toBeDefined();
      expect(
        aKnownProject?.scenarios?.find(
          (i) => i.id === aScenarioInACompleteProject.id,
        ),
      ).toBeDefined();
    });

    test('A user should be get a list of projects without any included relationships if these have not been requested', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const jsonAPIResponse: ProjectResultPlural = response.body;

      expect(jsonAPIResponse.data[0].type).toBe('projects');

      const projectsWhichIncludeRelationships = jsonAPIResponse.data.filter(
        (i) => i.relationships,
      );
      expect(projectsWhichIncludeRelationships).toHaveLength(0);
    });

    test('Deleting existing projects should succeed', async () => {
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
  });
});
