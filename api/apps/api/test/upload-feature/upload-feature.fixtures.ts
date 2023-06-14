import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { tagMaxlength } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';

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

  const geoFeaturesApiRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const geoFeatureDataRepo: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry, DbConnections.geoprocessingDB),
  );
  const geoFeatureTagRepo: Repository<GeoFeatureTag> = app.get(
    getRepositoryToken(GeoFeatureTag),
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

    // ARRANGE
    GivenFeatureOnProject: async (featureName: string) => {
      const results: {
        id: string;
      }[] = await geoFeaturesApiRepo.query(`INSERT INTO features
            (feature_class_name, alias, description, property_name, intersection, project_id, creation_status, created_by)
          VALUES
            ('${featureName}', 'alias_${featureName}', null, ' name', null, '${projectId}', 'created', (SELECT id FROM users WHERE email = 'aa@example.com'))
          RETURNING id;
        `);

      return results[0].id;
    },

    GivenTagOnFeature: async (featureId: string, tag: string) =>
      await geoFeatureTagRepo.query(`INSERT INTO project_feature_tags
            (project_id, feature_id, tag)
          VALUES
            ('${projectId}', '${featureId}', '${tag}' ) `),

    // ACT
    WhenUploadingCustomFeature: async (
      name: string,
      description: string,
      tagName?: string,
    ) => {
      const dto: any = {
        name,
        description,
      };
      if (tagName) {
        dto.tagName = tagName;
      }
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/shapefile`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/wetlands.zip`)
        .field(dto);
    },

    // ASSERT
    ThenMaxLengthErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(
        `A tag should not be longer than ${tagMaxlength} characters`,
      );
    },

    ThenInvalidTagErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`A tag cannot contain line breaks`);
    },

    ThenNoGeoFeatureIsCreated: async (
      result: request.Response,
      name: string,
    ) => {
      const features = await geoFeaturesApiRepo.find({
        where: {
          projectId,
          featureClassName: name,
        },
      });
      expect(features.length).toBe(0);
    },
    ThenGeoFeatureTagIsCreated: async (name: string, tag: string) => {
      const features = await geoFeaturesApiRepo.find({
        where: {
          projectId,
          featureClassName: name,
        },
      });

      const featureTags = await geoFeatureTagRepo.find({
        where: { projectId, featureId: features[0].id },
      });
      expect(featureTags).toHaveLength(1);
      expect(featureTags[0].tag).toEqual(tag);
    },

    ThenGeoFeaturesAreCreated: async (
      result: request.Response,
      name: string,
      description: string,
    ) => {
      expect(result.body).toEqual({
        success: true,
      });
      const features = await geoFeaturesApiRepo.find({
        where: {
          projectId,
          featureClassName: name,
        },
      });
      expect(features).toEqual([
        {
          id: expect.any(String),
          featureClassName: name,
          description,
          alias: null,
          propertyName: null,
          intersection: null,
          creationStatus: `done`,
          projectId,
          isCustom: true,
          isLegacy: false,
          fromGeoprocessingOps: null,
          geoprocessingOpsHash: null,
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
