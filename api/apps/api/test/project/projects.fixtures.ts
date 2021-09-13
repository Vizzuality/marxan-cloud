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

    WhenGettingPublicProject: async (projectId: string) =>
      await request(app.getHttpServer()).get(
        `/api/v1/projects/published/${projectId}`,
      ),
    WhenGettingPublicProjects: async () =>
      await request(app.getHttpServer()).get(`/api/v1/projects/published`),
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
      const { cleanup, projectId } = await GivenProjectExists(
        app,
        randomUserToken,
      );
      cleanups.push(cleanup);
      return projectId;
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
    ThenNotFoundIsReturned: (response: request.Response) => {
      console.log(response.status);
      expect(response.status).toEqual(404);
    },
    ThenProjectDetailsArePresent: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body).toEqual({
        data: {
          attributes: {
            adminAreaLevel1Id: null,
            adminAreaLevel2Id: null,
            bbox: null,
            countryId: null,
            description: null,
            createdAt: expect.any(String),
            customProtectedAreas: [],
            lastModifiedAt: expect.any(String),
            name: expect.any(String),
            planningUnitAreakm2: expect.any(Number),
            planningUnitGridShape: expect.any(String),
          },
          id: publicProjectId,
          type: 'projects',
        },
      });
    },
    WhenGettingProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${randomUserToken}`),
  };
};
