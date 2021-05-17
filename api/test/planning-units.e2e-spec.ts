// require('leaked-handles');

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';

import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';
import { Job } from 'bullmq';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { FakeQueue } from './utils/queues';
import { QueueToken } from '../src/modules/queue/queue.tokens';

let app: INestApplication;
let jwtToken: string;
let queue: FakeQueue;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  queue = app.get(QueueToken);
});

afterAll(async () => {
  console.log(`1`);
  await app.close();
  console.log(`2`);
});

describe('PlanningUnitsModule (e2e)', () => {
  describe('Planning units', () => {
    let anOrganization: { id: string; type: 'organizations' };
    let minimalProject: { id: string; type: 'projects' };
    let customAreaProject: { id: string; type: 'projects' };
    let adminAreaProject: { id: string; type: 'projects' };

    /**
     * @description
     * this should describe how the sinergy between Project creation
     * and pu creation works
     */

    it('Creates an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.organizations.valid.minimal());

      anOrganization = response.body.data;

      expect(anOrganization.type).toBe('organizations');
    });

    it('Creates a project with minimum required data, it should succeed but a job should not be created', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO);

      const resources = response.body.data;
      minimalProject = resources;
      expect(resources.type).toBe('projects');

      expect(Object.values(queue.jobs).length).toEqual(0);
    });

    it('Creating a project with custom area should succeed and create a job for that area', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.customArea({ countryCode: 'NAM' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO);

      const resources = response.body.data;
      customAreaProject = resources;
      expect(resources.type).toBe('projects');

      const jobs: Job[] = Object.values(queue.jobs);

      expect(jobs[0].data).toEqual(createProjectDTO);
    });

    it('Creating a project with administrative region data should succeed and create a job for that adm area', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.adminRegion({ countryCode: 'NAM' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO);

      const resources = response.body.data;
      adminAreaProject = resources;
      expect(resources.type).toBe('projects');

      const jobs: Job[] = Object.values(queue.jobs);

      expect(jobs[0].data).toEqual(createProjectDTO);
    });
    /**
     * Finally, we delete the projects we had created to test PU creation
     */
    it('Deleting existing projects should succeed', async () => {
      const response1 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${minimalProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response1.body.data).toBeUndefined();

      const response2 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${customAreaProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response2.body.data).toBeUndefined();

      const response3 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${adminAreaProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response3.body.data).toBeUndefined();

      /**
       * Finally, we delete the organization we had created for these projects
       */
      await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${anOrganization.id}`)
        .set('Authorization', `Bearer ${jwtToken}`);
    });
  });
});
