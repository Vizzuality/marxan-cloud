import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const { projectId, cleanup } = await GivenProjectExists(
    app,
    token,
    {
      name: `Project ${Date.now()}`,
      countryId: undefined!,
    },
    {
      name: `Organization ${Date.now()}`,
    },
  );
  const customFeatureName = `User custom feature ${Date.now()}`;
  const customFeatureTag = `bioregional`;
  const customFeatureDesc = `User custom feature desc`;

  const geoFeaturesApiRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const geoFeatureDataRepo: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry, DbConnections.geoprocessingDB),
  );

  return {
    cleanup: async () => {
      const feature = await geoFeaturesApiRepo.findOne({
        where: {
          projectId,
        },
      });
      if (feature) {
        await geoFeatureDataRepo.delete({
          featureId: feature.id,
        });
      }
      await geoFeaturesApiRepo.delete({
        projectId,
      });
      await cleanup();
      await app.close();
    },
    WhenUploadingCustomFeature: async () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/shapefile`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/wetlands.zip`)
        .field({
          name: customFeatureName,
          type: customFeatureTag,
          description: customFeatureDesc,
        }),
    ThenGeoFeaturesAreCreated: async (result: request.Response) => {
      expect(result.body).toEqual({
        success: true,
      });
      const features = await geoFeaturesApiRepo.find({
        where: {
          projectId,
        },
      });
      expect(features).toEqual([
        {
          id: expect.any(String),
          featureClassName: customFeatureName,
          description: customFeatureDesc,
          alias: null,
          propertyName: null,
          intersection: null,
          tag: customFeatureTag,
          creationStatus: `done`,
          projectId,
          isCustom: true,
        },
      ]);
      expect(
        await geoFeatureDataRepo.find({
          where: {
            featureId: features[0].id,
          },
          select: ['source', 'featureId'],
        }),
      ).toEqual([
        {
          featureId: features[0].id,
          source: `user_imported`,
        },
      ]);
    },
  };
};
