import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { ImportEntity } from '@marxan-api/modules/clone/import/adapters/entities/imports.api.entity';
import { CompleteImportPiece } from '@marxan-api/modules/clone/import/application/complete-import-piece.command';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import.repository.port';
import {
  AllPiecesImported,
  ImportId,
} from '@marxan-api/modules/clone/import/domain';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ClonePiece, ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { FileRepository } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import * as archiver from 'archiver';
import { isLeft } from 'fp-ts/lib/Either';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 10_000);

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should permit importing project ', async () => {
  await fixtures.GivenImportFile();
  await fixtures.GivenImportWasRequested();

  await fixtures.WhenProjectIsImported();

  await fixtures.ThenImportIsCompleted();
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const commandBus = app.get(CommandBus);
  const importRepo = app.get(ImportRepository);
  const apiEvents = app.get(ApiEventsService);
  const fileRepository = app.get(FileRepository);

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const oldProjectId = v4();

  let projectId: string;
  let importId: ImportId;
  let uriZipFile: string;

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);
      const importRepo = connection.getRepository(ImportEntity);

      await exportRepo.delete({});
      await importRepo.delete({});
      eventBusTestUtils.stopInspectingEvents();
      await app.close();
    },
    GivenImportFile: async () => {
      const exportConfigContent: ProjectExportConfigContent = {
        isCloning: false,
        version: exportVersion,
        name: 'random name',
        description: 'random desc',
        resourceKind: ResourceKind.Project,
        resourceId: oldProjectId,
        pieces: {
          project: [ClonePiece.ExportConfig, ClonePiece.ProjectMetadata],
          scenarios: {},
        },
        scenarios: [],
      };
      const [exportConfig] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ExportConfig,
        'export location',
      );

      const zipFile = archiver(`zip`, {
        zlib: { level: 9 },
      });
      zipFile.append(JSON.stringify(exportConfigContent), {
        name: exportConfig.relativePath,
      });

      await zipFile.finalize();

      const saveZipFileOrError = await fileRepository.save(zipFile);

      if (isLeft(saveZipFileOrError)) throw new Error('could not save zip');

      uriZipFile = saveZipFileOrError.right;
    },
    GivenImportWasRequested: async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/import`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', uriZipFile)
        .expect(201);

      importId = new ImportId(response.body.importId);
      projectId = response.body.projectId;

      const importInstance = await importRepo.find(importId);

      expect(importInstance).toBeDefined();

      importInstance!.toSnapshot().importPieces.forEach((piece) => {
        commandBus.execute(
          new CompleteImportPiece(importId, new ComponentId(piece.id)),
        );
      });
    },
    WhenProjectIsImported: async () => {
      await eventBusTestUtils.waitUntilEventIsPublished(AllPiecesImported);
    },
    ThenImportIsCompleted: async () => {
      let res: ApiEventByTopicAndKind;
      await new Promise<void>((resolve, reject) => {
        const findApiEventInterval = setInterval(async () => {
          try {
            res = await apiEvents.getLatestEventForTopic({
              topic: projectId,
              kind: API_EVENT_KINDS.project__import__finished__v1__alpha,
            });
            clearInterval(findApiEventInterval);
          } catch (error) {}
        }, 1500);
        const apiEventTimeOut = setTimeout(() => {
          clearInterval(findApiEventInterval);
          if (!res) reject('Import API event was not found');
          resolve();
        }, 6000);
      });
      expect(res!.data?.importId).toEqual(importId.value);
    },
  };
};
