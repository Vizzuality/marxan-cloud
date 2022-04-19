import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { CompleteExportPiece } from '@marxan-api/modules/clone/export/application/complete-export-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import {
  ArchiveReady,
  Export,
  ExportId,
} from '@marxan-api/modules/clone/export/domain';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 20_000);

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should forbid getting latest exportId to unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenUnrelatedUserRequestLatestExportId();

  fixtures.ThenForbiddenIsReturned(response);
});

test('should permit getting latest exportId of public projects for unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenProjectIsPublic();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenUnrelatedUserRequestLatestExportId();

  fixtures.ThenLatestExportIdIsObtained(response);
});

test('should permit getting latest exportId for owner users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenOwnerUserRequestLatestExportId();

  fixtures.ThenLatestExportIdIsObtained(response);
});

test('should return not found code when trying to obtain latest exportId of a project without exports', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenOwnerUserRequestLatestExportId();

  fixtures.ThenNotFoundIsReturned(response);
});

test('should permit getting latest exportId for contributor users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenContributorUserRequestLatestExportId();

  fixtures.ThenLatestExportIdIsObtained(response);
});

test('should permit getting latest exportId for viewer users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenViewerUserRequestLatestExportId();

  fixtures.ThenLatestExportIdIsObtained(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const fileRepo = app.get(CloningFilesRepository);
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
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);

      await exportRepo.delete({});
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      await app.close();
    },
    GivenProjectWasCreated: async () => {
      const result = await GivenProjectExists(app, ownerToken);
      projectId = result.projectId;
      organizationId = result.organizationId;

      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });

      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });
    },
    GivenProjectIsPublic: async () => {
      await publishedProjectsRepo.save({
        id: projectId,
        name: '',
        description: '',
        originalProject: { id: projectId },
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
    WhenUnrelatedUserRequestLatestExportId: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${unrelatedUserToken}`)
        .send({ scenarioIds: [] }),
    WhenOwnerUserRequestLatestExportId: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ scenarioIds: [] }),
    WhenContributorUserRequestLatestExportId: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .send({ scenarioIds: [] }),
    WhenViewerUserRequestLatestExportId: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ scenarioIds: [] }),
    WhenExportFileIsReady: async () => {
      await eventBusTestUtils.waitUntilEventIsPublished(ArchiveReady);
    },
    ThenLatestExportIdIsObtained: (response: request.Response) => {
      expect(response.status).toBe(200);
      expect(response.body.exportId).toEqual(exportId.value);
      expect(response.body.userId).toBeDefined();
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
    ThenNotFoundIsReturned: (response: request.Response) => {
      expect(response.status).toBe(404);
    },
  };
};
