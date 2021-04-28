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
import { difference } from 'lodash';
import {
  GeoFeature,
  geoFeatureResource,
} from 'modules/geo-features/geo-feature.api.entity';
import { JSONAPISerializerConfig } from 'utils/app-base.service';

/**
 * Tests for API contracts for the management of geo features within scenarios.
 */
describe('GeoFeaturesModule (e2e)', () => {
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
   * See note about the choice of country and admin area codes for the
   * following project creation operations in `protected-areas.e2e-spec.ts`.
   */
  const country = 'NAM';
  const l1AdminArea = 'NAM.13_1';
  const l2AdminArea = 'NAM.13.5_1';
  const geoFeaturesFilters = {
    cheeta: { featureClassName: 'iucn_acinonyxjubatus', alias: 'cheetah' },
    partialMatches: { us: 'us' },
  };

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

  describe('GeoFeatures', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
     */
    describe('Listing GeoFeatures', () => {
      test('As a user, I should be able to retrieve a list of features available within a project', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${aProjectWithCountryAsPlanningArea.id}/features`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        const geoFeaturesForProject: GeoFeature[] = await Deserializer.deserialize(
          response.body,
        );
        expect(geoFeaturesForProject.length).toBeGreaterThan(0);
        expect(response.body.data[0].type).toBe(geoFeatureResource.name.plural);
      });

      test.todo(
        'As a user, when I upload feature shapefiles, I should see the related features in the list of those available within a project',
      );

      test('should return a single result of geo-features whose className property matches a given filter', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${aProjectWithCountryAsPlanningArea.id}/features?q=${geoFeaturesFilters.cheeta.featureClassName}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].attributes.featureClassName).toEqual(
          geoFeaturesFilters.cheeta.featureClassName,
        );
      });

      test.skip('should return a single result of geo-features whose alias property matches a given filter', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${aProjectWithCountryAsPlanningArea.id}/features?q=${geoFeaturesFilters.cheeta.alias}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].attributes.alias).toEqual(
          geoFeaturesFilters.cheeta.alias,
        );
      });
      test('should return a list of geo-features whose featureClassName property match a given substring', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${aProjectWithCountryAsPlanningArea.id}/features?q=${geoFeaturesFilters.partialMatches.us}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        /**
         * Here we just assert the result length since result match can come either from aliases or
         * featureClassNames, and we have control over stored test data
         */
        expect(response.body.data).toHaveLength(6);
      });
      test('should return all available features if query param has no value', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${aProjectWithCountryAsPlanningArea.id}/features?q=`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(9);
      });
    });
  });
});
