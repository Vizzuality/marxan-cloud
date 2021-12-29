import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PromiseType } from 'utility-types';
import {
  GeoFeature,
  geoFeatureResource,
  JSONAPIGeoFeaturesData,
} from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { tearDown } from './utils/tear-down';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

import { createWorld } from './project/projects-world';

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
    cheeta: {
      featureClassName: 'demo_acinonyx_jubatus',
      alias: 'Acinonyx_jubatus',
    },
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
        expect(response.body.data[0].attributes.isCustom).toEqual(false);
      });

      test('should return a single result of geo-features whose alias property matches a given filter', async () => {
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
        expect(response.body.data[0].attributes.isCustom).toEqual(false);
      });
      test('should return a list of geo-features whose featureClassName property match a given substring', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/projects/${world.projectWithCountry}/features?q=${geoFeaturesFilters.partialMatches.us}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(5);
        response.body.data.map((feature: JSONAPIGeoFeaturesData) => {
          expect(feature.attributes.isCustom).toEqual(false);
        });
      });
      test('should return all available features if query param has no value', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/projects/${world.projectWithCountry}/features?q=`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveLength(9);
        response.body.data.map((feature: JSONAPIGeoFeaturesData) => {
          expect(feature.attributes.isCustom).toEqual(false);
        });
      });
    });
  });
});
