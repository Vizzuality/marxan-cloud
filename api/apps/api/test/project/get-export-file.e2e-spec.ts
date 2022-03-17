import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { CompleteExportPiece } from '@marxan-api/modules/clone/export/application/complete-export-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import {
  ArchiveReady,
  Export,
  ExportId,
} from '@marxan-api/modules/clone/export/domain';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 10_000);

test('should forbid downloading export file to unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenUnrelatedUserRequestExportFile();

  fixtures.ThenForbiddenIsReturned(response);
});

test('should permit downloading public project export file for unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenProjectIsPublic();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenUnrelatedUserRequestExportFile();

  fixtures.ThenFileIsDownloaded(response);
});

test('should permit downloading export file for owner users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenOwnerUserRequestExportFile();

  fixtures.ThenFileIsDownloaded(response);
});

test('should permit downloading export file for contributor users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenContributorUserRequestExportFile();

  fixtures.ThenFileIsDownloaded(response);
});

test('should permit downloading export file for viewer users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenViewerUserRequestExportFile();

  fixtures.ThenFileIsDownloaded(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const fileRepo = app.get(FileRepository);
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const publishedProjectsRepo = app.get<Repository<PublishedProject>>(
    getRepositoryToken(PublishedProject),
  );

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const unrelatedUserToken = await GivenUserIsLoggedIn(app, 'dd');

  let projectId: string;
  let organizationId: string;
  let exportId: ExportId;

  const piecesUris: Record<string, string> = {};
  const savePiecesFiles = async (exportInstance: Export) => {
    await Promise.all(
      exportInstance.toSnapshot().exportPieces.map(async (piece, i) => {
        const result = await fileRepo.save(
          Readable.from(`${piece.piece}`),
          'txt',
        );

        if (isLeft(result)) {
          throw new Error(`Error while saving ${piece.id} file`);
        }

        piecesUris[piece.id] = result.right;
      }),
    );
  };

  return {
    GivenProjectWasCreated: async () => {
      const result = await GivenProjectExists(app, ownerToken);
      projectId = result.projectId;
      organizationId = result.organizationId;
    },
    GivenProjectIsPublic: async () => {
      await publishedProjectsRepo.save([
        { id: projectId, name: 'name', description: 'description' },
      ]);
    },
    GivenContributorWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });
    },
    GivenViewerWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });
    },
    GivenExportWasRequested: async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ scenarioIds: [] })
        .expect(201);

      exportId = new ExportId(response.body.id);

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      await savePiecesFiles(exportInstance!);

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
    },
    WhenUnrelatedUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${unrelatedUserToken}`),
    WhenOwnerUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenContributorUserRequestExportFile: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });

      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${contributorToken}`);
    },
    WhenViewerUserRequestExportFile: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });

      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${viewerToken}`);
    },
    WhenExportFileIsReady: async () => {
      await eventBusTestUtils.waitUntilEventIsPublished(ArchiveReady);
    },
    ThenFileIsDownloaded: (response: request.Response) => {
      expect(response.status).toBe(200);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
  };
};
