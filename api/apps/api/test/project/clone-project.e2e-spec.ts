import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { CompleteExportPiece } from '@marxan-api/modules/clone/export/application/complete-export-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { Export, ExportId } from '@marxan-api/modules/clone/export/domain';
import { ImportEntity } from '@marxan-api/modules/clone/import/adapters/entities/imports.api.entity';
import { CompleteImportPiece } from '@marxan-api/modules/clone/import/application/complete-import-piece.command';
import { AllPiecesImported } from '@marxan-api/modules/clone/import/domain';
import { SchedulePieceImport } from '@marxan-api/modules/clone/infra/import/schedule-piece-import.command';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ClonePiece, ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
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
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should permit cloning a project', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenCloneWasRequested();

  await fixtures.WhenImportIsReady();
  await fixtures.ThenImportIsCompleted();
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const apiEvents = app.get(ApiEventsService);
  const fileRepo = app.get(CloningFilesRepository);
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const ownerUserId = await GivenUserExists(app, 'aa');

  let projectId: string;
  let organizationId: string;
  let exportId: ExportId;
  let clonedProjectId: string;

  const piecesUris: Record<string, string> = {};
  const savePiecesFiles = async (exportInstance: Export) => {
    await Promise.all(
      exportInstance.toSnapshot().exportPieces.map(async (piece, i) => {
        let content = `${piece.piece}`;
        if (piece.piece === ClonePiece.ExportConfig) {
          const exportConfigContent: ProjectExportConfigContent = {
            isCloning: true,
            version: exportVersion,
            name: 'random name',
            description: 'random desc',
            resourceKind: ResourceKind.Project,
            resourceId: projectId,
            pieces: {
              project: exportInstance
                .toSnapshot()
                .exportPieces.map((exportPice) => exportPice.piece),
              scenarios: {},
            },
            scenarios: [],
          };
          content = JSON.stringify(exportConfigContent);
        }

        const result = await fileRepo.save(Readable.from(content));

        if (isLeft(result)) {
          throw new Error(`Error while saving ${piece.id} file`);
        }

        piecesUris[piece.id] = result.right;
      }),
    );
  };

  const completeSchedueleImportPieces = async () => {
    commandBus.subscribe((command) => {
      if (command instanceof SchedulePieceImport) {
        commandBus.execute(
          new CompleteImportPiece(command.importId, command.componentId),
        );
      }
    });
  };

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);
      const importRepo = connection.getRepository(ImportEntity);

      await exportRepo.delete({});
      await importRepo.delete({});
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await userProjectsRepo.save({
        projectId: clonedProjectId,
        userId: ownerUserId,
        roleName: ProjectRoles.project_owner,
      });
      await ProjectsTestUtils.deleteProject(app, ownerToken, clonedProjectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      eventBusTestUtils.stopInspectingEvents();
      await app.close();
    },
    GivenProjectWasCreated: async () => {
      const result = await GivenProjectExists(app, ownerToken);
      projectId = result.projectId;
      organizationId = result.organizationId;
    },
    GivenCloneWasRequested: async () => {
      completeSchedueleImportPieces();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/clone`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ scenarioIds: [] })
        .expect(201);

      exportId = new ExportId(response.body.exportId);
      clonedProjectId = response.body.projectId;

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      await savePiecesFiles(exportInstance!);

      exportInstance!.toSnapshot().exportPieces.forEach((exportedPiece) => {
        commandBus.execute(
          new CompleteExportPiece(
            exportId,
            new ComponentId(exportedPiece.id),
            ClonePieceUrisResolver.resolveFor(
              exportedPiece.piece,
              piecesUris[exportedPiece.id],
            ),
          ),
        );
      });
    },
    WhenImportIsReady: async () => {
      return eventBusTestUtils.waitUntilEventIsPublished(AllPiecesImported);
    },
    ThenImportIsCompleted: async () => {
      return new Promise<void>((resolve, reject) => {
        const findApiEventInterval = setInterval(async () => {
          try {
            await apiEvents.getLatestEventForTopic({
              topic: clonedProjectId,
              kind: API_EVENT_KINDS.project__import__finished__v1__alpha,
            });
            await apiEvents.getLatestEventForTopic({
              topic: projectId,
              kind: API_EVENT_KINDS.project__export__finished__v1__alpha,
            });
            await apiEvents.getLatestEventForTopic({
              topic: clonedProjectId,
              kind: API_EVENT_KINDS.project__clone__finished__v1__alpha,
            });
            clearInterval(findApiEventInterval);
            resolve();
          } catch (error) {}
        }, 150);
        setTimeout(() => {
          clearInterval(findApiEventInterval);
          reject('Import and Clone API event were not found');
        }, 6000);
      });
    },
  };
};
