import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { forbiddenError } from '../../access-control';
import {
  LegacyProjectImport,
  legacyProjectImportAlreadyFinished,
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
import { CancelLegacyProjectImport } from './cancel-legacy-project-import.command';
import { CancelLegacyProjectImportHandler } from './cancel-legacy-project-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('cancels a running legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
    })
    .ThenLegacyProjectImportShouldBeUpdated();
});

it('cancels a not started legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    {
      status: LegacyProjectImportStatuses.AceptingFiles,
      files: [],
      pieces: [],
    },
  );
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
    })
    .ThenLegacyProjectImportShouldBeUpdated({ notStarted: true });
});

it('does not fail when canceling a legacy project import already canceled', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    { status: LegacyProjectImportStatuses.Canceled, files: [], pieces: [] },
  );
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
    })
    .ThenLegacyProjectImportShouldBeUpdated();
});

it('fails if legacy project import is not found', async () => {
  const projectId = await fixtures.GivenNoneLegacyProjectImportWasRequested();

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId,
    })
    .ThenLegacyProjectImportNotFoundErrorShouldBeReturned();
});

it('fails if a user tries to cancel a not owned legacy project import', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
      differentUser: true,
    })
    .ThenForbiddenErrorShouldBeReturned();
});

it('fails if legacy project import aggregate cannot be persisted', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
      errorPersistingAggregate: true,
    })
    .ThenLegacyProjectImportSaveErrorShouldBeReturned();
});

it('fails if legacy project import has already completed', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    { status: LegacyProjectImportStatuses.Completed, files: [], pieces: [] },
  );
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
    })
    .ThenLegacyProjectImportAlreadyFinishedErrorShouldBeReturned();
});

it('fails if legacy project import has already failed', async () => {
  const legacyProjectImport = await fixtures.GivenLegacyProjectImportWasRequested(
    { status: LegacyProjectImportStatuses.Failed, files: [], pieces: [] },
  );
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures
    .WhenCancelingingAFileFromLegacyProjectImport({
      projectId: resourceId,
    })
    .ThenLegacyProjectImportAlreadyFinishedErrorShouldBeReturned();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      CancelLegacyProjectImportHandler,
      {
        provide: getRepositoryToken(Project),
        useValue: { delete: async () => {} },
      },
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const projectId = ResourceId.create();
  const scenarioId = ResourceId.create();

  const sut = sandbox.get(CancelLegacyProjectImportHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );

  return {
    GivenLegacyProjectImportWasRequested: async (
      {
        files,
        pieces,
        status,
      }: {
        files: LegacyProjectImportFileSnapshot[];
        pieces: LegacyProjectImportComponentSnapshot[];
        status: LegacyProjectImportStatuses;
      } = {
        files: [],
        pieces: [],
        status: LegacyProjectImportStatuses.Running,
      },
    ) => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: v4(),
        scenarioId: scenarioId.value,
        projectId: projectId.value,
        ownerId: ownerId.value,
        files,
        pieces,
        status,
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
    WhenCancelingingAFileFromLegacyProjectImport: ({
      projectId,
      errorPersistingAggregate,
      differentUser,
    }: {
      projectId: ResourceId;
      errorPersistingAggregate?: boolean;
      differentUser?: boolean;
    }) => {
      const command = new CancelLegacyProjectImport(
        projectId,
        differentUser ? UserId.create() : ownerId,
      );

      repo.saveFailure = Boolean(errorPersistingAggregate);

      return {
        ThenLegacyProjectImportShouldBeUpdated: async (
          { notStarted }: { notStarted: boolean } = { notStarted: false },
        ) => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ right: true });

          const persistedAggregate = await repo.find(projectId);
          if (isLeft(persistedAggregate))
            throw new Error('Legacy project import not found');

          const { toBeRemoved, status } = persistedAggregate.right.toSnapshot();

          expect(toBeRemoved).toEqual(true);
          if (notStarted)
            expect(status).toEqual(LegacyProjectImportStatuses.Canceled);
        },
        ThenLegacyProjectImportNotFoundErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: legacyProjectImportNotFound });
        },
        ThenForbiddenErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({ left: forbiddenError });
        },
        ThenLegacyProjectImportAlreadyFinishedErrorShouldBeReturned: async () => {
          const result = await sut.execute(command);

          expect(result).toMatchObject({
            left: legacyProjectImportAlreadyFinished,
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
