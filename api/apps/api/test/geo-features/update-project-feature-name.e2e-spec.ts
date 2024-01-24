import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { v4 } from 'uuid';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { GivenUserExists } from '../steps/given-user-exists';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

describe('Project - update feature Name', () => {
  test('should return NotFound error when feature does not exist', async () => {
    const featureId = v4();
    const projectId = fixtures.projectId;
    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      'nonexistent feature',
    );
    await fixtures.ThenFeatureWasNotFound(result, projectId, featureId);
  });

  test('should not permit updating a given feature when the feature is associated to a different project', async () => {
    const originalName = 'someName';
    const anotherProjectId = fixtures.anotherProjectId;
    const featureId = await fixtures.GivenBaseFeature(
      originalName,
      anotherProjectId,
    );
    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      'forbidden update',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      featureId,
      originalName,
      `Feature with id ${featureId} is not editable`,
    );
  });

  test('should not permit updating a given feature, when it is not a custom feature', async () => {
    const originalName = 'someName';
    const featureId = await fixtures.GivenBaseFeature(originalName);
    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      'forbidden update',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      featureId,
      originalName,
      `Feature with id ${featureId} is not editable`,
    );
  });

  test('should not permit updating a given feature, when it is not editable', async () => {
    const originalName = 'someName';
    const viewOnlyProject = fixtures.anotherProjectId;
    const featureId = await fixtures.GivenBaseFeature(
      originalName,
      viewOnlyProject,
    );
    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      'forbidden update',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      featureId,
      originalName,
      `Feature with id ${featureId} is not editable`,
    );
  });

  test('should not permit updating a given feature, when another feature with the same name already exists for the same project', async () => {
    const originalName = 'originalFeatureName';
    const sameName = 'sameName';
    const projectId = fixtures.projectId;
    const originalFeatureId = await fixtures.GivenBaseFeature(
      originalName,
      projectId,
    );
    await fixtures.GivenBaseFeature(sameName, projectId);

    const result = await fixtures.WhenUpdatingFeatureForProject(
      originalFeatureId,
      sameName,
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      originalFeatureId,
      originalName,
      `Feature with id ${originalFeatureId} cannot be updated: name is already in use (${sameName})`,
    );
    await fixtures.ThenGeoFeatureHasName(originalFeatureId, originalName);
  });

  test('should allow updating with the same name if the not permit updating a given feature, when another feature with the same name already exists for the same project', async () => {
    // This is for a special use case when editing in bulk from the frontend
    const sameName = 'sameName';
    const projectId = fixtures.projectId;
    const featureId = await fixtures.GivenBaseFeature(sameName, projectId);

    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      sameName,
    );
    await fixtures.ThenResponseContainsUpdatedFeatureInJsonApiFormat(
      result,
      sameName,
    );
    await fixtures.ThenGeoFeatureHasName(featureId, sameName);
  });

  test('should update the name of a feature, when permitted', async () => {
    const newName = 'newName';
    const projectId = fixtures.projectId;
    const featureId = await fixtures.GivenBaseFeature('someName', projectId);
    const result = await fixtures.WhenUpdatingFeatureForProject(
      featureId,
      newName,
    );
    await fixtures.ThenGeoFeatureHasName(featureId, newName);
    await fixtures.ThenResponseContainsUpdatedFeatureInJsonApiFormat(
      result,
      newName,
    );
  });
});

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userToken = await GivenUserIsLoggedIn(app, 'aa');
  const userId = await GivenUserExists(app, 'aa');

  const geoFeaturesApiRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  const project = await GivenProjectExists(
    app,
    userToken,
    {
      name: `Project ${Date.now()}`,
      countryId: undefined!,
    },
    {
      name: `Organization ${Date.now()}`,
    },
  );
  await userProjectsRepo.save({
    projectId: project.projectId,
    userId: userId,
    roleName: ProjectRoles.project_owner,
  });

  // Another project that will be view only for the current user
  const anotherProject = await GivenProjectExists(
    app,
    userToken,
    {
      name: `Another Project ${Date.now()}`,
      countryId: undefined!,
    },
    {
      name: `Another Organization ${Date.now()}`,
    },
  );
  await userProjectsRepo.save({
    projectId: anotherProject.projectId,
    userId: userId,
    roleName: ProjectRoles.project_viewer,
  });
  await userProjectsRepo.delete({
    projectId: anotherProject.projectId,
    userId: userId,
    roleName: ProjectRoles.project_owner,
  });

  return {
    projectId: project.projectId,
    anotherProjectId: anotherProject.projectId,
    cleanup: async () => {
      //Restore the owner role to anotherProject to avoid errors when cleaning up
      await userProjectsRepo.save({
        projectId: anotherProject.projectId,
        userId: userId,
        roleName: ProjectRoles.project_owner,
      });

      await geoFeaturesApiRepo.delete({});
      await project.cleanup();
      await anotherProject.cleanup();
      await app.close();
    },
    GivenNonExistentProjectId: () => {
      return v4();
    },

    // ARRANGE
    GivenBaseFeature: async (featureClassName: string, projectId?: string) => {
      const baseFeature = await geoFeaturesApiRepo.save({
        id: v4(),
        featureClassName,
        projectId,
        creationStatus: JobStatus.created,
      });
      return baseFeature.id;
    },

    // ACT
    WhenUpdatingFeatureForProject: async (
      featureId: string,
      updatedName: string,
    ) =>
      request(app.getHttpServer())
        .patch(`/api/v1/geo-features/${featureId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          featureClassName: updatedName,
        }),

    // ASSERT
    ThenProjectWasNotFound: async (
      response: request.Response,
      nonExistentProjectId: string,
    ) => {
      expect(response.status).toEqual(404);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(
        `Project with id ${nonExistentProjectId} not found`,
      );
    },
    ThenFeatureWasNotFound: async (
      response: request.Response,
      projectId: string,
      featureId: string,
    ) => {
      expect(response.status).toEqual(404);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(`Feature with id ${featureId} not found`);
    },
    ThenUpdateWasForbidden: async (
      response: request.Response,
      featureId: string,
      originalName: string,
      errorMessage: string,
    ) => {
      expect(response.status).toEqual(403);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(errorMessage);
    },
    ThenGeoFeatureHasName: async (featureId: string, newName: string) => {
      const feature = await geoFeaturesApiRepo.findOne({
        where: {
          id: featureId,
        },
      });
      expect(feature?.featureClassName).toEqual(newName);
    },
    ThenResponseContainsUpdatedFeatureInJsonApiFormat: async (
      result: request.Response,
      newName: string,
    ) => {
      expect(result.status).toEqual(200);
      expect(result.body?.data.attributes.featureClassName).toEqual(newName);
      expect(result.body?.data.type).toEqual('geo_features');
    },
  };
};
