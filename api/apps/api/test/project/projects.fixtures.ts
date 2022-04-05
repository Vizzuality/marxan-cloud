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
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const adminUserToken = await GivenUserIsLoggedIn(app, 'dd');
  const publishedProjectsRepo: Repository<PublishedProject> = app.get(
    getRepositoryToken(PublishedProject),
  );
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },

    WhenGettingPublicProject: async (projectId: string) =>
      await request(app.getHttpServer()).get(
        `/api/v1/published-projects/${projectId}`,
      ),
    WhenGettingPublicProjectAsAdmin: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/published-projects/${projectId}/by-admin`)
        .set('Authorization', `Bearer ${adminUserToken}`),
    WhenGettingPublicProjects: async () =>
      await request(app.getHttpServer()).get(`/api/v1/published-projects`),
    WhenGettingPublicProjectsAsAdmin: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/published-projects/by-admin`)
        .set('Authorization', `Bearer ${adminUserToken}`),
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
      await publishedProjectsRepo.save({
        id: projectId,
        name: 'Published',
      });
      cleanups.push(() =>
        publishedProjectsRepo
          .delete({
            id: projectId,
          })
          .then(() => void 0),
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
    ThenPublicProjectWithUnderModerationStatusIsAvailable: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].id).toEqual(publicProjectId);
      expect(response.body.data[0].attributes.underModeration).toEqual(true);
    },
    ThenOkIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
    },
    ThenCreatedIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(201);
    },
    ThenNoContentIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(204);
    },
    ThenBadRequestIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
    },
    ThenNotFoundIsReturned: (response: request.Response) => {
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
            bbox: [
              25.25670051574707,
              11.735139846801758,
              -16.959890365600586,
              -28.969440460205078,
            ],
            countryId: 'NAM',
            description: null,
            createdAt: expect.any(String),
            customProtectedAreas: [],
            lastModifiedAt: expect.any(String),
            name: expect.any(String),
            planningUnitAreakm2: expect.any(Number),
            planningUnitGridShape: expect.any(String),
            planningAreaId: 'NAM',
            planningAreaName: 'Namibia',
          },
          id: publicProjectId,
          type: 'projects',
        },
        meta: {},
      });
    },
    ThenPublicProjectDetailsArePresent: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body).toEqual({
        data: {
          attributes: {
            description: null,
            name: expect.any(String),
            underModeration: false,
          },
          id: publicProjectId,
          type: 'published_projects',
        },
        meta: {},
      });
    },
    ThenPublicProjectDetailsWhileUnderModerationArePresent: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body).toEqual({
        data: {
          attributes: {
            description: null,
            name: expect.any(String),
            underModeration: true,
          },
          id: publicProjectId,
          type: 'published_projects',
        },
        meta: {},
      });
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
    WhenGettingProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenGettingProjectAsNotIncludedUser: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${notIncludedUserToken}`),

    WhenPublishingAProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/publish`)
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenUnpublishingAProjectAsProjectOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/unpublish`)
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenPlacingAPublicProjectUnderModerationAsAdmin: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/moderation-status/set`)
        .set('Authorization', `Bearer ${adminUserToken}`),
    WhenPlacingAPublicProjectUnderModerationNotAsAdmin: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/moderation-status/set`)
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenClearingUnderModerationStatusFromAPublicProjectAsAdmin: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/moderation-status/clear`)
        .set('Authorization', `Bearer ${adminUserToken}`),
    WhenClearingUnderModerationStatusAndUnpublishingAsAdmin: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(
          `/api/v1/projects/${projectId}/moderation-status/clear?alsoUnpublish=true`,
        )
        .set('Authorization', `Bearer ${adminUserToken}`),
    WhenClearingUnderModerationStatusFromAPublicProjectNotAsAdmin: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/moderation-status/clear`)
        .set('Authorization', `Bearer ${randomUserToken}`),
  };
};
