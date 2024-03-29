import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { LegacyProjectImportFileId } from '@marxan/legacy-project-import/domain/legacy-project-import-file.id';
import { unknownError } from '@marxan/utils/file-operations';
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
import { LegacyProjectImportStatuses } from '../domain/legacy-project-import/legacy-project-import-status';
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
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportShouldBePersistedWithTheNewFile();
});

it('overrides a file of legacy project import', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  const fileType = LegacyProjectImportFileType.InputDat;

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType,
    })
    .ThenLegacyProjectImportShouldBePersistedWithTheNewFile();

  await fixtures.ThenItIsPossibleToOverridePreviouslyAddedFiles({
    id: projectId,
    file: Buffer.from('new file'),
    fileType,
  });
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

it('fails if a user tries to add a file to a not owned legacy project import', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
      differentUser: true,
    })
    .ThenForbiddenErrorShouldBeReturned();
});

it('fails if given file cannot be stored', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
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
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested({
      files: [],
      isAcceptingFiles: false,
      pieces: [],
    });
  const { projectId } = legacyProjectImport.toSnapshot();

  await fixtures
    .WhenAddingAFileToLegacyProjectImport({
      id: projectId,
      file: Buffer.from('example file'),
      fileType: LegacyProjectImportFileType.InputDat,
    })
    .ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned();
});

it('fails if legacy project import aggregate cannot be persisted', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
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
        status: isAcceptingFiles
          ? LegacyProjectImportStatuses.AcceptingFiles
          : LegacyProjectImportStatuses.Running,
        toBeRemoved: false,
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
      differentUser,
    }: {
      id: string;
      file: Buffer;
      fileType: LegacyProjectImportFileType;
      errorStoringFile?: boolean;
      errorPersistingAggregate?: boolean;
      differentUser?: boolean;
    }) => {
      const projectId = new ResourceId(id);
      const command = new AddFileToLegacyProjectImport(
        projectId,
        file,
        fileType,
        differentUser ? UserId.create() : ownerId,
      );

      filesRepo.saveFailure = Boolean(errorStoringFile);
      repo.saveFailure = Boolean(errorPersistingAggregate);

      return {
        ThenLegacyProjectImportShouldBePersistedWithTheNewFile: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            right: expect.any(LegacyProjectImportFileId),
          });

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
        ThenForbiddenErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: forbiddenError });
        },
        ThenErrorStoringFileShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: unknownError });
        },
        ThenLegacyProjectImportHasAlreadyStartedErrorShouldBeReturned:
          async () => {
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
    ThenItIsPossibleToOverridePreviouslyAddedFiles: async ({
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

      await expect(sut.execute(command)).resolves.not.toThrow();
    },
  };
};
