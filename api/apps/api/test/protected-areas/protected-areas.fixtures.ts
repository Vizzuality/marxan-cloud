import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenUserExists } from '../steps/given-user-exists';
import { EntityManager, Repository } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { GivenProjectExists } from '../steps/given-project';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { ProtectedArea } from '@marxan/protected-areas';
import { v4 } from 'uuid';
import * as request from 'supertest';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userToken = await GivenUserIsLoggedIn(app, 'aa');
  const userId = await GivenUserExists(app, 'aa');

  const geoprocessingEntityManager: EntityManager = app.get(
    getEntityManagerToken(apiConnections.geoprocessingDB),
  );

  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  const scenariosRepo: Repository<GeoFeatureTag> = app.get(
    getRepositoryToken(Scenario),
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

  const customProtectedArea = await geoprocessingEntityManager.save(
    ProtectedArea,
    {
      id: v4(),
      projectId: project.projectId,
      fullName: 'custom protected area',
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
    customProtectedAreaId: customProtectedArea.id,
    projectId: project.projectId,
    anotherProjectId: anotherProject.projectId,
    cleanup: async () => {
      //Restore the owner role to anotherProject to avoid errors when cleaning up
      await userProjectsRepo.save({
        projectId: anotherProject.projectId,
        userId: userId,
        roleName: ProjectRoles.project_owner,
      });

      await geoprocessingEntityManager.delete(ProtectedArea, {});
      await scenariosRepo.delete({});
      await project.cleanup();
      await anotherProject.cleanup();
      await app.close();
    },
    GivenNonExistentProjectId: () => {
      return v4();
    },

    // ARRANGE
    GivenBaseProtectedArea: async (fullName: string, projectId?: string) => {
      const protectedArea = await geoprocessingEntityManager.save(
        ProtectedArea,
        {
          fullName,
          projectId,
          id: v4(),
        },
      );
      return protectedArea.id;
    },
    GivenProtectedAreaIsUsedInScenario: async (
      projectId: string,
      protectedAreaId: string,
    ) => {
      await scenariosRepo.save({
        id: v4(),
        name: 'scenario',
        projectId,
        projectScenarioId: 1,
        protectedAreaFilterByIds: [protectedAreaId],
      });
    },

    // ACT
    WhenUpdatingProtectedAreaName: async (paId: string, updatedName: string) =>
      request(app.getHttpServer())
        .patch(`/api/v1/protected-areas/${paId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: updatedName,
        }),

    WhenDeletingProtectedAreaName: async (paId: string) =>
      request(app.getHttpServer())
        .delete(`/api/v1/protected-areas/${paId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(),
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
    ThenProtectedWasNotFound: async (response: request.Response) => {
      expect(response.status).toEqual(404);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(`Protected area not found.`);
    },
    ThenUpdateWasForbidden: async (
      response: request.Response,
      errorMessage: string,
    ) => {
      expect(response.status).toEqual(403);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(errorMessage);
    },
    ThenProtectedAreaHasNewName: async (
      protectedAreaId: string,
      newName: string,
    ) => {
      const protectedArea = await geoprocessingEntityManager.findOne(
        ProtectedArea,
        {
          where: {
            id: protectedAreaId,
          },
        },
      );
      expect(protectedArea?.fullName).toEqual(newName);
    },
    ThenResponseContainsUpdatedProtectedAreaInJsonApiFormat: async (
      result: request.Response,
      newName: string,
    ) => {
      expect(result.status).toEqual(200);
      expect(result.body?.data.attributes.fullName).toEqual(newName);
      expect(result.body?.data.type).toEqual('protected_areas');
    },
    ThenProtectedAreaIsDeleted: async () => {
      const protectedAreas = await geoprocessingEntityManager.find(
        ProtectedArea,
        {},
      );
      expect(protectedAreas).toHaveLength(0);
    },
  };
};
