import { HttpStatus, INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import * as request from 'supertest';
import * as JSONAPISerializer from 'jsonapi-serializer';
import PBF  from 'pbf';
import { tearDown } from './utils/tear-down';
import { Scenario } from 'modules/scenarios/scenario.api.entity';
import { Organization } from 'modules/organizations/organization.api.entity';
import { Project } from 'modules/projects/project.api.entity';
import { AppModule } from 'app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { E2E_CONFIG } from './e2e.config';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { IUCNCategory } from 'modules/protected-areas/protected-area.geo.entity';

const logger = new Logger('test-vtiles')

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

    aScenario = await ScenariosTestUtils.createScenario(
      app,
      jwtToken,
      {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: aProjectWithCountryAsPlanningArea.id,
        wdpaIucnCategories: [IUCNCategory.NotReported],
      },
    ).then(async (response) => await Deserializer.deserialize(response));

  });

  afterAll(async () => {
    await ScenariosTestUtils.deleteScenario(
      app,
      jwtToken,
      aScenario.id,
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

  describe('Vector Layers', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
     */
     describe('Admin-areas layers', () => {
      test.todo(
        'we should test that the response is a valid mvt',
      );
      test('Should give back a valid request for preview',
      async () => {
        const response = await request(app.getHttpServer())
        .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
        .set('Accept-Encoding', 'gzip, deflate')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK)
      })
      describe('Filter by guid',() => {
        test.skip('guid country level',
        async () => {
            const response = await request(app.getHttpServer())
              .get('/api/v1/administrative-areas/1/preview/tiles/100/60/30.mvt')
              .set('Authorization', `Bearer ${jwtToken}`)
              .expect(HttpStatus.OK);
        });
        test.skip('guid adm1 level',
        async () => {
            const response = await request(app.getHttpServer())
              .get('/api/v1/administrative-areas/1/preview/tiles/100/60/30.mvt')
              .set('Authorization', `Bearer ${jwtToken}`)
              .expect(HttpStatus.OK);
        });
      });

      test.skip('Filter by bbox',
        async () => {
            const response = await request(app.getHttpServer())
              .get('/api/v1/administrative-areas/1/preview/tiles/100/60/30.mvt')
              .set('Authorization', `Bearer ${jwtToken}`)
              .expect(HttpStatus.OK);
        });

      test('Should simulate an error if input is invalid',
      async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/1/preview/tiles/100/60/30.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.BAD_REQUEST);
      });

      test('Should throw a 400 error if filtering by level other than 0, 1 or 2',
        async () => {
          const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/3/preview/tiles/6/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      test('Should throw a 400 error if filtering by z level greater than 20',
        async () => {
          const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
    describe('WDPA layers', () => {
      test.skip('Should give back a valid request for wdpa preview',
      async () => {
          const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);
      });
    });
    describe('Feature layer previews', () => {
    test('Should give back a valid request for a feature preview',
    async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
          .set('Authorization', `Bearer ${jwtToken}`);

        logger.error(typeof(response.body))
        // response.expect(HttpStatus.OK);
      });
    });
    describe('PUs layer previews', () => {
      test('Should give back a valid request for a PUs preview',
      async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
      });
    });
    describe('Scenario PUs layers', () => {
      test.skip('Should give back a valid request for a scenario PUs',
      async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);
      });
    });
  });
});
