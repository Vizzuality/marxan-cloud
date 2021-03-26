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
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';
import { IUCNProtectedAreaCategoryDTO } from 'modules/protected-areas/dto/iucn-protected-area-category.dto';
import {
  IUCNCategory,
  ProtectedArea,
} from 'modules/protected-areas/protected-area.geo.entity';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Organization } from 'modules/organizations/organization.api.entity';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { Project } from 'modules/projects/project.api.entity';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { Scenario } from 'modules/scenarios/scenario.api.entity';
import { v4 } from 'uuid';

/**
 * Tests for API contracts for the management of protected areas within
 * scenarios.
 */
describe('ProtectedAreasModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });
  let anOrganization: Organization;
  let aProjectWithCountryAsPlanningArea: Project;
  let aProjectWithALevel1AdminAreaAsPlanningArea: Project;
  let aProjectWithALevel2AdminAreaAsPlanningArea: Project;

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

    /**
     * Seed test data includes protected areas in (among a handful of other
     * countries) Namibia, so we create a project in this country.
     */
    aProjectWithCountryAsPlanningArea = await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: 'NAM',
      }),
      organizationId: anOrganization.id,
    }).then(async (response) => await Deserializer.deserialize(response));

    /**
     * Likewise for protected areas in an L1 area of Namibia
     */
    aProjectWithALevel1AdminAreaAsPlanningArea = await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: 'NAM',
        adminAreaLevel1Id: 'NAM.13_1',
      }),
      organizationId: anOrganization.id,
    }).then(async (response) => await Deserializer.deserialize(response));

    /**
     * Likewise for protected areas in an L2 area of Namibia
     */
    aProjectWithALevel2AdminAreaAsPlanningArea = await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: 'NAM',
        adminAreaLevel1Id: 'NAM.13_1',
        adminAreaLevel2Id: 'NAM.13.5_1',
      }),
      organizationId: anOrganization.id,
    }).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await ProjectsTestUtils.deleteProject(app, jwtToken, aProject.id);
    await OrganizationsTestUtils.deleteOrganization(app, jwtToken, anOrganization.id);

    await Promise.all([app.close()]);
  });

  describe('Protected areas', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2265
     */
    describe.skip('Upload protected area network geometries', () => {
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
    describe('Protected areas by admin area', () => {
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

    describe('Setting protected areas for a scenario', () => {
      /**
       * This test and the following one (same but for updates) may flip to
       * failing depending on seed test data. With current seed test data,
       * selecting WDPA areas with category NotAssigned within the country of
       * Namibia (NAM) will result in a non-empty set of WDPA protected areas.
       */
      test('As a user, when I create a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
          wdpaIucnCategories: [IUCNCategory.NotReported],
        };
        const scenario: Scenario = await ScenariosTestUtils.createScenario(
          app,
          jwtToken,
          createScenarioDTO,
        ).then(async (response) => await Deserializer.deserialize(response));
        expect(scenario.protectedAreaIds?.length).toBeGreaterThan(0);
      });

      test('As a user, when I update a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
        };
        const scenario: Scenario = await ScenariosTestUtils.createScenario(
          app,
          jwtToken,
          createScenarioDTO,
        ).then(async (response) => await Deserializer.deserialize(response));
        expect(scenario.protectedAreaIds?.length).toBe(0);

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/scenarios/${scenario.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            ...createScenarioDTO,
            wdpaIucnCategories: [IUCNCategory.NotReported],
          })
          .expect(HttpStatus.OK);
        const updatedScenario: Scenario = await Deserializer.deserialize(
          response.body,
        );
        expect(updatedScenario.protectedAreaIds?.length).toBeGreaterThan(0);
      });

      test('As a user, when I create a scenario, I should not be able to set the protectedAreaIds property directly', async () => {
        const createScenarioDTO: Partial<CreateScenarioDTO> & {
          protectedAreaIds: string[];
        } = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
          protectedAreaIds: [v4(), v4(), v4()],
        };

        await request(app.getHttpServer())
          .post(`/api/v1/scenarios`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(createScenarioDTO)
          .expect(HttpStatus.BAD_REQUEST);
      });

      /**
       * @debt This test and the next one (same but for update) will need to be
       * updated when we support user uploads of protected areas. Until then, we
       * just pick some random protected areas (which will actually be WDPA
       * areas from the seed test data) and pretend they are user-uploaded
       * protected areas.
       */
      test('As a user, when I create a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
        const protectedAreas: ProtectedArea[] = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .then(async (response) => await Deserializer.deserialize(response.body));

        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
          customProtectedAreaIds: protectedAreas.map((i) => i.id),
        };

        const scenario: Scenario = await ScenariosTestUtils.createScenario(
          app,
          jwtToken,
          createScenarioDTO,
        ).then(async (response) => await Deserializer.deserialize(response));
        expect(scenario.protectedAreaIds?.length).toBeGreaterThan(0);
      });

      test('As a user, when I update a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
        const protectedAreas: ProtectedArea[] = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .then(async (response) => await Deserializer.deserialize(response.body));

        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
        };
        const scenario: Scenario = await ScenariosTestUtils.createScenario(
          app,
          jwtToken,
          createScenarioDTO,
        ).then(async (response) => await Deserializer.deserialize(response));
        expect(scenario.protectedAreaIds?.length).toBe(0);

        const responseForUpdate = await request(app.getHttpServer())
          .patch(`/api/v1/scenarios/${scenario.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            ...createScenarioDTO,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          })
          .expect(HttpStatus.OK);
        const updatedScenario: Scenario = await Deserializer.deserialize(
          responseForUpdate.body,
        );
        expect(updatedScenario.protectedAreaIds?.length).toBeGreaterThan(0);
      });

      test('As a user, when I create a scenario and I try to associate to it protected areas outside of the project boundaries, these areas should not be associated', async () => {
        const countryOfProtectedAreasOutsideOfProjectBoundaries = 'ESP'
        const protectedAreas: ProtectedArea[] = await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas?filter[countryId]=${countryOfProtectedAreasOutsideOfProjectBoundaries}&pageSize=5&pageNumber=1`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .then(async (response) => await Deserializer.deserialize(response.body));

        const createScenarioDTO: Partial<CreateScenarioDTO> = {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: aProject.id,
          customProtectedAreaIds: protectedAreas.map((i) => i.id),
        };

        const scenario: Scenario = await ScenariosTestUtils.createScenario(
          app,
          jwtToken,
          createScenarioDTO,
        ).then(async (response) => await Deserializer.deserialize(response));
        expect(scenario.protectedAreaIds?.length).toBe(0);
      });
    });
  });
});
