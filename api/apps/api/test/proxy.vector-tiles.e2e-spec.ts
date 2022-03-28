import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { E2E_CONFIG } from './e2e.config';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { bootstrapApplication } from './utils/api-application';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { FeaturesTestUtils } from './utils/features.test.utils';

// FIXME: At the moment, this test file is not properly written. Each test only expects that the response is 200
// but we should test properly the body of the response to check that the filters are working properly.
describe.skip('ProxyVectorTilesModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });
  let anOrganization: Organization;
  let aProjectWithCountryAsPlanningArea: Project;
  let aScenario: Scenario;
  let aFeature: GeoFeature;
  /**
   * Seed test data includes protected areas in (among a handful of other
   * countries) Namibia, so we create a project in this country, and likewise
   * for tests related to protected areas in a L1 or L2 admin area below.
   *
   */
  const country = 'NAM';
  const l1AdminArea = 'NAM.13_1';
  const l2AdminArea = 'NAM.13.4_1';
  const _geoFeaturesFilters = {
    acinonyx: {
      featureClassName: 'demo_acinonyx_jubatus',
      alias: 'Acinonyx_jubatus',
    },
    partialMatches: { us: 'us' },
  };

  beforeEach(async () => {
    app = await bootstrapApplication();

    jwtToken = await GivenUserIsLoggedIn(app, 'dd');

    anOrganization = await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    ).then(async (response) => {
      return Deserializer.deserialize(response);
    });
    console.log('after org');
    aProjectWithCountryAsPlanningArea = await ProjectsTestUtils.createProject(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryId: country,
          adminAreaLevel1Id: l1AdminArea,
          adminAreaLevel2Id: l2AdminArea,
        }),
        organizationId: anOrganization.id,
      },
    ).then(async (response) => await Deserializer.deserialize(response));

    await ProjectsTestUtils.generateBlmValues(
      app,
      aProjectWithCountryAsPlanningArea.id,
    );
    aFeature = await FeaturesTestUtils.getFeature(
      app,
      jwtToken,
      aProjectWithCountryAsPlanningArea.id,
    );

    aScenario = await ScenariosTestUtils.createScenario(app, jwtToken, {
      ...E2E_CONFIG.scenarios.valid.minimal(),
      projectId: aProjectWithCountryAsPlanningArea.id,
      // wdpaIucnCategories: [IUCNCategory.NotReported],
    }).then(async (response) => await Deserializer.deserialize(response));
  });

  describe('Vector Layers', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
     */
    describe('Admin-areas layers', () => {
      test.todo('The response is a valid mvt');
      test.todo('User upload planning units vector tiles');
      test.todo('Irregular planning units vector tiles');

      test.only('Should give back a valid request for preview', async () => {
        console.log(jwtToken);
        await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
          .set('Accept-Encoding', 'gzip, deflate')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      describe('Filter by guid', () => {
        test('guid country level should be visible', async () => {
          await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/0/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid adm1 level should be visible', async () => {
          await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid adm2 level should be visible', async () => {
          await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/2/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid level > 2 should not be allowed', async () => {
          await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/3/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.BAD_REQUEST);
        });
      });
      test('User should be able to filter by bbox', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt?bbox=[10,10,5,5]',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should throw a 400 error if filtering by z level greater than 20', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/0/preview/tiles/21/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
    describe('WDPA preview vector tiles.', () => {
      test('Should give back a valid request for wdpa preview tile', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/protected-areas/preview/tiles/3/4/4.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .responseType('blob')
          .buffer()
          .expect(HttpStatus.OK);
      });
      test('User should be able to filter by bbox', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/protected-areas/preview/tiles/6/30/25.mvt?bbox=[10,10,5,5]',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Filter by wdpa id', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/protected-areas/preview/tiles/6/30/25.mvt?id=e5c3b978-908c-49d3-b1e3-89727e9f999c',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
    });
    describe('Feature preview vector tiles.', () => {
      test('Should give back a valid request for a feature preview', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/geo-features/${aFeature.id}/preview/tiles/6/30/25.mvt`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
    });
    describe('PUs layer previews', () => {
      test('Should give back a valid request for a regular hexagon PUs vector tile preview', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/hexagon/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should give back a valid request for a regular square PUs vector tile preview', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/square/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should give back a error if the regular grid is not square or hexagon', async () => {
        await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/te/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
    describe('Scenario PUs layers', () => {
      test('Should give back a valid request for a scenario PUs', async () => {
        await request(app.getHttpServer())
          .get(
            `/api/v1/scenarios/${aScenario.id}/planning-units/tiles/6/30/25.mvt`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });

      test('Should give back a valid request for a scenario PUs filtering by include', async () => {
        await request(app.getHttpServer())
          .get(
            `/api/v1/scenarios/${aScenario.id}/planning-units/tiles/6/30/25.mvt?include=protection`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });

      test('Should give back an error if an invalid include param is passed', async () => {
        await request(app.getHttpServer())
          .get(
            `/api/v1/scenarios/${aScenario.id}/planning-units/tiles/6/30/25.mvt?include=protectiosn`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
