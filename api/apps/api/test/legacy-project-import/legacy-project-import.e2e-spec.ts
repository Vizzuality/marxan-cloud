import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import { LegacyProjectImportFileType } from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { createWriteStream, rmSync } from 'fs';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { ApiEventsService } from '../../src/modules/api-events';
import { LegacyProjectImportPieceRequested } from '../../src/modules/legacy-project-import/domain/events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../../src/modules/legacy-project-import/domain/events/legacy-project-import-requested.event';
import { LegacyProjectImportRepository } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportEntity } from '../../src/modules/legacy-project-import/infra/entities/legacy-project-import.api.entity';
import { Project } from '../../src/modules/projects/project.api.entity';
import { apiConnections } from '../../src/ormconfig';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';

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

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 20000);

afterEach(async () => {
  await fixtures?.cleanup();
});

it('starts a legacy project import', async () => {
  const projectName = 'Legacy project name';

  await fixtures.WhenInvokingStartEndpoint(projectName);

  await fixtures.ThenALegacyProjectImportIsCreated(projectName);
});

it('accepts files for a legacy project import', async () => {
  await fixtures.GivenLegacyProjectImportWasStarted();

  const fileType = LegacyProjectImportFileType.InputDat;

  await fixtures.WhenUploadingAFileForLegacyProjectImport(fileType);

  await fixtures.ThenLegacyProjectImportContainsUploadedFile(fileType);
});

it('runs a legacy project import once required files are uploaded', async () => {
  await fixtures.GivenLegacyProjectImportWasStarted();
  await fixtures.GivenAllRequiredFilesWereUploaded();

  await fixtures.WhenRunningALegacyProjectImport();

  await fixtures.ThenLegacyProjectImportRunStarted();
});

it('deletes files from a legacy project import', async () => {
  await fixtures.GivenLegacyProjectImportWasStarted();
  const [fileId] = await fixtures.GivenAllRequiredFilesWereUploaded();

  await fixtures.WhenDeletingAFileFromALegacyProjectImport(fileId);

  await fixtures.ThenLegacyProjectImportDoesNotContainsThatFile(fileId);
});

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);

  const repo = app.get(LegacyProjectImportRepository);
  const legacyProjectImportRepo = app.get<
    Repository<LegacyProjectImportEntity>
  >(getRepositoryToken(LegacyProjectImportEntity, apiConnections.default.name));
  const projectRepo = app.get<Repository<Project>>(
    getRepositoryToken(Project, apiConnections.default.name),
  );

  const eventBus = app.get(EventBus);
  const apiEventsService = app.get(ApiEventsService);

  let projectId: string;

  const files: string[] = [];

  const events: IEvent[] = [];
  eventBus.subscribe((event: IEvent) => {
    events.push(event);
  });

  return {
    cleanup: async () => {
      if (projectId) {
        await legacyProjectImportRepo.delete({ projectId });
        await projectRepo.delete({ id: projectId });
      }

      files.forEach((file) => rmSync(file, { force: true, recursive: true }));

      await app.close();
    },
    GivenLegacyProjectImportWasStarted: async () => {
      const result = await request(app.getHttpServer())
        .post(`/api/v1/projects/import/legacy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ projectName: 'Legacy project' })
        .expect(201);

      expect(result.body.projectId).toBeDefined();

      projectId = result.body.projectId;
    },
    GivenAllRequiredFilesWereUploaded: async () => {
      const requiredFiles = [
        LegacyProjectImportFileType.InputDat,
        LegacyProjectImportFileType.PlanningGridShapefile,
        LegacyProjectImportFileType.PuDat,
        LegacyProjectImportFileType.PuvsprDat,
        LegacyProjectImportFileType.SpecDat,
      ];

      return Promise.all(
        requiredFiles.map(async (fileType) => {
          const filePath = await saveFile(
            __dirname + fileType,
            Readable.from(fileType),
          );

          files.push(filePath);

          const result = await request(app.getHttpServer())
            .post(`/api/v1/projects/import/legacy/${projectId}/data-file`)
            .set('Authorization', `Bearer ${token}`)
            .field('fileType', fileType)
            .attach('file', filePath)
            .expect(201);

          expect(result.body.projectId).toBeDefined();
          expect(result.body.fileId).toBeDefined();

          return result.body.fileId as string;
        }),
      );
    },
    WhenInvokingStartEndpoint: async (name: string) => {
      const result = await request(app.getHttpServer())
        .post(`/api/v1/projects/import/legacy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ projectName: name })
        .expect(201);

      expect(result.body.projectId).toBeDefined();

      projectId = result.body.projectId;
    },
    WhenDeletingAFileFromALegacyProjectImport: async (fileId: string) => {
      const result = await request(app.getHttpServer())
        .delete(
          `/api/v1/projects/import/legacy/${projectId}/data-file/${fileId}`,
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(result.body.projectId).toBeDefined();
    },
    WhenUploadingAFileForLegacyProjectImport: async (
      fileType: LegacyProjectImportFileType,
    ) => {
      const filePath = await saveFile(
        __dirname + fileType,
        Readable.from('test file'),
      );

      files.push(filePath);

      const result = await request(app.getHttpServer())
        .post(`/api/v1/projects/import/legacy/${projectId}/data-file`)
        .set('Authorization', `Bearer ${token}`)
        .field('fileType', fileType)
        .attach('file', filePath)
        .expect(201);

      expect(result.body.projectId).toBeDefined();
      expect(result.body.fileId).toBeDefined();
    },
    WhenRunningALegacyProjectImport: async () => {
      const result = await request(app.getHttpServer())
        .post(`/api/v1/projects/import/legacy/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(result.body.projectId).toBeDefined();
    },
    ThenALegacyProjectImportIsCreated: async (projectName: string) => {
      const legacyProjectImport = await repo.find(new ResourceId(projectId));
      if (isLeft(legacyProjectImport))
        throw new Error('Legacy project import not found');

      expect(legacyProjectImport.right).toBeDefined();
      const { isAcceptingFiles } = legacyProjectImport.right.toSnapshot();

      expect(isAcceptingFiles).toBe(true);

      const project = await projectRepo.findOne(projectId);

      expect(project).toBeDefined();
      expect(project!.name).toEqual(projectName);
    },
    ThenLegacyProjectImportContainsUploadedFile: async (
      fileType: LegacyProjectImportFileType,
    ) => {
      const legacyProjectImport = await repo.find(new ResourceId(projectId));
      if (isLeft(legacyProjectImport))
        throw new Error('Legacy project import not found');

      expect(legacyProjectImport.right).toBeDefined();
      const { files } = legacyProjectImport.right.toSnapshot();

      expect(files).toHaveLength(1);
      const [file] = files;
      expect(file.type).toEqual(fileType);
    },
    ThenLegacyProjectImportRunStarted: async () => {
      const legacyProjectImport = await repo.find(new ResourceId(projectId));
      if (isLeft(legacyProjectImport))
        throw new Error('Legacy project import not found');

      expect(legacyProjectImport.right).toBeDefined();
      const {
        pieces,
        isAcceptingFiles,
      } = legacyProjectImport.right.toSnapshot();

      expect(isAcceptingFiles).toBe(false);

      const firstBatchOrder = Math.min(...pieces.map((piece) => piece.order));

      expect(
        pieces.every((piece) => {
          const event = events.find(
            (event) =>
              event instanceof LegacyProjectImportPieceRequested &&
              event.componentId.value === piece.id,
          );

          return piece.order !== firstBatchOrder || Boolean(event);
        }),
      ).toBe(true);

      const legacyProjectImportRequestedEvent = events.find(
        (event) => event instanceof LegacyProjectImportRequested,
      );

      expect(legacyProjectImportRequestedEvent).toBeDefined();
    },
    ThenLegacyProjectImportDoesNotContainsThatFile: async (fileId: string) => {
      const legacyProjectImport = await repo.find(new ResourceId(projectId));
      if (isLeft(legacyProjectImport))
        throw new Error('Legacy project import not found');

      expect(legacyProjectImport.right).toBeDefined();
      const { files } = legacyProjectImport.right.toSnapshot();

      expect(files.some((file) => file.id === fileId)).toBe(false);
    },
  };
};
