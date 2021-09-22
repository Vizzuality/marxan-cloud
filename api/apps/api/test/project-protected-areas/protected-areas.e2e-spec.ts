import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from '../e2e.config';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { IUCNProtectedAreaCategoryDTO } from '@marxan-api/modules/protected-areas/dto/iucn-protected-area-category.dto';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { v4 } from 'uuid';
import { tearDown } from '../utils/tear-down';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { IUCNCategory } from '@marxan/iucn';
import { ProtectedArea } from '@marxan/protected-areas';

afterAll(async () => {
  await tearDown();
});

/**
 * Tests for API contracts for the management of protected areas within
 * scenarios.
 */
describe.skip('ProtectedAreasModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });
  let anOrganization: Organization;
  let aProjectWithCountryAsPlanningArea: Project;
  let aProjectWithALevel1AdminAreaAsPlanningArea: Project;
  let aProjectWithALevel2AdminAreaAsPlanningArea: Project;
  /**
   * Seed test data includes protected areas in (among a handful of other
   * countries) Namibia, so we create a project in this country, and likewise
   * for tests related to protected areas in a L1 or L2 admin area below.
   *
   * If/when updating seed test data, we need to make sure choices of
   * country/admin areas, IUCN categories and ids of custom admin areas lead
   * to protected areas and project planning areas to intersect as intended
   * for these tests.
   *
   * For a quick check, we can use a query like this:
   *
   * select pa.id, pa.wdpaid, pa.full_name, pa.iucn_cat, pa.status, pa.desig,
   * aa.gid_0, aa.gid_1, aa.gid_2 from wdpa pa
   * left join admin_regions aa on ST_Intersects(pa.the_geom, aa.the_geom);
   */
  const country = 'NAM';
  const l1AdminArea = 'NAM.13_1';
  const l2AdminArea = 'NAM.13.5_1';

  beforeAll(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);

    // TODO refactors
    // TODO world
    // TODO error handling
    anOrganization = Deserializer.deserialize(
      await OrganizationsTestUtils.createOrganization(
        app,
        jwtToken,
        E2E_CONFIG.organizations.valid.minimal(),
      ),
    );

    aProjectWithCountryAsPlanningArea = await ProjectsTestUtils.createProject(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: country,
        }),
        organizationId: anOrganization.id,
      },
    ).then(async (response) => await Deserializer.deserialize(response));

    aProjectWithALevel1AdminAreaAsPlanningArea = await ProjectsTestUtils.createProject(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: country,
          adminAreaLevel1Id: l1AdminArea,
        }),
        organizationId: anOrganization.id,
      },
    ).then(async (response) => await Deserializer.deserialize(response));

    aProjectWithALevel2AdminAreaAsPlanningArea = await ProjectsTestUtils.createProject(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: country,
          adminAreaLevel1Id: l1AdminArea,
          adminAreaLevel2Id: l2AdminArea,
        }),
        organizationId: anOrganization.id,
      },
    ).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await ProjectsTestUtils.deleteProject(
      app,
      jwtToken,
      aProjectWithALevel2AdminAreaAsPlanningArea.id,
    );
    await ProjectsTestUtils.deleteProject(
      app,
      jwtToken,
      aProjectWithALevel1AdminAreaAsPlanningArea.id,
    );
    await ProjectsTestUtils.deleteProject(
      app,
      jwtToken,
      aProjectWithCountryAsPlanningArea.id,
    );
    await OrganizationsTestUtils.deleteOrganization(
      app,
      jwtToken,
      anOrganization.id,
    );
    await Promise.all([app.close()]);
  });

  describe('Protected areas', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2146
     */
    describe('Protected areas by admin area', () => {
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
    });

    describe('Setting protected areas for a scenario', () => {
      describe('Scenarios with a country as planning area', () => {
        /**
         * This test and the following one (same but for updates) may flip to
         * failing depending on seed test data. With current seed test data,
         * selecting WDPA areas with category NotAssigned within the country of
         * Namibia (NAM) will result in a non-empty set of WDPA protected areas.
         */
        test('As a user, when I create a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
            wdpaIucnCategories: [IUCNCategory.NotReported],
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

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
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        test('As a user, when I create a scenario, I should not be able to set the protectedAreaIds property directly', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> & {
            protectedAreaIds: string[];
          } = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
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
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

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
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        test('As a user, when I create a scenario and I try to associate to it protected areas outside of the project boundaries, these areas should not be associated', async () => {
          const countryOfProtectedAreasOutsideOfProjectBoundaries = 'ESP';
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=${countryOfProtectedAreasOutsideOfProjectBoundaries}&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithCountryAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBe(0);
        });
      });

      describe(`Scenarios with a level 1 GADM area as planning area`, () => {
        /**
         * This test and the following one (same but for updates) may flip to
         * failing depending on seed test data. With current seed test data,
         * selecting WDPA areas with category NotAssigned within the country of
         * Namibia (NAM) will result in a non-empty set of WDPA protected areas.
         */
        test('As a user, when I create a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel1AdminAreaAsPlanningArea.id,
            wdpaIucnCategories: [IUCNCategory.NotApplicable],
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel1AdminAreaAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

          const response = await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenario.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              ...createScenarioDTO,
              wdpaIucnCategories: [IUCNCategory.NotApplicable],
            })
            .expect(HttpStatus.OK);
          const updatedScenario: Scenario = await Deserializer.deserialize(
            response.body,
          );
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        /**
         * @debt This test and the next one (same but for update) will need to be
         * updated when we support user uploads of protected areas. Until then, we
         * just pick some random protected areas (which will actually be WDPA
         * areas from the seed test data) and pretend they are user-uploaded
         * protected areas.
         */
        test('As a user, when I create a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel1AdminAreaAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel1AdminAreaAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

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
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        test('As a user, when I create a scenario and I try to associate to it protected areas outside of the project boundaries, these areas should not be associated', async () => {
          const countryOfProtectedAreasOutsideOfProjectBoundaries = 'ESP';
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=${countryOfProtectedAreasOutsideOfProjectBoundaries}&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel1AdminAreaAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBe(0);
        });
      });

      describe(`Scenarios with a level 2 GADM area as planning area`, () => {
        /**
         * This test and the following one (same but for updates) may flip to
         * failing depending on seed test data. With current seed test data,
         * selecting WDPA areas with category NotAssigned within the country of
         * Namibia (NAM) will result in a non-empty set of WDPA protected areas.
         */
        test('As a user, when I create a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel2AdminAreaAsPlanningArea.id,
            wdpaIucnCategories: [IUCNCategory.NotApplicable],
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate WDPA protected areas to it via their IUCN category', async () => {
          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel2AdminAreaAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

          const response = await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenario.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              ...createScenarioDTO,
              wdpaIucnCategories: [IUCNCategory.NotApplicable],
            })
            .expect(HttpStatus.OK);
          const updatedScenario: Scenario = await Deserializer.deserialize(
            response.body,
          );
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        /**
         * @debt This test and the next one (same but for update) will need to be
         * updated when we support user uploads of protected areas. Until then, we
         * just pick some random protected areas (which will actually be WDPA
         * areas from the seed test data) and pretend they are user-uploaded
         * protected areas.
         */
        test('As a user, when I create a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel2AdminAreaAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeGreaterThan(0);
        });

        test('As a user, when I update a scenario, I should be able to associate custom protected areas to it via their UUID', async () => {
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=NAM&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel2AdminAreaAsPlanningArea.id,
          };
          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBeUndefined();

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
          expect(
            updatedScenario.protectedAreaFilterByIds?.length,
          ).toBeGreaterThan(0);
        });

        test('As a user, when I create a scenario and I try to associate to it protected areas outside of the project boundaries, these areas should not be associated', async () => {
          const countryOfProtectedAreasOutsideOfProjectBoundaries = 'ESP';
          const protectedAreas: ProtectedArea[] = await request(
            app.getHttpServer(),
          )
            .get(
              `/api/v1/protected-areas?filter[countryId]=${countryOfProtectedAreasOutsideOfProjectBoundaries}&pageSize=5&pageNumber=1`,
            )
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(
              async (response) => await Deserializer.deserialize(response.body),
            );

          const createScenarioDTO: Partial<CreateScenarioDTO> = {
            ...E2E_CONFIG.scenarios.valid.minimal(),
            projectId: aProjectWithALevel2AdminAreaAsPlanningArea.id,
            customProtectedAreaIds: protectedAreas.map((i) => i.id),
          };

          const scenario: Scenario = await ScenariosTestUtils.createScenario(
            app,
            jwtToken,
            createScenarioDTO,
          ).then(async (response) => await Deserializer.deserialize(response));
          expect(scenario.protectedAreaFilterByIds?.length).toBe(0);
        });
      });
    });
  });
});
