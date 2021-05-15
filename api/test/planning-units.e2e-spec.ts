import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';

import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';
import { Job } from 'bullmq';
import { PlanningUnitsService } from 'modules/planning-units/planning-units.service';

const logger: Logger = new Logger('tests-planning-units');

describe('PlanningUnitsModule (e2e)', () => {
  let app: INestApplication;
  const queueService: PlanningUnitsService = new PlanningUnitsService();
  let jwtToken: string;
  // const Deserializer = new JSONAPISerializer.Deserializer({
  //   keyForAttribute: 'camelCase',
  // });

  /**
   * Set to true if queue data should be removed after each run (see
   * `afterEach()` below). Keeping in mind that long-running workers may still
   * be writing to Redis after tests have run, so there may still be new data
   * showing up in Redis.
   */

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
    /**
     * Create an organization for all of the projects in the test suite.
     *
     * No need to assert much here, though we may want to halt the execution
     * of the test suite if the organization cannot be created for whatever
     * reason.
     */
    // anOrganization = await OrganizationsTestUtils.createOrganization(
    //   app,
    //   jwtToken,
    //   E2E_CONFIG.organizations.valid.minimal(),
    // ).then(async (response) => {
    //   return await Deserializer.deserialize(response);
    // });
    /**
     * we pause the queue so workers will not take any job.
     */
    await queueService.planningUnitsQueue.pause();
  });
  afterEach(async function () {
    await queueService.planningUnitsQueue.drain(true);
  });

  afterAll(async () => {
    /**
     * On teardown, delete the organization created for the test suite's
     * projects.
     * @debt this will be implemented once pr with this functionality is merged
     */
    /**
     * we resume the paused queue after cleanning the jobs.
     */
    await queueService.planningUnitsQueue.resume();
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

    it.skip('Creates a project with minimum required data, it should succeed but a job should not be created', async () => {
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

      expect(await queueService.planningUnitsQueue.count()).toBe(0);
    });

    it.skip('Creating a project with custom area should succeed and create a job for that area', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.customArea({ countryCode: 'NAM' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(HttpStatus.CREATED);

      const resources = response.body.data;
      customAreaProject = resources;
      expect(resources.type).toBe('projects');

      expect(await queueService.planningUnitsQueue.count()).toBe(1);

      const jobs: Job[] = await queueService.planningUnitsQueue.getJobs(
        'waiting',
      );

      expect(jobs[0].data).toStrictEqual(createProjectDTO);
    });

    it.skip('Creating a project with administrative region data should succeed and create a job for that adm area', async () => {
      const createProjectDTO: Partial<CreateProjectDTO> = {
        ...E2E_CONFIG.projects.valid.adminRegion({ countryCode: 'NAM' }),
        organizationId: anOrganization.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createProjectDTO)
        .expect(HttpStatus.CREATED);

      const resources = response.body.data;
      adminAreaProject = resources;
      expect(resources.type).toBe('projects');
      expect(await queueService.planningUnitsQueue.count()).toBe(1);

      const jobs: Job[] = await queueService.planningUnitsQueue.getJobs(
        'waiting',
      );

      expect(jobs[0].data).toStrictEqual(createProjectDTO);
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
