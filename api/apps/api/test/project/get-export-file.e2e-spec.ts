import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import {
  CompletePiece,
  ComponentLocation,
} from '@marxan-api/modules/clone/export/application/complete-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import {
  ArchiveReady,
  Export,
  ExportId,
} from '@marxan-api/modules/clone/export/domain';
import { FileRepository } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, EventBus, IEvent } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { Subscription } from 'rxjs';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { Class } from 'utility-types';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';

async function untilEventIsEmitted<T extends IEvent>(
  eventClass: Class<T>,
  eventBus: EventBus,
): Promise<T> {
  let subscription: Subscription;
  const event = await new Promise<T>((resolve) => {
    subscription = eventBus.subscribe((event) => {
      if (event instanceof eventClass) {
        resolve(event);
      }
    });
  });

  subscription!.unsubscribe();

  return event;
}

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 10_000);

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should forbid getting export file to unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenUnrelatedUserRequestExportFile();

  fixtures.ThenForbiddenIsReturned(response);
});

test('should permit getting export file for owner users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenOwnerUserRequestExportFile();

  fixtures.ThenFileIsRetrieved(response);
});

test('should permit getting export file for contributor users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenContributorWasAddedToProject();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenContributorUserRequestExportFile();

  fixtures.ThenFileIsRetrieved(response);
});

test('should permit getting export file for viewer users ', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenViewerWasAddedToProject();
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenViewerUserRequestExportFile();

  fixtures.ThenFileIsRetrieved(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const eventBus = app.get(EventBus);
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const fileRepo = app.get(FileRepository);
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
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
          throw new Error(`Error while saving ${piece.id.value} file`);
        }

        piecesUris[piece.id.value] = result.right;
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
        .expect(201);

      exportId = new ExportId(response.body.id);

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      await savePiecesFiles(exportInstance!);

      exportInstance!.toSnapshot().exportPieces.forEach((piece) => {
        commandBus.execute(
          new CompletePiece(exportId, piece.id, [
            new ComponentLocation(
              piecesUris[piece.id.value],
              `${piece.id.value}-${piece.piece}.txt`,
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
    WhenContributorUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenViewerUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export/${exportId.value}`)
        .set('Authorization', `Bearer ${viewerToken}`),
    WhenExportFileIsReady: async () => {
      await untilEventIsEmitted(ArchiveReady, eventBus);
    },
    ThenFileIsRetrieved: (response: request.Response) => {
      expect(response.status).toBe(200);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
  };
};
