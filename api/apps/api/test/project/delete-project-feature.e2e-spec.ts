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

describe('Project - Delete Feature', () => {
  test('should return NotFound error when project does not exist', async () => {
    const nonExistentProjectId = v4();
    const result = await fixtures.WhenDeletingFeatureForProject(
      nonExistentProjectId,
      v4(),
    );
    await fixtures.ThenProjectOrFeatureWasNotFound(
      result,
      `Project with id ${nonExistentProjectId} not found`,
    );
  });

  test('should return NotFound error when feature does not exist', async () => {
    const featureId = v4();
    const projectId = fixtures.projectId;
    const result = await fixtures.WhenDeletingFeatureForProject(
      projectId,
      featureId,
    );
    await fixtures.ThenProjectOrFeatureWasNotFound(
      result,
      `Feature with id ${featureId}, for project with id ${projectId}, not found`,
    );
  });

  test('should not permit updating a given feature when the feature is associated to a different project', async () => {
    const projectId = fixtures.projectId;
    const anotherProjectId = fixtures.anotherProjectId;
    const featureId = await fixtures.GivenBaseFeature(
      'differentProject',
      anotherProjectId,
    );
    const result = await fixtures.WhenDeletingFeatureForProject(
      projectId,
      featureId,
    );
    await fixtures.ThenDeleteWasForbidden(
      result,
      featureId,
      `Feature with id ${featureId}, for project with id ${projectId}, cannot be deleted`,
    );
  });

  test('should not permit updating a given feature, when it is not a custom feature', async () => {
    const projectId = fixtures.projectId;
    const featureId = await fixtures.GivenBaseFeature('customFeature');
    const result = await fixtures.WhenDeletingFeatureForProject(
      projectId,
      featureId,
    );
    await fixtures.ThenDeleteWasForbidden(
      result,
      featureId,
      `Feature with id ${featureId}, for project with id ${projectId}, cannot be deleted`,
    );
  });

  test('should not permit updating a given feature, when it is still linked to a scenario', async () => {
    const viewOnlyProjectId = fixtures.anotherProjectId;
    const featureId = await fixtures.GivenBaseFeature(
      'linkedFeature',
      viewOnlyProjectId,
    );
    const result = await fixtures.WhenDeletingFeatureForProject(
      viewOnlyProjectId,
      featureId,
    );
    await fixtures.ThenDeleteWasForbidden(
      result,
      featureId,
      `Feature with id ${featureId}, for project with id ${viewOnlyProjectId}, cannot be deleted`,
    );
  });

  test('should not permit updating a given feature, when it is not deletable', async () => {
    const viewOnlyProjectId = fixtures.anotherProjectId;
    const featureId = await fixtures.GivenBaseFeature(
      'notDeletable',
      viewOnlyProjectId,
    );
    const result = await fixtures.WhenDeletingFeatureForProject(
      viewOnlyProjectId,
      featureId,
    );
    await fixtures.ThenDeleteWasForbidden(
      result,
      featureId,
      `Feature with id ${featureId}, for project with id ${viewOnlyProjectId}, cannot be deleted`,
    );
  });

  test('should delete the name of a feature, when permitted', async () => {
    const projectId = fixtures.projectId;
    const featureId = await fixtures.GivenBaseFeature(
      'deletedFeature',
      projectId,
    );
    const result = await fixtures.WhenDeletingFeatureForProject(
      projectId,
      featureId,
    );
    await fixtures.ThenGeoFeaturesIsDeleted(result, featureId);
  });
});

// NOTE:
// A very remote edge that could happen is whenever an user has a new feature specification without being
// confirmed as a draft yet open in an tab, then adds the feature to the feature specification, and before
// confirming, they delete the feature itself on another tab, and then confirms the specification.
// After discussions, it's considered too remote to test, but put here for future reference

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
  //Edit the project roles in order to have a view only project for testing
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
      await geoFeaturesApiRepo.clear();
      await project.cleanup();

      //restores the project owner role because if not an error will throw when deleting
      await userProjectsRepo.save({
        projectId: anotherProject.projectId,
        userId: userId,
        roleName: ProjectRoles.project_owner,
      });
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
    WhenDeletingFeatureForProject: async (
      projectId: string,
      featureId: string,
    ) =>
      request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}/features/${featureId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(),

    // ASSERT
    ThenProjectOrFeatureWasNotFound: async (
      response: request.Response,
      errorMessage: string,
    ) => {
      expect(response.status).toEqual(404);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(errorMessage);
    },

    ThenDeleteWasForbidden: async (
      response: request.Response,
      featureId: string,
      errorMessage: string,
    ) => {
      expect(response.status).toEqual(403);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(errorMessage);

      const features = await geoFeaturesApiRepo.findOne({
        where: { id: featureId },
      });
      expect(features).not.toBeNull();
    },

    ThenGeoFeaturesIsDeleted: async (
      result: request.Response,
      featureId: string,
    ) => {
      expect(result.status).toEqual(200);
      const feature = await geoFeaturesApiRepo.findOne({
        where: { id: featureId },
      });
      expect(feature).toBeNull();
    },
  };
};
