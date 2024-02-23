import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import * as request from 'supertest';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';
import { GivenProjectsPuExists } from '../../../geoprocessing/test/steps/given-projects-pu-exists';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { tagMaxlength } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';
import { FeatureAmountsPerPlanningUnitEntity } from '@marxan/feature-amounts-per-planning-unit';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { GivenPuSquareGridGeometryExists } from '../../../geoprocessing/test/steps/given-pu-geometries-exists';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { GivenUserExists } from '../steps/given-user-exists';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { waitForEvent } from '../utils/wait-for-feature-to-be-ready.utils';

export const getFixtures = async () => {
  const app = await bootstrapApplication([], [EventBusTestUtils]);
  const eventBusUtils = app.get(EventBusTestUtils);
  eventBusUtils.startInspectingEvents();
  const apiEventService = app.get(ApiEventsService);
  const token = await GivenUserIsLoggedIn(app);
  const userId = await GivenUserExists(app);
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

  const geoEntityManager: EntityManager = app.get(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );

  const customFeatureName = `User custom feature ${Date.now()}`;
  const customFeatureDesc = `User custom feature desc`;

  const geoFeaturesApiRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const geoFeatureDataRepo: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry, DbConnections.geoprocessingDB),
  );
  const planningUnitsRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const projectsPuRepo: Repository<ProjectsPuEntity> = app.get(
    getRepositoryToken(ProjectsPuEntity, DbConnections.geoprocessingDB),
  );
  const geoFeatureTagRepo: Repository<GeoFeatureTag> = app.get(
    getRepositoryToken(GeoFeatureTag),
  );

  const featureImportRegistry: Repository<FeatureAmountUploadRegistry> =
    app.get(
      getRepositoryToken(FeatureAmountUploadRegistry, DbConnections.default),
    );
  const featuresRepository: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature, DbConnections.default),
  );

  const featureAmountsPerPlanningUnitRepo: Repository<FeatureAmountsPerPlanningUnitEntity> =
    app.get(
      getRepositoryToken(
        FeatureAmountsPerPlanningUnitEntity,
        DbConnections.geoprocessingDB,
      ),
    );

  return {
    userId,
    projectId,
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
      await planningUnitsRepo.delete({});
      await projectsPuRepo.delete({});
      await apiEventService.purgeAll();
      await cleanup();
      eventBusUtils.stopInspectingEvents();
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

    GivenProjectPusWithGeometryForProject: async () => {
      const geomType = PlanningUnitGridShape.FromShapefile;
      //These parameters are meant to be generate geometries that intersect with the ones on the feature shapefile wetlands.zip
      const geometries = await GivenPuSquareGridGeometryExists(
        geoEntityManager,
        3,
        18,
        -18,
        23,
        -14,
        geomType,
      );

      let piudCounter = 1;
      const pus: Partial<ProjectsPuEntity>[] = geometries.map((geometry) => ({
        projectId,
        puid: piudCounter++,
        geomId: geometry.id,
        geomType,
      }));

      await geoEntityManager.save(ProjectsPuEntity, pus);
    },

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
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/shapefile`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/wetlands.zip`)
        .field(dto);
      return response;
    },
    WhenUploadingCustomFeatureFromCSV: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/feature_amount_upload.csv`)
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingCsvWithMissingPUIDColumn: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/missing_puids_upload.csv`)
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingCsvWithNoFeatures: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/no_features_upload.csv`)
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingCsvWithDuplicatedPUIDs: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/duplicate_puids_upload.csv`)
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingCsvWhenProjectNotFound: async (falseProjectId: string) => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${falseProjectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + `/import-files/missing_puids_upload.csv`)
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingACSVWithDuplicatedHeaders: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(
          `file`,
          __dirname + `/import-files/duplicate_features_upload.csv`,
        )
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenUploadingCsvWithPuidsNotPresentITheProject: async () => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/features/csv`)
        .set('Authorization', `Bearer ${token}`)
        .attach(
          `file`,
          __dirname + `/import-files/feature_amount_upload_incorrect_puids.csv`,
        )
        .field({
          name: customFeatureName,
          description: customFeatureDesc,
        });
    },
    WhenDeletingFeatureForProject: async (featureClassName: string) => {
      const feature = await featuresRepository.findOneOrFail({
        where: { featureClassName },
      });
      await request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}/features/${feature?.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send();
    },
    // ASSERT
    ThenWaitForApiEvent: (topic: string, kind: API_EVENT_KINDS) => {
      return new Promise<ApiEventByTopicAndKind>((resolve, reject) => {
        const findApiEvent = setInterval(async () => {
          try {
            const event = await apiEventService.getLatestEventForTopic({
              topic,
              kind,
            });
            clearInterval(findApiEvent);

            resolve(event);
          } catch (e) {
            console.error(e);
          }
        }, 150);

        setTimeout(async () => {
          clearInterval(findApiEvent);
          reject();
        }, 6000);
      });
    },
    ThenCSVImportSubmitEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__csv__import__submitted__v1__alpha,
      );
    },
    ThenCSVImportFinishedEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__csv__import__finished__v1__alpha,
      );
    },
    ThenCSVImportFailedEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__csv__import__failed__v1__alpha,
      );
    },

    ThenShapefileImportSubmittedEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__shapefile__import__submitted__v1__alpha,
      );
    },
    ThenShapefileImportFinishedEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__shapefile__import__finished__v1__alpha,
      );
    },
    ThenShapefileImportFailedEventWasSubmitted: async (topic: string) => {
      await waitForEvent(
        apiEventService,
        topic,
        API_EVENT_KINDS.features__shapefile__import__failed__v1__alpha,
      );
    },

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
      // Check response payload, in JSON:API format
      expect(result.status).toBe(HttpStatus.CREATED);

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
          featureDataStableIds: null,
          description,
          alias: null,
          amountMax: 5296399725.20094,
          amountMin: 820348505.9774874,
          propertyName: null,
          intersection: null,
          creationStatus: JobStatus.created,
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
    ThenFeatureAmountsFromShapefileAreCreated: async (
      featureClassName: string,
    ) => {
      const feature = await featuresRepository.findOne({
        where: { featureClassName },
      });
      const featureAmounts = await featureAmountsPerPlanningUnitRepo.find({
        where: { featureId: feature?.id },
        order: { amount: 'DESC' },
      });
      expect(featureAmounts).toHaveLength(3);
      expect(featureAmounts[0].amount).toBeCloseTo(5296399725.20094);
      expect(featureAmounts[1].amount).toBeCloseTo(2643783217.418024);
      expect(featureAmounts[2].amount).toBeCloseTo(820348505.9774874);
    },
    ThenNewFeaturesAreCreated: async () => {
      const newFeaturesAdded = await featuresRepository.find({
        where: {
          featureClassName: In(['feat_1d666bd', 'feat_28135ef']),
        },
      });
      expect(newFeaturesAdded).toHaveLength(2);
      expect(newFeaturesAdded[0].projectId).toBe(projectId);
      expect(newFeaturesAdded[0].isLegacy).toBe(true);
      expect(newFeaturesAdded[1].isLegacy).toBe(true);
      expect(newFeaturesAdded[0].amountMin).toEqual(3.245387225);
      expect(newFeaturesAdded[0].amountMax).toEqual(4.245387225);
      expect(newFeaturesAdded[0].creationStatus).toEqual(JobStatus.created);
    },

    ThenNewFeaturesAmountsAreCreated: async () => {
      const newFeatures1 = await featuresRepository.findOne({
        where: {
          featureClassName: 'feat_1d666bd',
        },
      });
      const newFeatures2 = await featuresRepository.findOne({
        where: {
          featureClassName: 'feat_28135ef',
        },
      });
      const newFeature1Amounts = await geoFeatureDataRepo.find({
        where: { featureId: newFeatures1?.id },
        order: {
          amount: 'DESC',
        },
      });
      const newFeature2Amounts = await geoFeatureDataRepo.find({
        where: { featureId: newFeatures2?.id },
      });

      expect(newFeature1Amounts).toHaveLength(3);
      expect(newFeature2Amounts).toHaveLength(3);
      expect(newFeature1Amounts[0].amount).toBe(4.245387225);
      expect(newFeature1Amounts[1].amount).toBe(4.245387225);
      expect(newFeature1Amounts[2].amount).toBe(3.245387225);

      expect(newFeature2Amounts[0].amount).toBe(0);
      expect(newFeature2Amounts[1].amount).toBe(0);
      expect(newFeature2Amounts[2].amount).toBe(0);
    },
    ThenFeatureAmountPerPlanningUnitAreCreated: async () => {
      const feature1 = await featuresRepository.findOne({
        where: {
          featureClassName: 'feat_1d666bd',
        },
      });
      const feature2 = await featuresRepository.findOne({
        where: {
          featureClassName: 'feat_28135ef',
        },
      });
      const feature1Amounts = await featureAmountsPerPlanningUnitRepo.find({
        where: { featureId: feature1?.id },
        order: {
          amount: 'DESC',
        },
      });
      const feature2Amounts = await featureAmountsPerPlanningUnitRepo.find({
        where: { featureId: feature2?.id },
      });

      expect(feature1Amounts).toHaveLength(3);
      expect(feature2Amounts).toHaveLength(3);
      expect(feature1Amounts[0].amount).toBe(4.245387225);
      expect(feature1Amounts[1].amount).toBe(4.245387225);
      expect(feature1Amounts[2].amount).toBe(3.245387225);

      expect(feature2Amounts[0].amount).toBe(0);
      expect(feature2Amounts[1].amount).toBe(0);
      expect(feature2Amounts[2].amount).toBe(0);
    },
    ThenFeatureAmountsPerPlanningUnitDataIsDeletedForFeatureWithGivenId: async (
      featureId: string,
    ) => {
      const featureAmountsPerPlanningUnitForFeature =
        await featureAmountsPerPlanningUnitRepo.find({
          where: {
            featureId,
          },
        });
      expect(featureAmountsPerPlanningUnitForFeature.length).toBe(0);
    },
    ThenFeatureUploadRegistryIsCleared: async () => {
      const featureImportRegistryRecord = await featureImportRegistry.findOne({
        where: { projectId },
        relations: ['uploadedFeatures'],
      });
      expect(featureImportRegistryRecord?.projectId).toBeUndefined();
      expect(featureImportRegistryRecord?.uploadedFeatures).toBeUndefined();
    },
    ThenMissingPUIDErrorIsReturned: (event: ApiEventByTopicAndKind) => {
      expect(event.data?.name).toEqual(BadRequestException.name);
      expect(event.data?.message).toEqual('Missing PUID column');
    },
    ThenNoFeaturesInCsvFileErrorIsReturned: (event: ApiEventByTopicAndKind) => {
      expect(event.data?.name).toEqual(BadRequestException.name);
      expect(event.data?.message).toEqual(
        'No features found in feature amount CSV upload',
      );
    },
    ThenDuplicatedPUIDErrorIsReturned: (event: ApiEventByTopicAndKind) => {
      expect(event.data?.name).toEqual(BadRequestException.name);
      expect(event.data?.message).toEqual(
        'Duplicate PUIDs in feature amount CSV upload',
      );
    },
    ThenProjectNotFoundErrorIsReturned: (
      result: request.Response,
      falseProjectId: string,
    ) => {
      expect(result.body.errors[0].status).toEqual(HttpStatus.NOT_FOUND);
      expect(result.body.errors[0].title).toEqual(
        `Project with id ${falseProjectId} not found`,
      );
    },
    ThenDuplicatedHeaderErrorIsReturned: (event: ApiEventByTopicAndKind) => {
      expect(event.data?.name).toEqual(BadRequestException.name);
      expect(event.data?.message).toEqual(
        'Duplicate headers found ["feat_1d666bd"]',
      );
    },
    ThenPuidsNotPresentErrorIsReturned: (event: ApiEventByTopicAndKind) => {
      expect(event.data?.name).toEqual(BadRequestException.name);
      expect(event.data?.message).toEqual('Unknown PUIDs');
    },
    AndNoFeatureUploadIsRegistered: async () => {
      const featureImportRegistryRecord = await featureImportRegistry.findOne({
        where: { projectId },
        relations: ['uploadedFeatures'],
      });
      expect(featureImportRegistryRecord).toBeFalsy();
    },
  };
};
