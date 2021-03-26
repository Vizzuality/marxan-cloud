import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as config from 'config';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';

import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';
import { Job, Worker } from 'bullmq';
import { PlanningUnitsService } from 'modules/planning-units/planning-units.service';
import { notContains } from 'class-validator';



describe('PlanningUnitsModule (e2e)', () => {
  let app: INestApplication;
  let queueService: PlanningUnitsService = new PlanningUnitsService;
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
    await Promise.all([app.close(), queueService.onModuleDestroy()]);
  });

  describe.only('Planning units', () => {
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
        .send(E2E_CONFIG.organizations.valid.minimal())
        .expect(201);

      anOrganization = response.body.data;

      expect(anOrganization.type).toBe('organizations');
    });

    it('Creates a project with minimum required data should succeed but a job should not ', async () => {

      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: anOrganization.id,
      };

      let processor = jest.fn().mockImplementation((job: Job) => {
        expect(job.data.countryId).toBe(createProjectDTO.countryId);
        expect(job.data.adminAreaLevel1Id).toBe(createProjectDTO.adminAreaLevel1Id);
        expect(job.data.adminAreaLevel2Id).toBe(createProjectDTO.adminAreaLevel2Id);
        Promise.resolve();
        });

      const worker = new Worker(queueService.queueName, processor, config.get('redisApi'));

      await worker.waitUntilReady();

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const resources = response.body.data;
      minimalProject = resources;
      expect(resources.type).toBe('projects');

      expect(processor).not.toHaveBeenCalled();
      await worker.close();
    });

    it('Creating a project with custom area should succeed and create a job for that adm area', async () => {
      jest.setTimeout(10 * 1000);
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.customArea({ countryCode: 'ESP' }),
        organizationId: anOrganization.id,
      };
      let processor = jest.fn().mockImplementation((job: Job) => {
        expect(job.data.countryId).toBe(createProjectDTO.countryId);
        expect(job.data.adminAreaLevel1Id).toBe(createProjectDTO.adminAreaLevel1Id);
        expect(job.data.adminAreaLevel2Id).toBe(createProjectDTO.adminAreaLevel2Id);
        Promise.resolve();
        });

      const worker = new Worker(queueService.queueName, processor, config.get('redisApi'));

      await worker.waitUntilReady();

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const resources = response.body.data;
      customAreaProject = resources;
      expect(resources.type).toBe('projects');

      expect(processor).toHaveBeenCalled();

      await worker.close();
    });

    it('Creating a project with administrative region data should succeed and create a job for that adm area', async () => {
      jest.setTimeout(10 * 1000);

      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.adminRegion({ countryCode: 'ESP' }),
        organizationId: anOrganization.id,
      };
      let processor = jest.fn().mockImplementation((job: Job) => {
        expect(job.data.countryId).toBe(createProjectDTO.countryId);
        expect(job.data.adminAreaLevel1Id).toBe(createProjectDTO.adminAreaLevel1Id);
        expect(job.data.adminAreaLevel2Id).toBe(createProjectDTO.adminAreaLevel2Id);
        Promise.resolve();
        });

      const worker = new Worker(queueService.queueName, processor, config.get('redisApi'));

      await worker.waitUntilReady();

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(201);

      const resources = response.body.data;
      adminAreaProject = resources;
      expect(resources.type).toBe('projects');


      expect(processor).toHaveBeenCalled();

      await worker.close();

    });
      /**
       * Finally, we delete the projects we had created to test PU creation
       */
    it('Deleting existing projects should succeed', async () => {
      const response1 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${minimalProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response1.body.data).toBeUndefined();

      const response2 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${customAreaProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response2.body.data).toBeUndefined();

      const response3 = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${adminAreaProject.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response3.body.data).toBeUndefined();

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
