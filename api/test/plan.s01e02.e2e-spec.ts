import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';

/**
 * Tests for API contracts to be included in the upcoming sprint (s01e02), aka
 * Sprint as Code (SaC).
 */
describe('Sprint s01e02', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeEach(async () => {
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

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe.skip('Scenarios', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2265
     */
    describe('Scenario creation - preparation - upload protected area network geometries', () => {
      let protectedAreaNetworkUploadResult: {
        id: string;
        name: string;
        status: string;
      };
      test('As a user, I should be able to upload a shapefile containing a project-specific network of protected areas', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/protected-areas/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(202);

        // we should return an UUID for this upload, so that the client can query for the upload status
        protectedAreaNetworkUploadResult = response.body.data;
      });

      test('As a user, I should be able to know when a protected area network shapefile is ready to use', async () => {
        const protectedAreaNetworkUploadStatus = await request(
          app.getHttpServer(),
        )
          .get(`/api/v1/protected-areas/${protectedAreaNetworkUploadResult.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        // Check for status, keep checking with exponential backoff until we get
        // a response, or timeout within some sensible timeframe.
      });
    });

    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A66
     */
    describe('Scenario creation - preparation - protected area by admin area', () => {
      const country = 'NAM';
      const l1AdminArea = 'NAM.4_1';
      const l2AdminArea = 'NAM.4.9_1';

      test('As a user, I should be able to see a list of IUCN protected areas within a given country', async () => {
        const iucnProtectedAreasInCountry = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas/by-administrative-area/${country}?type=iucn&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of project-specific protected areas within a given country', async () => {
        const projectSpecificProtectedAreasInCountry = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${country}?type=project-specific&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of IUCN protected areas within a given level 1 admin area', async () => {
        const iucnProtectedAreasInL1AdminArea = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${l1AdminArea}?type=iucn&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of project-specific protected areas within a given level 1 admin area', async () => {
        const projectSpecificProtectedAreasInL1AdminArea = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${l1AdminArea}?type=project-specific&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of IUCN protected areas within a given level 2 admin area', async () => {
        const iucnProtectedAreasInL2AdminArea = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${l2AdminArea}?type=iucn&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of project-specific protected areas within a given level 2 admin area', async () => {
        const projectSpecificProtectedAreasInL2AdminArea = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${l2AdminArea}?type=project-specific&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });
    });

    describe('Scenario creation', () => {
      test('As a user, I should be able to create a scenario within a given project', async () => {
        const availableProjects = await request(app.getHttpServer())
          .get('/api/v1/projects?disablePagination=true')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        const allProjects = availableProjects.body.data;
        expect(allProjects[0].type).toBe('projects');
        const aProject = allProjects[0];

        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
        };

        const newScenario = await request(app.getHttpServer())
          .post('/api/v1/scenarios')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(createScenarioDTO)
          .expect(201);

        const aScenario = newScenario.body.data;
      });
    });
    it('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(200);

      expect(results);
    });

    it('A user should be able to update their own metadata', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(200);
    });
  });
});
