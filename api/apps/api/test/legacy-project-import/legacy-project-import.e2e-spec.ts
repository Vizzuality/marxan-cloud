import { LegacyProjectImportComponentId } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportStatuses } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import-status';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ResourceId } from '@marxan/cloning/domain';
import { LegacyProjectImportFileType } from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { createWriteStream, rmSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { MarkLegacyProjectImportPieceAsFailed } from '../../src/modules/legacy-project-import/application/mark-legacy-project-import-piece-as-failed.command';
import { LegacyProjectImportBatchFailed } from '../../src/modules/legacy-project-import/domain/events/legacy-project-import-batch-failed.event';
import { LegacyProjectImportPieceRequested } from '../../src/modules/legacy-project-import/domain/events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../../src/modules/legacy-project-import/domain/events/legacy-project-import-requested.event';
import { LegacyProjectImportRepository } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportEntity } from '../../src/modules/legacy-project-import/infra/entities/legacy-project-import.api.entity';
import { GetLegacyProjectImportErrorsResponseDto } from '../../src/modules/projects/dto/legacy-project-import.dto';
import { Project } from '../../src/modules/projects/project.api.entity';
import { apiConnections } from '../../src/ormconfig';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';

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
  const projectDescription = 'Legacy project import desc';

  await fixtures.WhenInvokingStartEndpoint(projectName, projectDescription);

  await fixtures.ThenALegacyProjectImportIsCreated(
    projectName,
    projectDescription,
  );
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

it('runs a legacy project import once required files are uploaded and locks solutions', async () => {
  const opts = { solutionsAreLocked: true };
  await fixtures.GivenLegacyProjectImportWasStarted();
  await fixtures.GivenAllRequiredFilesWereUploaded();

  await fixtures.WhenRunningALegacyProjectImport(opts);

  await fixtures.ThenLegacyProjectImportRunStarted(opts);
});

it('deletes files from a legacy project import', async () => {
  await fixtures.GivenLegacyProjectImportWasStarted();
  const [fileId] = await fixtures.GivenAllRequiredFilesWereUploaded();

  await fixtures.WhenDeletingAFileFromALegacyProjectImport(fileId);

  await fixtures.ThenLegacyProjectImportDoesNotContainsThatFile(fileId);
});

it('returns errors and warnings of a legacy project import', async () => {
  await fixtures.GivenLegacyProjectImportWasStarted();
  await fixtures.GivenAllRequiredFilesWereUploaded();

  const errors = ['shapefile was not found in files repo'];

  await fixtures.GivenFirstBatchFailed(errors);

  const result = await fixtures.WhenGettingErrorsAndWarningsOfALegacyProjectImport();

  await fixtures.ThenLegacyProjectImportErrorsAreReported(result, errors);
});

const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const token = await GivenUserIsLoggedIn(app);

  const repo = app.get(LegacyProjectImportRepository);
  const legacyProjectImportRepo = app.get<
    Repository<LegacyProjectImportEntity>
  >(getRepositoryToken(LegacyProjectImportEntity, apiConnections.default.name));
  const projectRepo = app.get<Repository<Project>>(
    getRepositoryToken(Project, apiConnections.default.name),
  );
  const scenarioRepo = app.get<Repository<Scenario>>(
    getRepositoryToken(Scenario, apiConnections.default.name),
  );

  const eventBus = app.get(EventBus);
  const commandBus = app.get(CommandBus);

  let projectId: string;

  const files: string[] = [];

  const events: IEvent[] = [];
  eventBus.subscribe((event: IEvent) => {
    events.push(event);
  });

  const startLegacyProjectImport = (
    name = 'Legacy project',
    description = 'random desc',
  ) =>
    request(app.getHttpServer())
      .post(`/api/v1/projects/import/legacy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ projectName: name, description })
      .expect(201);

  const runLegacyProjectImport = (
    projectId: string,
    opts: { solutionsAreLocked: boolean } = { solutionsAreLocked: false },
  ) => {
    const send = opts.solutionsAreLocked ? { solutionsAreLocked: true } : {};
    return request(app.getHttpServer())
      .post(`/api/v1/projects/import/legacy/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(send)
      .expect(201);
  };

  const getLegacyProjectImport = async (projectId: string) => {
    const result = await repo.find(new ResourceId(projectId));

    if (isLeft(result)) throw new Error('Legacy project import not found');

    return result.right;
  };

  const getFirstBatchPieces = async (projectId: string) => {
    const legacyProjectImport = await getLegacyProjectImport(projectId);
    const legacyProjectImportSnapshot = legacyProjectImport.toSnapshot();
    const firstBatchOrder = 0;
    return legacyProjectImportSnapshot.pieces.filter(
      (piece) => piece.order === firstBatchOrder,
    );
  };

  return {
    cleanup: async () => {
      if (projectId) {
        await legacyProjectImportRepo.delete({ projectId });
        await projectRepo.delete({ id: projectId });
      }

      files.forEach((file) => rmSync(file, { force: true, recursive: true }));

      eventBusTestUtils.stopInspectingEvents();
      await app.close();
    },
    GivenLegacyProjectImportWasStarted: async () => {
      const result = await startLegacyProjectImport();

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
    GivenFirstBatchFailed: async (errors: string[] = []) => {
      await runLegacyProjectImport(projectId);

      const event = await eventBusTestUtils.waitUntilEventIsPublished(
        LegacyProjectImportPieceRequested,
      );
      const firstBatchPieces = await getFirstBatchPieces(projectId);

      await Promise.all(
        firstBatchPieces.map((piece) =>
          commandBus.execute(
            new MarkLegacyProjectImportPieceAsFailed(
              event.projectId,
              new LegacyProjectImportComponentId(piece.id),
              errors,
            ),
          ),
        ),
      );

      await eventBusTestUtils.waitUntilEventIsPublished(
        LegacyProjectImportBatchFailed,
      );
    },
    WhenInvokingStartEndpoint: async (name: string, description: string) => {
      const result = await startLegacyProjectImport(name, description);

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
        join(__dirname, fileType),
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
    WhenRunningALegacyProjectImport: async (
      opts: { solutionsAreLocked: boolean } = { solutionsAreLocked: false },
    ) => {
      const result = await runLegacyProjectImport(projectId, opts);
      expect(result.body.projectId).toBeDefined();
    },
    WhenGettingErrorsAndWarningsOfALegacyProjectImport: async (): Promise<GetLegacyProjectImportErrorsResponseDto> => {
      const result = await request(app.getHttpServer())
        .get(`/api/v1/projects/import/legacy/${projectId}/validation-results`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      return result.body;
    },
    ThenALegacyProjectImportIsCreated: async (
      projectName: string,
      projectDescription: string,
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { status, scenarioId } = legacyProjectImport.toSnapshot();

      expect(status).toBe(LegacyProjectImportStatuses.AcceptingFiles);

      const project = await projectRepo.findOne(projectId);
      expect(project).toBeDefined();
      expect(project!.name).toEqual(projectName);
      expect(project!.description).toEqual(projectDescription);

      const scenario = await scenarioRepo.findOne(scenarioId);
      expect(scenario).toBeDefined();
      expect(scenario!.solutionsAreLocked).toEqual(false);
    },
    ThenLegacyProjectImportContainsUploadedFile: async (
      fileType: LegacyProjectImportFileType,
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { files } = legacyProjectImport.toSnapshot();

      expect(files).toHaveLength(1);
      const [file] = files;
      expect(file.type).toEqual(fileType);
    },
    ThenLegacyProjectImportRunStarted: async (
      opts: { solutionsAreLocked: boolean } = { solutionsAreLocked: false },
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { pieces, status, scenarioId } = legacyProjectImport.toSnapshot();

      const scenario = await scenarioRepo.findOne(scenarioId);
      expect(scenario).toBeDefined();
      expect(scenario!.solutionsAreLocked).toEqual(opts.solutionsAreLocked);

      expect(status).toBe(LegacyProjectImportStatuses.Running);

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
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      expect(legacyProjectImport).toBeDefined();
      const { files } = legacyProjectImport.toSnapshot();

      expect(files.some((file) => file.id === fileId)).toBe(false);
    },
    ThenLegacyProjectImportErrorsAreReported: async (
      queryResult: GetLegacyProjectImportErrorsResponseDto,
      expectedErrors: string[],
    ) => {
      const [report1, report2] = queryResult.errorsAndWarnings;
      const failedPices = await getFirstBatchPieces(projectId);

      expect(queryResult.errorsAndWarnings).toHaveLength(failedPices.length);
      expect(report1.errors.sort()).toEqual(expectedErrors.sort());
      expect(report2.errors.sort()).toEqual(expectedErrors.sort());
    },
  };
};
