import { bootstrapApplication } from './utils/api-application';
import { E2E_CONFIG } from './e2e.config';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';

describe('OrganizationsController (e2e)', () => {
  let jwt: string;
  let app: INestApplication;

  beforeEach(async () => {
    app = await bootstrapApplication();
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: E2E_CONFIG.users.basic.aa.username,
        password: E2E_CONFIG.users.basic.aa.password,
      })
      .expect(201);

    jwt = response.body.accessToken;
  });

  describe('Organizations', () => {
    it('Gets projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('projects');
    });

    it('Creates an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .auth(jwt, { type: 'bearer' })
        .send(E2E_CONFIG.organizations.valid.minimal())
        .expect(201);

      const organization = response.body.data;

      expect(organization.type).toBe('organizations');
    });

    it('Gets organizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/organizations')
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('organizations');
    });

    it('Creates a project in the newly created organization', async () => {
      const organizationResponse = await request(app.getHttpServer())
        .get('/api/v1/organizations')
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.body.data[0].id,
      };
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .auth(jwt, { type: 'bearer' })
        .expect(HttpStatus.CREATED)
        .send(createProjectDTO);

      const project = response.body.data;
      expect(project.type).toBe('projects');
    });

    it('Deletes the newly created project', async () => {
      const projectsResponse = await request(app.getHttpServer())
        .get('/api/v1/projects/')
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      await request(app.getHttpServer())
        .delete('/api/v1/projects/' + projectsResponse.body.data[0].id)
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      const projectsResponseAfterDelete = await request(app.getHttpServer())
        .get('/api/v1/projects/')
        .auth(jwt, { type: 'bearer' })
        .expect(200);
      expect(projectsResponseAfterDelete.body.data).toHaveLength(0);
    });

    it('Deletes the newly created organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .auth(jwt, { type: 'bearer' })
        .send(E2E_CONFIG.organizations.valid.minimal())
        .expect(201);

      const organization = response.body.data;
      await request(app.getHttpServer())
        .delete('/api/v1/organizations/' + organization.id)
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/organizations/' + organization.id)
        .auth(jwt, { type: 'bearer' })
        .expect(404);
    });

    /**
     * @debt We should test that deleting an organization which contains
     * projects must fail.
     */
  });
});
