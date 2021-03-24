import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';
import { IUCNProtectedAreaCategoryDTO } from 'modules/protected-areas/dto/iucn-protected-area-category.dto';
import { IUCNCategory } from 'modules/protected-areas/protected-area.geo.entity';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Organization } from 'modules/organizations/organization.api.entity';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { Project } from 'modules/projects/project.api.entity';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { Scenario } from 'modules/scenarios/scenario.api.entity';

/**
 * Tests for API contracts for the management of protected areas within scenarios.
 */
describe('ProtectedAreasModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });
  let anOrganization: Organization;
  let aProject: Project;

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

    anOrganization = await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    ).then(async (response) => {
      Logger.debug(response);
      return await Deserializer.deserialize(response);
    });

    aProject = await ProjectsTestUtils.createProject(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: anOrganization.id,
      },
    ).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await ProjectsTestUtils.deleteProject(app, jwtToken, aProject.id);
    await OrganizationsTestUtils.deleteOrganization(app, jwtToken, anOrganization.id);

    await Promise.all([app.close()]);
  });

  describe('Scenarios', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2265
     */
    describe.skip('Scenario creation - preparation - upload protected area network geometries', () => {
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
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2146
     */
    describe('Scenario creation - preparation - protected areas by admin area', () => {
      const country = 'NAM';
      const l1AdminArea = 'NAM.13_1';
      const l2AdminArea = 'NAM.13.5_1';

      test('As a user, I should be able to see a list of distinct IUCN categories for protected areas within a given country', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas/iucn-categories?filter[adminAreaId]=${country}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        const iucnCategoriesOfProtectedAreasInCountry: IUCNCategory[] = await Deserializer.deserialize(
          response.body,
        ).then((categories: IUCNProtectedAreaCategoryDTO[]) =>
          categories.map((i) => i.iucnCategory),
        );

        expect(iucnCategoriesOfProtectedAreasInCountry.length).toBeGreaterThan(
          0,
        );
        iucnCategoriesOfProtectedAreasInCountry.forEach((i) => {
          expect(E2E_CONFIG.protectedAreas.categories.valid).toContain(i);
        });
      });

      test.skip('As a user, I should be able to see a list of project-specific protected areas within a given country', async () => {
        const projectSpecificProtectedAreasInCountry = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${country}?type=project-specific&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of distinct IUCN categories for protected areas within a given level 1 admin area', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas/iucn-categories?filter[adminAreaId]=${l1AdminArea}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        const iucnCategoriesOfProtectedAreasInAdminArea: IUCNCategory[] = await Deserializer.deserialize(
          response.body,
        ).then((categories: IUCNProtectedAreaCategoryDTO[]) =>
          categories.map((i) => i.iucnCategory),
        );

        expect(
          iucnCategoriesOfProtectedAreasInAdminArea.length,
        ).toBeGreaterThan(0);
        iucnCategoriesOfProtectedAreasInAdminArea.forEach((i) => {
          expect(E2E_CONFIG.protectedAreas.categories.valid).toContain(i);
        });
      });

      test.skip('As a user, I should be able to see a list of project-specific protected areas within a given level 1 admin area', async () => {
        const projectSpecificProtectedAreasInL1AdminArea = await request(
          app.getHttpServer(),
        )
          .get(
            `/api/v1/protected-areas/by-administrative-area/${l1AdminArea}?type=project-specific&omitFields=theGeom&disablePagination=true`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      });

      test('As a user, I should be able to see a list of distinct IUCN categories for protected areas within a given level 2 admin area', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas/iucn-categories?filter[adminAreaId]=${l2AdminArea}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        const iucnCategoriesOfProtectedAreasInAdminArea: IUCNCategory[] = await Deserializer.deserialize(
          response.body,
        ).then((categories: IUCNProtectedAreaCategoryDTO[]) =>
          categories.map((i) => i.iucnCategory),
        );

        expect(
          iucnCategoriesOfProtectedAreasInAdminArea.length,
        ).toBeGreaterThan(0);
        iucnCategoriesOfProtectedAreasInAdminArea.forEach((i) => {
          expect(E2E_CONFIG.protectedAreas.categories.valid).toContain(i);
        });
      });

      test.skip('As a user, I should be able to see a list of project-specific protected areas within a given level 2 admin area', async () => {
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

    describe.skip('Scenario creation', () => {
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
  });
});
