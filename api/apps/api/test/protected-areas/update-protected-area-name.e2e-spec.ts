import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {getEntityManagerToken, getRepositoryToken} from '@nestjs/typeorm';
import * as request from 'supertest';
import {EntityManager, Repository} from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { v4 } from 'uuid';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { GivenUserExists } from '../steps/given-user-exists';
import {ProtectedArea} from "@marxan/protected-areas";
import {geoprocessingConnections} from "@marxan-geoprocessing/ormconfig";
import {apiConnections} from "@marxan-api/ormconfig";
import {Polygon} from "geojson";

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

describe('Protected Area - update protected area Name', () => {
  test('should return NotFound error when protected are does not exist', async () => {
    const protectedAreaId = v4();
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'new pa name',
    );
    await fixtures.ThenProtectedWasNotFound(result);
  });


  test('should not permit updating global protected area', async () => {
    const originalName = 'global protected area';
    const protectedAreaId = await fixtures.GivenBaseProtectedArea('global protected area');
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'ne pa name',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `Global protected areas are not editable.`,
    );
  });

  test('should not permit updating a given feature, when it is not editable', async () => {
    const originalName = 'someName';
    const viewOnlyProject = fixtures.anotherProjectId;
    const protectedAreaId = await fixtures.GivenBaseProtectedArea(
      'new pa name',
      viewOnlyProject,
    );
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      'new pa name',
    );
    await fixtures.ThenUpdateWasForbidden(
      result,
      `User not allowed to edit protected areas of the project`,
    );
  });

  test('should update the name of a protected area, when permitted', async () => {
    const newName = 'new name';
    const projectId = fixtures.projectId;
    const protectedAreaId = await fixtures.GivenBaseProtectedArea('someName', projectId);
    const result = await fixtures.WhenUpdatingProtectedAreaName(
      protectedAreaId,
      newName,
    );
    await fixtures.ThenProtectedAreaHasNewName(protectedAreaId, newName);
    await fixtures.ThenResponseContainsUpdatedProtectedAreaInJsonApiFormat(
      result,
      newName,
    );
  });
});

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userToken = await GivenUserIsLoggedIn(app, 'aa');
  const userId = await GivenUserExists(app, 'aa');

  const geoprocessingEntityManager: EntityManager = app.get(
    getEntityManagerToken(apiConnections.geoprocessingDB),
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

  const customProtectedArea = await geoprocessingEntityManager.save(ProtectedArea, {
    id: v4(),
    name: 'custom protected area',
  });
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
      await project.cleanup();
      await anotherProject.cleanup();
      await app.close();
    },
    GivenNonExistentProjectId: () => {
      return v4();
    },

    // ARRANGE
    GivenBaseProtectedArea: async (fullName: string, projectId?: string) => {
      const globalProtecetdArea = await geoprocessingEntityManager.save(ProtectedArea, {
        fullName,
        projectId,
        id: v4(),
      });
      return globalProtecetdArea.id;
    },

    // ACT
    WhenUpdatingProtectedAreaName: async (
      paId: string,
      updatedName: string,
    ) =>
      request(app.getHttpServer())
        .patch(`/api/v1/protected-areas/${paId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: updatedName,
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
    ThenProtectedWasNotFound: async (
      response: request.Response,
    ) => {
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
    ThenProtectedAreaHasNewName: async (protectedAreaId: string, newName: string) => {
      const protectedArea = await geoprocessingEntityManager.findOne(ProtectedArea, {
        where: {
          id: protectedAreaId,
        },
      });
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
  };
};
