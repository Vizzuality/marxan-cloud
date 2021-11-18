import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const randomUserToken = await GivenUserIsLoggedIn(app);
  const publishedProjectsRepo: Repository<PublishedProject> = app.get(
    getRepositoryToken(PublishedProject),
  );
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },

    GivenProjectWasCreated: async () => {
      const { cleanup, projectId } = await GivenProjectExists(
        app,
        randomUserToken,
      );
      cleanups.push(cleanup);
      return projectId;
    },

    WhenGettingProjectUsers: async (projectId: string) =>
      await request(app.getHttpServer()).get(
        `/api/v1/projects/${projectId}/users`,
      ),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
