import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';
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
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

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
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Projects', () => {
    let anOrganization: Organization;
    let minimalProject: Project;

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

    test('A user should be able to get a list of projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const jsonAPIResponse: ProjectResultPlural = response.body;

      expect(jsonAPIResponse.data[0].type).toBe('projects');
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
