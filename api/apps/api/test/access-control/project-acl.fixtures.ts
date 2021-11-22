import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const aaUserToken = await GivenUserIsLoggedIn(app, 'aa');
  const bbUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },

    GivenProjectWasCreated: async () => {
      const { cleanup, projectId } = await GivenProjectExists(app, aaUserToken);
      cleanups.push(cleanup);
      return projectId;
    },

    WhenGettingProjectUsers: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${bbUserToken}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
