import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
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
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import * as archiver from 'archiver';
import { createWriteStream, rmSync } from 'fs';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import { ExportId } from '../../src/modules/clone';
import { ExportRepository } from '../../src/modules/clone/export/application/export-repository.port';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';

let fixtures: FixtureType<typeof getFixtures>;

async function saveFile(path: string, stream: Readable): Promise<string> {
  const writer = createWriteStream(path);

  return new Promise((resolve, reject) => {
    writer.on('close', () => {});
    writer.on(`finish`, () => {
      resolve(path);
    });
    writer.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    stream.pipe(writer);
  });
}

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

  await fixtures.ThenForeignExportIsCreated();
  await fixtures.ThenImportIsCompleted();
});

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const commandBus = app.get(CommandBus);
  const importRepo = app.get(ImportRepository);
  const exportRepo = app.get(ExportRepository);
  const apiEvents = app.get(ApiEventsService);

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const oldProjectId = v4();

  let projectId: string;
  let importId: ImportId;
  const exportId = ExportId.create();
  let uriZipFile: string;

  return {
    cleanup: async () => {
      rmSync(uriZipFile, { force: true, recursive: true });
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
        exportId: exportId.value,
      };
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ExportConfig,
      );
      const projectMetadataRelativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectMetadata,
      );
      const projectMetadataContent: ProjectMetadataContent = {
        name: 'test project',
        description: 'description',
      };

      const zipFile = archiver(`zip`, {
        zlib: { level: 9 },
      });
      zipFile.append(JSON.stringify(exportConfigContent), {
        name: relativePath,
      });
      zipFile.append(JSON.stringify(projectMetadataContent), {
        name: projectMetadataRelativePath,
      });

      await zipFile.finalize();

      uriZipFile = await saveFile(__dirname + '/export.zip', zipFile);
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
    ThenForeignExportIsCreated: async () => {
      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();
      expect(exportInstance?.toSnapshot().foreignExport).toBe(true);
    },
    ThenImportIsCompleted: async () => {
      const res = await new Promise<ApiEventByTopicAndKind>(
        (resolve, reject) => {
          const findApiEventInterval = setInterval(async () => {
            try {
              const event = await apiEvents.getLatestEventForTopic({
                topic: projectId,
                kind: API_EVENT_KINDS.project__import__finished__v1__alpha,
              });
              clearInterval(findApiEventInterval);
              resolve(event);
            } catch (error) {}
          }, 150);
          setTimeout(() => {
            clearInterval(findApiEventInterval);
            reject('Import API event was not found');
          }, 6000);
        },
      );
      expect(res!.data?.importId).toEqual(importId.value);
    },
  };
};
