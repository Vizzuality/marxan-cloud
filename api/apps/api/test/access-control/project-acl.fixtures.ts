import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerUserToken = await GivenUserIsLoggedIn(app, 'aa');
  const notOwnerUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const projectViewerRole = Roles.project_viewer;
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
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
      const userId = await GivenUserExists(app, 'bb');
      return userId;
    },

    WhenGettingProjectUsersAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenGettingProjectUsersAsNotOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${notOwnerUserToken}`),

    WhenAddingANewUserToTheProjectAsOwner: async (
      projectId: string,
      userId: string,
    ) =>
      await request(app.getHttpServer())
        .patch('/api/v1/roles/projects/users')
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({ projectId, userId, roleName: projectViewerRole }),

    WhenAddingANewUserToTheProjectAsNotOwner: async (
      projectId: string,
      userId: string,
    ) =>
      await request(app.getHttpServer())
        .patch('/api/v1/roles/projects/users')
        .set('Authorization', `Bearer ${notOwnerUserToken}`)
        .send({ projectId, userId, roleName: projectViewerRole }),

    WhenDeletingUserFromProjectAsOwner: async (
      projectId: string,
      userId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${userId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },

    ThenSingleOwnerUserInProjectIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
    },

    ThenAllUsersinProjectAfterAddingOneAreReturned: (
      response: request.Response,
      userId: string,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
      const newUserCreated = response.body.find(
        (user: any) => user.user.id === userId,
      );
      expect(newUserCreated.roleName).toEqual(projectViewerRole);
    },
  };
};
