import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { unknownError } from '@marxan/utils/file-operations';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { isLeft } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import {
  LegacyProjectImport,
  legacyProjectImportAlreadyStarted,
  legacyProjectImportDuplicateFileType,
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

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('adds a file to legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportShouldBePersistedWithTheNewFile();
});

it('fails if legacy project import is not found', async () => {
  const projectId = await fixtures.GivenNoneLegacyProjectImportWasRequested();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId.value,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportNotFoundErrorShouldBeReturned();
});

it('fails if given file cannot be stored', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
      errorStoringFile: true,
    })
    .ThenErrorStoringFileShouldBeReturned();
});

it('fails if legacy project import has already started', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    { files: [], isAcceptingFiles: false, pieces: [] },
  );
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned();
});

it('fails if legacy project import already has a file of the same type of the provided file', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    {
      files: [
        { location: 'foo/bar.dat', type: LegacyProjectImportFileType.InputDat },
      ],
      isAcceptingFiles: true,
      pieces: [],
    },
  );
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportDuplicateFileTypeErrorShouldBeReturned();
});

it('fails if legacy project import aggregate cannot be persisted', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
      errorPersistingAggregate: true,
    })
    .ThenLegacyProjectImportSaveErrorShouldBeReturned();
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
      {
        provide: Logger,
        useClass: FakeLogger,
      },
      AddFileToLegacyProjectImportHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const projectId = ResourceId.create();
  const scenarioId = ResourceId.create();

  const sut = sandbox.get(AddFileToLegacyProjectImportHandler);
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
    GivenNoneLegacyProjectImportWasRequested: async () => {
      const result = await repo.find(projectId);
      expect(result).toMatchObject({ left: legacyProjectImportNotFound });

      return projectId;
    },
    WhenAddingAFileToLegacyProjectImport: ({
      id,
      file,
      fileType,
      errorStoringFile,
      errorPersistingAggregate,
    }: {
      id: string;
      file: Buffer;
      fileType: LegacyProjectImportFileType;
      errorStoringFile?: boolean;
      errorPersistingAggregate?: boolean;
    }) => {
      const projectId = new ResourceId(id);
      const command = new AddFileToLegacyProjectImport(
        projectId,
        file,
        fileType,
      );

      filesRepo.saveFailure = Boolean(errorStoringFile);
      repo.saveFailure = Boolean(errorPersistingAggregate);

      return {
        ThenLegacyProjectImportShouldBePersistedWithTheNewFile: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ right: true });

          const persistedAggregate = await repo.find(projectId);
          if (isLeft(persistedAggregate))
            throw new Error('Legacy project import not found');

          const { files } = persistedAggregate.right.toSnapshot();

          expect(files).toHaveLength(1);

          const [file] = files;

          const expectedPath = filesRepo.getPathFor(id, fileType);
          expect(file.location).toBe(expectedPath);
          expect(file.type).toBe(fileType);
        },
        ThenLegacyProjectImportNotFoundErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: legacyProjectImportNotFound });
        },
        ThenErrorStoringFileShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: unknownError });
        },
        ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            left: legacyProjectImportAlreadyStarted,
          });
        },
        ThenLegacyProjectImportDuplicateFileTypeErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            left: legacyProjectImportDuplicateFileType,
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
