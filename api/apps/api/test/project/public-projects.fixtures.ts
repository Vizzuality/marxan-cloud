import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const randomUserToken = await GivenUserIsLoggedIn(app);
  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },
    WhenGettingPublicProjects: () =>
      request(app.getHttpServer()).get(`/api/v1/projects/published`),
    ThenNoProjectIsAvailable: (response: request.Response) => {
      expect(response.body).toEqual({
        data: [],
        meta: {
          page: 1,
          size: 25,
          totalItems: 0,
          totalPages: 0,
        },
      });
    },
    GivenPrivateProjectWasCreated: async () => {
      const { cleanup } = await GivenProjectExists(app, randomUserToken);
      cleanups.push(cleanup);
    },
    GivenPublicProjectWasCreated: async () => {
      const { projectId, cleanup } = await GivenProjectExists(
        app,
        randomUserToken,
      );
      await projectsRepo.update(
        {
          id: projectId,
        },
        {
          isPublic: true,
        },
      );
      cleanups.push(cleanup);
      return projectId;
    },
    ThenPublicProjectIsAvailable: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].id).toEqual(publicProjectId);
    },
  };
};
