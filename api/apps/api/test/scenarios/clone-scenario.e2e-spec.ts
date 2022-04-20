import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { CompleteExportPiece } from '@marxan-api/modules/clone/export/application/complete-export-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { Export, ExportId } from '@marxan-api/modules/clone/export/domain';
import { ImportEntity } from '@marxan-api/modules/clone/import/adapters/entities/imports.api.entity';
import { CompleteImportPiece } from '@marxan-api/modules/clone/import/application/complete-import-piece.command';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import.repository.port';
import { AllPiecesImported } from '@marxan-api/modules/clone/import/domain';
import { SchedulePieceImport } from '@marxan-api/modules/clone/infra/import/schedule-piece-import.command';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ClonePiece, ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { HttpStatus } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { Subscription } from 'rxjs';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
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

test('should permit cloning a scenario for owner users', async () => {
  await fixtures.GivenScenarioWasCreated();
  const response = await fixtures.WhenCloneIsRequestedBy();
  await fixtures.WhenSchedulePiecesCompletes(response);

  await fixtures.WhenImportIsReady();
  await fixtures.ThenImportIsCompleted();
});

test('should permit cloning a scenario for contributor users ', async () => {
  await fixtures.GivenScenarioWasCreated();
  const contributorToken = await fixtures.GivenContributorWasAddedToProject();

  const response = await fixtures.WhenCloneIsRequestedBy({
    token: contributorToken,
  });
  await fixtures.WhenSchedulePiecesCompletes(response);

  await fixtures.WhenImportIsReady();
  await fixtures.ThenImportIsCompleted();
});

test('should forbid cloning a scenario for viewer users ', async () => {
  await fixtures.GivenScenarioWasCreated();
  const viewerToken = await fixtures.GivenViewerWasAddedToProject();

  const response = await fixtures.WhenCloneIsRequestedBy({
    token: viewerToken,
  });

  fixtures.ThenForbiddenIsReturned(response);
});

test('should forbid cloning an nonexistent scenario for viewer users ', async () => {
  await fixtures.GivenNoScenarioWasCreated();

  const response = await fixtures.WhenCloneIsRequestedBy();

  fixtures.ThenNotFoundIsReturned(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const apiEvents = app.get(ApiEventsService);
  const importRepo = app.get(ImportRepository);
  const fileRepo = app.get(CloningFilesRepository);
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');

  let projectId: string;
  let scenarioId: string;
  let organizationId: string;
  let exportId: ExportId;
  let clonedScenarioId: string;
  let importPiecesSchedueler: Subscription;

  const piecesUris: Record<string, string> = {};
  const savePiecesFiles = async (exportInstance: Export) => {
    await Promise.all(
      exportInstance.toSnapshot().exportPieces.map(async (piece, i) => {
        let content = `${piece.piece}`;
        if (piece.piece === ClonePiece.ExportConfig) {
          const exportConfigContent: ScenarioExportConfigContent = {
            isCloning: true,
            version: exportVersion,
            name: 'random name',
            description: 'random desc',
            resourceKind: ResourceKind.Scenario,
            resourceId: scenarioId,
            projectId,
            pieces: exportInstance
              .toSnapshot()
              .exportPieces.map((exportPice) => exportPice.piece),
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
    importPiecesSchedueler = commandBus.subscribe((command) => {
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
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      eventBusTestUtils.stopInspectingEvents();
      importPiecesSchedueler.unsubscribe();
      await app.close();
    },
    GivenScenarioWasCreated: async () => {
      const result = await GivenProjectExists(app, ownerToken);
      projectId = result.projectId;
      const scenario = await GivenScenarioExists(app, projectId, ownerToken);
      scenarioId = scenario.id;
      organizationId = result.organizationId;
    },
    GivenNoScenarioWasCreated: async () => {
      projectId = v4();
      scenarioId = v4();
      organizationId = v4();
    },
    GivenContributorWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });
      return contributorToken;
    },
    GivenViewerWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });
      return viewerToken;
    },

    WhenCloneIsRequestedBy: async (
      opts: { token: string } = { token: ownerToken },
    ) => {
      completeSchedueleImportPieces();

      return request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/clone`)
        .set('Authorization', `Bearer ${opts.token}`);
    },
    WhenSchedulePiecesCompletes: async (response: request.Response) => {
      expect(response.status).toBe(201);

      exportId = new ExportId(response.body.exportId);
      clonedScenarioId = response.body.scenarioId;

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
              { kind: ResourceKind.Scenario, scenarioId },
            ),
          ),
        );
      });
    },
    WhenImportIsReady: async () => {
      await eventBusTestUtils.waitUntilEventIsPublished(AllPiecesImported);
    },
    ThenImportIsCompleted: async () => {
      return new Promise<void>((resolve, reject) => {
        const findApiEventInterval = setInterval(async () => {
          try {
            await apiEvents.getLatestEventForTopic({
              topic: clonedScenarioId,
              kind: API_EVENT_KINDS.scenario__import__finished__v1__alpha,
            });
            await apiEvents.getLatestEventForTopic({
              topic: projectId,
              kind: API_EVENT_KINDS.scenario__export__finished__v1__alpha,
            });
            await apiEvents.getLatestEventForTopic({
              topic: clonedScenarioId,
              kind: API_EVENT_KINDS.scenario__clone__finished__v1__alpha,
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
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    },
    ThenNotFoundIsReturned: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    },
  };
};
