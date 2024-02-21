import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PromiseType } from 'utility-types';
import {
  GeoFeature,
  geoFeatureResource,
  JSONAPIGeoFeaturesData,
} from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

import { createWorld } from './projects/projects-world';
import { Repository } from 'typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { v4 } from 'uuid';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { range } from 'lodash';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  JobStatus,
  Scenario,
} from '@marxan-api/modules/scenarios/scenario.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import * as fs from 'fs/promises';
import * as path from 'path';

let world: PromiseType<ReturnType<typeof createWorld>>;
let fixtures: FixtureType<typeof getGeoFeatureFixtures>;

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

  beforeEach(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);

    world = await createWorld(app, jwtToken);
    if (!world) {
      throw new Error('Could not create fixtures');
    }
    fixtures = await getGeoFeatureFixtures(app);
  });

  /**
   * https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A2492
   */
  test('As a user, I should be able to retrieve a list features available within a project (excluding currently running and failed ones)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    const geoFeaturesForProject: JSONAPIGeoFeaturesData[] = response.body.data;
    expect(geoFeaturesForProject.length).toBeGreaterThan(0);
    expect(response.body.data[0].type).toBe(geoFeatureResource.name.plural);
    expect(response.body.data[0].attributes.amountRange).toEqual({
      min: null,
      max: null,
    });
    const statuses = geoFeaturesForProject.map(
      (feat) => feat.attributes.creationStatus,
    );
    expect(statuses).not.toContain(JobStatus.failure);
    expect(statuses).not.toContain(JobStatus.running);
  });

  test('As a user, I should be able to retrieve a list features available within a project, including currently running and failed ones if indicated in the request', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .query({ includeInProgress: true })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    const geoFeaturesForProject: JSONAPIGeoFeaturesData[] = response.body.data;
    expect(geoFeaturesForProject.length).toBeGreaterThan(0);
    expect(response.body.data[0].type).toBe(geoFeatureResource.name.plural);

    const statuses = geoFeaturesForProject.map(
      (feat) => feat.attributes.creationStatus,
    );
    expect(statuses).toContain(JobStatus.failure);
    expect(statuses).toContain(JobStatus.running);
  });

  test('should include the min and max amount of the features in the proper units of measure', async () => {
    const projectId = world.projectWithCountry; // doesn't really matter how the project is created for this test
    const sqlName = 'generic_namidia_feature_data';
    const featureId1 = await fixtures.GivenFeatureWithData(
      'legacy',
      sqlName,
      projectId,
    );
    const featureId2 = await fixtures.GivenFeatureWithData(
      'nonLegacyBelow1',
      sqlName,
      projectId,
    );
    const featureId3 = await fixtures.GivenFeatureWithData(
      'nonLegacyOver1',
      sqlName,
      projectId,
    );
    await fixtures.GivenMinMaxAmountForFeature(
      featureId1,
      true,
      22304094,
      0.1234,
    );
    await fixtures.GivenMinMaxAmountForFeature(
      featureId2,
      false,
      123456,
      567890,
    );
    await fixtures.GivenMinMaxAmountForFeature(
      featureId3,
      false,
      123456789,
      567891234,
    );
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    const geoFeaturesForProject: any[] = response.body.data
      .filter((element: any) =>
        [featureId1, featureId2, featureId3].includes(element.id),
      )
      .sort((element: any) => element.name);
    expect(geoFeaturesForProject.length).toBe(3);
    expect(geoFeaturesForProject[0].attributes.featureClassName).toBe('legacy');
    expect(geoFeaturesForProject[0].attributes.amountRange).toEqual({
      min: 22304094,
      max: 0.1234,
    });
    expect(geoFeaturesForProject[1].attributes.featureClassName).toBe(
      'nonLegacyBelow1',
    );
    expect(geoFeaturesForProject[1].attributes.amountRange).toEqual({
      min: parseFloat((0.123456).toFixed(4)),
      max: parseFloat((0.56789).toFixed(4)),
    });
    expect(geoFeaturesForProject[2].attributes.featureClassName).toBe(
      'nonLegacyOver1',
    );
    expect(geoFeaturesForProject[2].attributes.amountRange).toEqual({
      min: Math.round(123.456789),
      max: Math.round(567.891234),
    });
  });

  test('should include correct scenarioUsageCounts for the given project', async () => {
    // This tests accounts for both cases of having platform wide features and custom features assigned to projects

    //ARRANGE
    // The features created in createdWorld  is created as a platform wide feature, while the ones in GiuvenFeatureWithData are custom
    const projectId1 = world.projectWithCountry;
    const projectId2 = world.projectWithGid1;

    // Note: These test features have geometries based off Namidia
    const featureSqlName = 'generic_namidia_feature_data';
    await fixtures.GivenFeatureWithData('feature1', featureSqlName, projectId1);
    await fixtures.GivenFeatureWithData('feature2', featureSqlName, projectId2);

    await fixtures.GivenScenarioFeaturesData('feature1', 5, projectId1);
    await fixtures.GivenScenarioFeaturesData(
      'demo_panthera_pardus',
      3,
      projectId1,
    );
    await fixtures.GivenScenarioFeaturesData('feature2', 1, projectId2);
    await fixtures.GivenScenarioFeaturesData('demo_kobus_leche', 2, projectId2);

    //ACT
    const multipleResponse1 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId1}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);
    const multipleResponse2 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId2}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    // endpoint for retrieving a single feature by id is not implmenented, however the usageCount functionality is still there

    //ASSERT
    expect(multipleResponse1.body.data.length).toBeGreaterThan(0);
    expect(multipleResponse1.body.data[0].type).toBe(
      geoFeatureResource.name.plural,
    );
    for (const geoFeature of multipleResponse1.body.data) {
      const featureClassName = geoFeature.attributes.featureClassName;
      if (featureClassName === 'demo_panthera_pardus') {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(3);
      } else if (featureClassName === 'feature1') {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(5);
      } else {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(0);
      }
    }

    expect(multipleResponse2.body.data.length).toBeGreaterThan(0);
    expect(multipleResponse2.body.data[0].type).toBe(
      geoFeatureResource.name.plural,
    );
    for (const geoFeature of multipleResponse2.body.data) {
      const featureClassName = geoFeature.attributes.featureClassName;
      if (featureClassName === 'feature2') {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(1);
      } else if (featureClassName === 'demo_kobus_leche') {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(2);
      } else {
        expect(geoFeature.attributes.scenarioUsageCount).toBe(0);
      }
    }
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

    const response2 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .query({ q: 'failed_feature' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response2.body.data).toHaveLength(0);

    const response3 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .query({ q: 'running_feature' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response3.body.data).toHaveLength(0);

    const response4 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features`)
      .query({ q: 'running_feature', includeInProgress: true })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response4.body.data).toHaveLength(1);
    expect(response4.body.data[0].attributes.featureClassName).toEqual(
      'running_feature',
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

    const response2 = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithCountry}/features?q=`)
      .query({ includeInProgress: true })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response2.body.data).toHaveLength(11);
    response2.body.data.map((feature: JSONAPIGeoFeaturesData) => {
      expect(feature.attributes.isCustom).toEqual(false);
    });
  });
});

//TODO This tests suite could use further fixtures refactoring
export const getGeoFeatureFixtures = async (app: INestApplication) => {
  //const app = await bootstrapApplication();
  //const userToken = await GivenUserIsLoggedIn(app, 'aa');
  const apiEntityManager = app.get(getEntityManagerToken());
  const geoEntityManager = app.get(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const featureRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const featureGeoRepo: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry, DbConnections.geoprocessingDB),
  );
  const scenarioRepo: Repository<Scenario> = app.get(
    getRepositoryToken(Scenario),
  );

  return {
    GivenMinMaxAmountForFeature: async (
      featureId: string,
      isLegacy: boolean,
      min: number,
      max: number,
    ) => {
      const feature = await featureRepo.findOneOrFail({
        where: { id: featureId },
      });
      feature.isLegacy = isLegacy;
      feature.amountMin = min;
      feature.amountMax = max;

      await featureRepo.save(feature);
    },
    GivenFeatureWithData: async (
      name: string,
      sqlFilename: string,
      projectId?: string,
    ) => {
      // If not passing the projectId, it effectively makes the feature platform-wide

      const [result]: {
        feature_class_name: string;
        id: string;
      }[] = await apiEntityManager.query(`INSERT INTO features
          (feature_class_name, alias, description, project_id, property_name,  intersection, creation_status, created_by)
          VALUES
             ('${name}', '${name}', null,'${
               projectId ? projectId : 'null'
             }', ' name', null, '${
               JobStatus.created
             }', (SELECT id FROM users WHERE email = 'aa@example.com'))
              RETURNING feature_class_name, id;
          `);

      const featureId = result?.id;
      if (!featureId) throw new Error(`Could not create feature ${name}`);

      const filePath = path.join(
        __dirname,
        './fixtures/',
        `${sqlFilename}.sql`,
      );
      const content = await fs.readFile(filePath, 'utf-8');

      await geoEntityManager.query(content.replace(/\$feature_id/g, featureId));
      return featureId;
    },
    GivenScenarioFeaturesData: async (
      featureClassName: string,
      amountOfScenariosForFeature: number,
      projectId: string,
    ) => {
      const feature = await featureRepo.findOneOrFail({
        where: { featureClassName },
      });
      const featureGeo = await featureGeoRepo.findOneOrFail({
        where: { featureId: feature.id },
      });

      const insertValues = [];
      for (const index of range(1, amountOfScenariosForFeature + 1)) {
        const scenarioId = v4();
        await scenarioRepo.insert({
          id: scenarioId,
          name: scenarioId,
          projectId,
        });
        insertValues.push({
          id: v4(),
          featureDataId: featureGeo.id,
          scenarioId: scenarioId,
          apiFeatureId: feature.id,
          featureId: index,
        });
      }

      await geoEntityManager
        .createQueryBuilder()
        .insert()
        .into(ScenarioFeaturesData)
        .values(insertValues as QueryDeepPartialEntity<ScenarioFeaturesData>[])
        .execute();

      return insertValues;
    },
  };
};
