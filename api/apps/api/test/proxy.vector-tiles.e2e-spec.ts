import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { tearDown } from './utils/tear-down';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { E2E_CONFIG } from './e2e.config';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { IUCNCategory } from '@marxan-api/modules/protected-areas/protected-area.geo.entity';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { bootstrapApplication } from './utils/api-application';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { FeaturesTestUtils } from './utils/features.test.utils';

const logger = new Logger('test-vtiles');

afterAll(async () => {
  await tearDown();
});

describe('ProxyVectorTilesModule (e2e)', () => {
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
  const l2AdminArea = 'NAM.13.5_1';
  const geoFeaturesFilters = {
    cheeta: { featureClassName: 'iucn_acinonyxjubatus', alias: 'cheetah' },
    partialMatches: { us: 'us' },
  };

  beforeAll(async () => {
    app = await bootstrapApplication();

    jwtToken = await GivenUserIsLoggedIn(app);

    anOrganization = await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    ).then(async (response) => {
      return await Deserializer.deserialize(response);
    });

    aProjectWithCountryAsPlanningArea = await ProjectsTestUtils.createProject(
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

    aFeature = await FeaturesTestUtils.getFeature(
      app,
      jwtToken,
      aProjectWithCountryAsPlanningArea.id,
    );

    aScenario = await ScenariosTestUtils.createScenario(app, jwtToken, {
      ...E2E_CONFIG.scenarios.valid.minimal(),
      projectId: aProjectWithCountryAsPlanningArea.id,
      wdpaIucnCategories: [IUCNCategory.NotReported],
    }).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await ScenariosTestUtils.deleteScenario(app, jwtToken, aScenario.id);

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

  describe('Vector Layers', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
     */
    describe('Admin-areas layers', () => {
      test.todo('The response is a valid mvt');
      test.todo('User upload planning units vector tiles');
      test.todo('Irregular planning units vector tiles');

      test('Should give back a valid request for preview', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
          .set('Accept-Encoding', 'gzip, deflate')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      describe('Filter by guid', () => {
        test('guid country level should be visible', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/0/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid adm1 level should be visible', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid adm2 level should be visible', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/2/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
        });
        test('guid level > 2 should not be allowed', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/3/preview/tiles/6/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.BAD_REQUEST);
        });
      });
      test('User should be able to filter by bbox', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt?bbox=[10,10,5,5]',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should throw a 400 error if filtering by z level greater than 20', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/0/preview/tiles/21/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
    describe('WDPA preview vector tiles.', () => {
      test('Should give back a valid request for wdpa preview tile', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/protected-areas/preview/tiles/6/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('User should be able to filter by bbox', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/protected-areas/preview/tiles/6/30/25.mvt?bbox=[10,10,5,5]',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Filter by wdpa id', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/protected-areas/preview/tiles/6/30/25.mvt?id=e5c3b978-908c-49d3-b1e3-89727e9f999c',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
    });
    describe('Feature preview vector tiles.', () => {
      test('Should give back a valid request for a feature preview', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/geo-features/${aFeature.id}/preview/tiles/6/30/25.mvt`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        logger.error(typeof response.body);
      });
    });
    describe('PUs layer previews', () => {
      test('Should give back a valid request for a regular hexagon PUs vector tile preview', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/hexagon/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should give back a valid request for a regular square PUs vector tile preview', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/square/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
      test('Should give back a error if the regular grid is not square or hexagon', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/v1/planning-units/preview/regular/te/100/tiles/6/30/25.mvt',
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
    describe('Scenario PUs layers', () => {
      test('Should give back a valid request for a scenario PUs', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/scenarios/${aScenario.id}/planning-units/tiles/6/30/25.mvt`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
    });
  });
});
