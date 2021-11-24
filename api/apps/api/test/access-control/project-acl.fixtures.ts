import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerUserToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerUserToken = await GivenUserIsLoggedIn(app, 'cc');
  const otherOwnerUserToken = await GivenUserIsLoggedIn(app, 'dd');
  const ownerUserId = await GivenUserExists(app, 'aa');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const otherOwnerUserId = await GivenUserExists(app, 'dd');
  const projectViewerRole = Roles.project_viewer;
  const projectContributorRole = Roles.project_contributor;
  const projectOwnerRole = Roles.project_owner;
  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await userProjectsRepo.delete({
        userId: ownerUserId,
      });
      await userProjectsRepo.delete({
        userId: contributorUserId,
      });
      await userProjectsRepo.delete({
        userId: viewerUserId,
      });
      await userProjectsRepo.delete({
        userId: otherOwnerUserId,
      });
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },

    GivenProjectWasCreated: async () => {
      const { cleanup, projectId } = await GivenProjectExists(
        app,
        ownerUserToken,
      );
      cleanups.push(cleanup);
      return projectId;
    },

    GivenUserWasCreatedAndNotOwner: async () => {
      const existingUserId = await GivenUserExists(app, 'bb');
      return existingUserId;
    },

    WhenGettingProjectUserAsNotInProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${otherOwnerUserToken}`),

    WhenGettingProjectUsersAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenGettingProjectUsersAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenGettingProjectUsersAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`),

    WhenGettingProjectUsersAsOtherOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${otherOwnerUserToken}`),

    WhenAddingANewViewerToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({ projectId, userId: viewerUserId, roleName: projectViewerRole }),
    WhenAddingANewContributorToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: contributorUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),
    WhenAddingANewViewerToTheProjectAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({ projectId, userId: viewerUserId, roleName: projectViewerRole }),
    WhenAddingANewContributorToTheProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),
    WhenAddingANewViewerToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectViewerRole,
        }),
    WhenAddingANewContributorToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: contributorUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),

    WhenRevokingAccessToViewerFromProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToContributorFromProjectAsOwner: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/projects/${projectId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenRevokingAccessToViewerFromProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${contributorUserToken}`),
    WhenRevokingAccessToContributorFromProjectAsViewer: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/projects/${projectId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenRevokingAccessToLastOwnerFromProjectAsOwner: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${ownerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },

    ThenNoContentIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(204);
    },

    ThenSingleOwnerUserInProjectIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
    },

    ThenAllUsersinProjectAfterAddingAnOwnerAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
      const newUserCreated = response.body.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(newUserCreated.roleName).toEqual(projectOwnerRole);
    },

    ThenAllUsersinProjectAfterEveryTypeOfUserHasBeenAddedAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(4);
    },
  };
};
