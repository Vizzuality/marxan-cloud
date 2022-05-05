import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { blmImageMock } from '@marxan-api/modules/scenarios/__mock__/blm-image-mock';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { HttpStatus } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { validate, version } from 'uuid';
import { ApiEventsService } from '../../src/modules/api-events';
import { ApiEventByTopicAndKind } from '../../src/modules/api-events/api-event.topic+kind.api.entity';
import { CompleteExportPiece } from '../../src/modules/clone/export/application/complete-export-piece.command';
import { ExportRepository } from '../../src/modules/clone/export/application/export-repository.port';
import { ArchiveReady, ExportId } from '../../src/modules/clone/export/domain';
import { CompleteImportPiece } from '../../src/modules/clone/import/application/complete-import-piece.command';
import { AllPiecesImported } from '../../src/modules/clone/import/domain';
import { SchedulePieceImport } from '../../src/modules/clone/infra/import/schedule-piece-import.command';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const randomUserToken = await GivenUserIsLoggedIn(app, 'aa');
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const userThatClonesTheProjectToken = await GivenUserIsLoggedIn(app, 'cc');
  const adminUserToken = await GivenUserIsLoggedIn(app, 'dd');
  const publishedProjectsRepo: Repository<PublishedProject> = app.get(
    getRepositoryToken(PublishedProject),
  );
  const cleanups: (() => Promise<void>)[] = [];

  const apiEvents = app.get(ApiEventsService);
  const exportRepo = app.get(ExportRepository);
  const fileRepo = app.get(CloningFilesRepository);
  const commandBus = app.get(CommandBus);
  const eventBusTestUtils = app.get(EventBusTestUtils);

  eventBusTestUtils.startInspectingEvents();

  return {
    cleanup: async () => {
      eventBusTestUtils.stopInspectingEvents();
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
    GivenScenarioWasCreated: async (projectId: string) => {
      const result = await ScenariosTestUtils.createScenario(
        app,
        randomUserToken,
        {
          name: `Test scenario`,
          type: ScenarioType.marxan,
          projectId,
        },
      );

      return result.data.id;
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
    GivenPublicProjectExportIdIsAvailable: async (projectId: string) => {
      const publishedProject = await publishedProjectsRepo.find({
        id: projectId,
      });

      return publishedProject[0].exportId;
    },
    ThenPublicProjectIsAvailable: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].id).toEqual(publicProjectId);
    },
    ThenPublicProjectIsUpdated: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data.id).toEqual(publicProjectId);
      expect(response.body.data.type).toEqual('published_projects');
      expect(response.body.data.attributes.name).toEqual('Updated Name');
      expect(response.body.data.attributes.description).toEqual(
        'Updated Description',
      );
      expect(response.body.data.attributes.location).toEqual(
        'Updated Location',
      );
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
            metadata: null,
            publicMetadata: null,
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
            name: expect.any(String),
            underModeration: false,
            description: null,
            company: null,
            resources: null,
            creators: null,
            location: null,
            pngData: null,
            exportId: null,
          },
          id: publicProjectId,
          type: 'published_projects',
        },
        meta: {},
      });
    },
    ThenCompletePublicProjectDetailsWithoutExportIdArePresent: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body).toEqual({
        data: {
          attributes: {
            name: expect.any(String),
            underModeration: false,
            description: expect.any(String),
            company: {
              name: expect.any(String),
              logoDataUrl: expect.any(String),
            },
            creators: [
              {
                displayName: expect.any(String),
                avatarDataUrl: expect.any(String),
              },
            ],
            resources: [{ title: expect.any(String), url: expect.any(String) }],
            location: expect.any(String),
            pngData: expect.any(String),
          },
          id: publicProjectId,
          type: 'published_projects',
        },
        meta: {},
      });
    },
    ThenCompletePublicProjectDetailsWithExportIdArePresent: (
      publicProjectId: string,
      response: request.Response,
    ) => {
      expect(response.body).toEqual({
        data: {
          attributes: {
            name: expect.any(String),
            underModeration: false,
            description: expect.any(String),
            company: {
              name: expect.any(String),
              logoDataUrl: expect.any(String),
            },
            creators: [
              {
                displayName: expect.any(String),
                avatarDataUrl: expect.any(String),
              },
            ],
            resources: [{ title: expect.any(String), url: expect.any(String) }],
            location: expect.any(String),
            pngData: expect.any(String),
            exportId: expect.any(String),
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
            name: expect.any(String),
            underModeration: true,
            description: expect.any(String),
            location: expect.any(String),
            company: {
              name: expect.any(String),
              logoDataUrl: expect.any(String),
            },
            creators: [
              {
                displayName: expect.any(String),
                avatarDataUrl: expect.any(String),
              },
            ],
            resources: [{ title: expect.any(String), url: expect.any(String) }],
            pngData: expect.any(String),
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
    WhenPublishingAProject: async (projectId: string, scenarioId: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/publish`)
        .send({
          name: 'example project',
          description: 'fake description',
          location: 'fake location',
          company: { name: 'logo', logoDataUrl: blmImageMock },
          creators: [{ displayName: 'fake name', avatarDataUrl: blmImageMock }],
          resources: [{ title: 'fake url', url: 'http://www.example.com' }],
          config: { baseUrl: 'example/png', cookie: 'randomCookie' },
          featuredScenarioId: scenarioId,
        })
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenUpdatingAPublicProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/published-projects/${projectId}`)
        .send({
          name: 'Updated Name',
          description: 'Updated Description',
          location: 'Updated Location',
        })
        .set('Authorization', `Bearer ${randomUserToken}`),
    WhenUpdatingAPublicProjectAsNotIncludedUser: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/published-projects/${projectId}`)
        .send({
          name: 'Updated Name',
          description: 'Updated Description',
          location: 'Updated Location',
        })
        .set('Authorization', `Bearer ${notIncludedUserToken}`),
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
    WhenCloningAPublicProject: async (exportId: string) => {
      commandBus.subscribe((command) => {
        if (command instanceof SchedulePieceImport) {
          commandBus.execute(
            new CompleteImportPiece(command.importId, command.componentId),
          );
        }
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/published-projects/${exportId}/clone`)
        .set('Authorization', `Bearer ${userThatClonesTheProjectToken}`)
        .send()
        .expect(HttpStatus.CREATED);

      const importId: string = res.body.importId;
      const projectId: string = res.body.projectId;

      expect(importId).toBeDefined();
      expect(projectId).toBeDefined();
      expect(validate(importId) && version(importId) === 4).toEqual(true);
      expect(validate(projectId) && version(projectId) === 4).toEqual(true);

      await eventBusTestUtils.waitUntilEventIsPublished(AllPiecesImported);

      return { importId, projectId };
    },
    GivenProjectHasAnExportPrepared: async (projectId: string) => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${randomUserToken}`)
        .send({ scenarioIds: [] })
        .expect(HttpStatus.CREATED);

      const exportId = new ExportId(response.body.id);

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      const piecesUris: Record<string, string> = {};
      await Promise.all(
        exportInstance!.toSnapshot().exportPieces.map(async (piece, i) => {
          const result = await fileRepo.saveCloningFile(
            exportInstance!.id.value,
            Readable.from(`${piece.piece}`),
            `${piece.piece}.txt`,
          );

          if (isLeft(result)) {
            throw new Error(`Error while saving ${piece.id} file`);
          }

          piecesUris[piece.id] = result.right;
        }),
      );

      exportInstance!.toSnapshot().exportPieces.forEach((piece) => {
        commandBus.execute(
          new CompleteExportPiece(exportId, new ComponentId(piece.id), [
            new ComponentLocation(
              piecesUris[piece.id],
              `${piece.id}-${piece.piece}.txt`,
            ),
          ]),
        );
      });

      await eventBusTestUtils.waitUntilEventIsPublished(ArchiveReady);

      return exportId.value;
    },
    GivenPublicProjectHasAnExportPrepared: async (expId: string) => {
      const exportId = new ExportId(expId);

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      const piecesUris: Record<string, string> = {};
      await Promise.all(
        exportInstance!.toSnapshot().exportPieces.map(async (piece, i) => {
          const result = await fileRepo.saveCloningFile(
            exportInstance!.id.value,
            Readable.from(`${piece.piece}`),
            `${piece.piece}.txt`,
          );

          if (isLeft(result)) {
            throw new Error(`Error while saving ${piece.id} file`);
          }

          piecesUris[piece.id] = result.right;
        }),
      );

      exportInstance!.toSnapshot().exportPieces.forEach((piece) => {
        commandBus.execute(
          new CompleteExportPiece(exportId, new ComponentId(piece.id), [
            new ComponentLocation(
              piecesUris[piece.id],
              `${piece.id}-${piece.piece}.txt`,
            ),
          ]),
        );
      });

      await eventBusTestUtils.waitUntilEventIsPublished(ArchiveReady);

      return exportId.value;
    },
    ThenTheProjectShouldBeImported: async (
      newProjectId: string,
      importId: string,
    ) => {
      const res = await new Promise<ApiEventByTopicAndKind>(
        (resolve, reject) => {
          const findApiEventInterval = setInterval(async () => {
            try {
              const event = await apiEvents.getLatestEventForTopic({
                topic: newProjectId,
                kind: API_EVENT_KINDS.project__import__finished__v1__alpha,
              });
              clearInterval(findApiEventInterval);
              resolve(event);
            } catch (error) {}
          }, 150);
          setTimeout(() => {
            clearInterval(findApiEventInterval);
            reject('Import finished API event was not found');
          }, 6000);
        },
      );
      expect(res.data?.importId).toEqual(importId);
    },
  };
};
