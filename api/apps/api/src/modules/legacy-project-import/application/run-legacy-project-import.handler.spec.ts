import { forbiddenError } from '@marxan-api/modules/access-control';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ArchiveLocation, ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight } from 'fp-ts/Either';
import { v4 } from 'uuid';
import { LegacyProjectImportPieceRequested } from '../domain/events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../domain/events/legacy-project-import-requested.event';
import {
  LegacyProjectImport,
  legacyProjectImportAlreadyStarted,
  legacyProjectImportMissingRequiredFile,
} from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportStatuses } from '../domain/legacy-project-import/legacy-project-import-status';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
  legacyProjectImportSaveError,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../infra/legacy-project-import-memory.repository';
import {
  RunLegacyProjectImport,
  RunLegacyProjectImportResponse,
} from './run-legacy-project-import.command';
import { RunLegacyProjectImportHandler } from './run-legacy-project-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`runs a legacy project import`, async () => {
  await fixtures.GivenAnExistingLegacyProjectImport();
  await fixtures.GivenAllFilesAreUploaded();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  await fixtures.ThenStartingLegacyProjectImportIsUpdated(result);
  fixtures.ThenLegacyProjectImportRequestedEventIsEmitted();
  fixtures.ThenLegacyProjectImportPieceRequestedAreRequested();
});

it(`fails to run when a non owner role runs a legacy project import`, async () => {
  fixtures.GivenAnExistingLegacyProjectImport();
  fixtures.GivenAllFilesAreUploaded();
  const result = await fixtures.WhenRunningALegacyProjectImport({
    unauthorizedUser: true,
  });
  fixtures.ThenNoEventsAreEmitted();
  await fixtures.ThenLegacyProjectImportIsNotUpdated();
  fixtures.ThenForbiddenErrorIsReturned(result);
});

it(`fails to run for a second time`, async () => {
  await fixtures.GivenAnExistingLegacyProjectImport();
  await fixtures.GivenAllFilesAreUploaded();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  await fixtures.ThenStartingLegacyProjectImportIsUpdated(result);

  const secondTimeRunningResult = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenLegacyProjectImportIsAlreadyStartedErrorIsRetured(
    secondTimeRunningResult,
  );
});

it(`fails to run when missing uploaded files`, async () => {
  fixtures.GivenAnExistingLegacyProjectImport();
  fixtures.GivenNotAllFilesAreUploaded();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenNoEventsAreEmitted();
  await fixtures.ThenLegacyProjectImportIsNotUpdated();
  fixtures.ThenMissingUploadedErrorIsReturned(result);
});

it(`fails to run when there is not an existing legacy project import`, async () => {
  fixtures.GivenNoExistingLegacyProjectImport();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenNoEventsAreEmitted();
  fixtures.ThenMissingLegacyProjectImportErrorIsReturned(result);
});

it(`fails to run when updating legacy project import fails`, async () => {
  await fixtures.GivenAnExistingLegacyProjectImport();
  await fixtures.GivenAllFilesAreUploaded();
  fixtures.GivenUpdatingALegacyProjectImportFails();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenNoEventsAreEmitted();
  fixtures.ThenUpdateErrorIsReturned(result);
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
        provide: getRepositoryToken(UsersProjectsApiEntity),
        useValue: { save: () => {} },
      },
      RunLegacyProjectImportHandler,
    ],
  }).compile();

  await sandbox.init();

  const ownerId = UserId.create();
  const unauthorizedUserId = UserId.create();
  const projectId = v4();
  const scenarioId = v4();
  const existingLegacyProjectImport = LegacyProjectImport.newOne(
    new ResourceId(projectId),
    new ResourceId(scenarioId),
    ownerId,
  );

  const sut = sandbox.get(RunLegacyProjectImportHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );
  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));
  const allRequiredFiles = [
    LegacyProjectImportFileType.PlanningGridShapefile,
    LegacyProjectImportFileType.InputDat,
    LegacyProjectImportFileType.PuDat,
    LegacyProjectImportFileType.PuvsprDat,
    LegacyProjectImportFileType.SpecDat,
  ].map((type) =>
    LegacyProjectImportFile.newOne(
      type,
      new ArchiveLocation(`${type}.location`),
    ),
  );

  return {
    GivenNoExistingLegacyProjectImport: () => {},
    GivenAnExistingLegacyProjectImport: () =>
      repo.save(existingLegacyProjectImport),
    GivenNotAllFilesAreUploaded: () => {},
    GivenAllFilesAreUploaded: () => {
      allRequiredFiles.forEach((importFile) =>
        existingLegacyProjectImport.addFile(importFile),
      );
      return repo.save(existingLegacyProjectImport);
    },
    GivenUpdatingALegacyProjectImportFails: () => {
      repo.saveFailure = true;
    },
    WhenRunningALegacyProjectImport: (
      { unauthorizedUser } = { unauthorizedUser: false },
    ) => {
      return sut.execute(
        new RunLegacyProjectImport(
          new ResourceId(projectId),
          unauthorizedUser ? unauthorizedUserId : ownerId,
        ),
      );
    },
    ThenNoEventsAreEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenLegacyProjectImportRequestedEventIsEmitted: () => {
      expect(events[0] as LegacyProjectImportRequested).toEqual(
        new LegacyProjectImportRequested(new ResourceId(projectId)),
      );
    },
    ThenLegacyProjectImportPieceRequestedAreRequested: () => {
      expect(
        events.slice(1).every((event) => {
          return (
            event instanceof LegacyProjectImportPieceRequested &&
            event.projectId === new ResourceId(projectId)
          );
        }),
      );
    },
    ThenLegacyProjectImportIsAlreadyStartedErrorIsRetured: (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportAlreadyStarted);
    },
    ThenForbiddenErrorIsReturned: (result: RunLegacyProjectImportResponse) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(forbiddenError);
    },
    ThenMissingLegacyProjectImportErrorIsReturned: (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportNotFound);
    },
    ThenMissingUploadedErrorIsReturned: (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportMissingRequiredFile);
    },
    ThenUpdateErrorIsReturned: (result: RunLegacyProjectImportResponse) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportSaveError);
    },
    ThenLegacyProjectImportIsNotUpdated: async () => {
      const savedLegacyProjectImport = await repo.find(
        new ResourceId(projectId),
      );
      if (isLeft(savedLegacyProjectImport))
        throw new Error('should exist a starting project import');
      expect(savedLegacyProjectImport.right).toEqual(
        existingLegacyProjectImport,
      );
    },
    ThenStartingLegacyProjectImportIsUpdated: async (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isLeft(result))
        throw new Error('should have created a starting project import');
      expect(result.right).toEqual(true);

      const savedLegacyProjectImportOrError = await repo.find(
        new ResourceId(projectId),
      );
      if (isLeft(savedLegacyProjectImportOrError))
        throw new Error('should exist a starting project import');

      const legacyProjectImport = savedLegacyProjectImportOrError.right;
      expect(legacyProjectImport.areRequiredFilesUploaded()).toEqual(true);

      const legacyProjectImportSnapshot = legacyProjectImport.toSnapshot();
      expect(legacyProjectImportSnapshot.status).toEqual(
        LegacyProjectImportStatuses.Running,
      );
      expect(legacyProjectImportSnapshot.ownerId).toEqual(ownerId.value);
      expect(legacyProjectImportSnapshot.files).toEqual(
        allRequiredFiles.map((file) => file.toSnapshot()),
      );
      expect(legacyProjectImportSnapshot.pieces).not.toHaveLength(0);
      expect(legacyProjectImportSnapshot.projectId).toEqual(projectId);
      expect(legacyProjectImportSnapshot.scenarioId).toEqual(scenarioId);
      expect(legacyProjectImportSnapshot.toBeRemoved).toEqual(false);
    },
  };
};
