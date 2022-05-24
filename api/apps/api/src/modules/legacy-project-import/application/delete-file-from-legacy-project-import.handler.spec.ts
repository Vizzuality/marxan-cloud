import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { LegacyProjectImportFileId } from '@marxan/legacy-project-import/domain/legacy-project-import-file.id';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { isLeft } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { forbiddenError } from '../../access-control';
import {
  LegacyProjectImport,
  legacyProjectImportAlreadyStarted,
} from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportComponentSnapshot } from '../domain/legacy-project-import/legacy-project-import-component.snapshot';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
  legacyProjectImportSaveError,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../infra/legacy-project-import-memory.repository';
import { AddFileToLegacyProjectImport } from './add-file-to-legacy-project-import.command';
import { AddFileToLegacyProjectImportHandler } from './add-file-to-legacy-project-import.handler';
import { DeleteFileFromLegacyProjectImport } from './delete-file-from-legacy-project-import.command';
import { DeleteFileFromLegacyProjectImportHandler } from './delete-file-from-legacy-project-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('deletes a file from a legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const fileId = await fixtures.GivenAFileHasBeenAddedToLegacyProjectImport({
    id: projectId,
    file: Buffer.from('example file'),
    fileType: LegacyProjectImportFileType.InputDat,
  });

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId: resourceId,
      fileId,
    })
    .ThenLegacyProjectImportShouldBePersistedWithoutTheFile();
});

it('fails if legacy project import is not found', async () => {
  const projectId = await fixtures.GivenNoneLegacyProjectImportWasRequested();

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId,
      fileId: LegacyProjectImportFileId.create(),
    })
    .ThenLegacyProjectImportNotFoundErrorShouldBeReturned();
});

it('fails if a user tries to delete a file from a not owned legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const fileId = await fixtures.GivenAFileHasBeenAddedToLegacyProjectImport({
    id: projectId,
    file: Buffer.from('example file'),
    fileType: LegacyProjectImportFileType.InputDat,
  });

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId: resourceId,
      fileId,
      differentUser: true,
    })
    .ThenForbiddenErrorShouldBeReturned();
});

it('fails if legacy project import aggregate cannot be persisted', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const fileId = await fixtures.GivenAFileHasBeenAddedToLegacyProjectImport({
    id: projectId,
    file: Buffer.from('example file'),
    fileType: LegacyProjectImportFileType.InputDat,
  });

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId: resourceId,
      fileId,
      errorPersistingAggregate: true,
    })
    .ThenLegacyProjectImportSaveErrorShouldBeReturned();
});

it('fails if legacy project import has already started', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    { isAcceptingFiles: false, files: [], pieces: [] },
  );
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId: resourceId,
      fileId: LegacyProjectImportFileId.create(),
    })
    .ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned();
});

it('does not fail when deleting a not existing file', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenDeletingAFileFromLegacyProjectImport({
      projectId: resourceId,
      fileId: LegacyProjectImportFileId.create(),
    })
    .ThenLegacyProjectImportShouldBePersistedWithoutTheFile();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      {
        provide: LegacyProjectImportFilesRepository,
        useClass: LegacyProjectImportFilesMemoryRepository,
      },
      AddFileToLegacyProjectImportHandler,
      DeleteFileFromLegacyProjectImportHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const projectId = ResourceId.create();
  const scenarioId = ResourceId.create();

  const addFileHandler = sandbox.get(AddFileToLegacyProjectImportHandler);
  const sut = sandbox.get(DeleteFileFromLegacyProjectImportHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );
  const filesRepo: LegacyProjectImportFilesMemoryRepository = sandbox.get(
    LegacyProjectImportFilesRepository,
  );

  return {
    GivenLegacyProjectImportWasRequested: async (
      {
        files,
        pieces,
        isAcceptingFiles,
      }: {
        files: LegacyProjectImportFileSnapshot[];
        pieces: LegacyProjectImportComponentSnapshot[];
        isAcceptingFiles: boolean;
      } = { files: [], pieces: [], isAcceptingFiles: true },
    ) => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: v4(),
        scenarioId: scenarioId.value,
        projectId: projectId.value,
        ownerId: ownerId.value,
        files,
        pieces,
        isAcceptingFiles,
      });

      await repo.save(legacyProjectImport);

      return legacyProjectImport;
    },
    GivenAFileHasBeenAddedToLegacyProjectImport: async ({
      id,
      file,
      fileType,
    }: {
      id: string;
      file: Buffer;
      fileType: LegacyProjectImportFileType;
    }) => {
      const projectId = new ResourceId(id);
      const command = new AddFileToLegacyProjectImport(
        projectId,
        file,
        fileType,
        ownerId,
      );

      const result = await addFileHandler.execute(command);

      if (isLeft(result))
        throw new Error('Error adding file to legacy project import');

      return result.right;
    },
    GivenNoneLegacyProjectImportWasRequested: async () => {
      const result = await repo.find(projectId);
      expect(result).toMatchObject({ left: legacyProjectImportNotFound });

      return projectId;
    },
    WhenDeletingAFileFromLegacyProjectImport: ({
      projectId,
      fileId,
      errorStoringFile,
      errorPersistingAggregate,
      differentUser,
    }: {
      projectId: ResourceId;
      fileId: LegacyProjectImportFileId;
      errorStoringFile?: boolean;
      errorPersistingAggregate?: boolean;
      differentUser?: boolean;
    }) => {
      const command = new DeleteFileFromLegacyProjectImport(
        projectId,
        fileId,
        differentUser ? UserId.create() : ownerId,
      );

      filesRepo.saveFailure = Boolean(errorStoringFile);
      repo.saveFailure = Boolean(errorPersistingAggregate);

      return {
        ThenLegacyProjectImportShouldBePersistedWithoutTheFile: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ right: true });

          const persistedAggregate = await repo.find(projectId);
          if (isLeft(persistedAggregate))
            throw new Error('Legacy project import not found');

          const { files } = persistedAggregate.right.toSnapshot();
          const fileOrUndefined = files.find(
            (file) => file.id === fileId.value,
          );
          expect(fileOrUndefined).toBeUndefined();
        },
        ThenLegacyProjectImportNotFoundErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: legacyProjectImportNotFound });
        },
        ThenForbiddenErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: forbiddenError });
        },
        ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            left: legacyProjectImportAlreadyStarted,
          });
        },
        ThenLegacyProjectImportSaveErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            left: legacyProjectImportSaveError,
          });
        },
      };
    },
  };
};
