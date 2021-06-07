import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PromiseType } from 'utility-types';

import { E2E_CONFIG } from './e2e.config';

import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import {
  GeoFeature,
  geoFeatureResource,
} from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { tearDown } from './utils/tear-down';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

afterAll(async () => {
  await tearDown();
});

let world: PromiseType<ReturnType<typeof createWorld>>;

/**
 * Tests for API contracts for the management of geo features within scenarios.
 */
describe('GeoFeaturesModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const geoFeaturesFilters = {
    cheeta: { featureClassName: 'iucn_acinonyxjubatus', alias: 'cheetah' },
    partialMatches: { us: 'us' },
  };

  beforeAll(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);
    world = await createWorld(app, jwtToken);
    if (!world) {
      throw new Error('Could not create fixtures');
    }
  });

  afterAll(async () => {
    await world?.cleanup();
    await app.close();
  });

  describe('GeoFeatures', () => {
    /**
     * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
     */
    describe('Listing GeoFeatures', () => {
      test('As a user, I should be able to retrieve a list of features available within a project', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/projects/${world.projectWithCountry}/features`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        const geoFeaturesForProject: GeoFeature[] = response.body.data;
        expect(geoFeaturesForProject.length).toBeGreaterThan(0);
        expect(response.body.data[0].type).toBe(geoFeatureResource.name.plural);
      });

      test.todo(
        'As a user, when I upload feature shapefiles, I should see the related features in the list of those available within a project',
      );

      test('should return a single result of geo-features whose className property matches a given filter', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${world.projectWithCountry}/features?q=${geoFeaturesFilters.cheeta.featureClassName}`,
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
            `/api/v1/projects/${world.projectWithCountry}/features?q=${geoFeaturesFilters.cheeta.alias}`,
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
            `/api/v1/projects/${world.projectWithCountry}/features?q=${geoFeaturesFilters.partialMatches.us}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(6);
      });
      test('should return all available features if query param has no value', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/projects/${world.projectWithCountry}/features?q=`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(9);
      });
    });
  });
});

/**
 * See note about the choice of country and admin area codes for the
 * following project creation operations in `protected-areas.e2e-spec.ts`.
 */
const country = 'NAM';
const l1AdminArea = 'NAM.13_1';
const l2AdminArea = 'NAM.13.5_1';

const createWorld = async (app: INestApplication, jwtToken: string) => {
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    )
  ).data.id;

  const projectWithCountry = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: country,
      }),
      organizationId,
    })
  ).data.id;

  const projectWithGid1 = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: country,
        adminAreaLevel1Id: l1AdminArea,
      }),
      organizationId,
    })
  ).data.id;

  const projectWithGid2 = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryCode: country,
        adminAreaLevel1Id: l1AdminArea,
        adminAreaLevel2Id: l2AdminArea,
      }),
      organizationId,
    })
  ).data.id;

  return {
    organizationId,
    projectWithCountry,
    projectWithGid1,
    projectWithGid2,
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, jwtToken, projectWithGid2);
      await ProjectsTestUtils.deleteProject(app, jwtToken, projectWithGid1);
      await ProjectsTestUtils.deleteProject(app, jwtToken, projectWithCountry);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        jwtToken,
        organizationId,
      );
    },
  };
};
