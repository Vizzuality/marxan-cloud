import { ArchiveLocation, ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { isLeft, isRight } from 'fp-ts/Either';
import { v4 } from 'uuid';
import {
  LegacyProjectImport,
  legacyProjectImportMissingRequiredFile,
} from '../domain/legacy-project-import/legacy-project-import';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
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
  await fixtures.GivenFilesAreUploaded();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  await fixtures.ThenStartingLegacyProjectImportIsUpdated(result);
});

it(`fails to run when missing uploaded files`, async () => {
  fixtures.GivenAnExistingLegacyProjectImport();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenNoEventsAreEmitted();
  fixtures.ThenMissingUploadedError(result);
});

it(`fails to run when there is not an existing legacy project import  `, async () => {
  fixtures.GivenNoExistingLegacyProjectImport();
  const result = await fixtures.WhenRunningALegacyProjectImport();
  fixtures.ThenNoEventsAreEmitted();
  fixtures.ThenMissingLegacyProjectImportError(result);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      RunLegacyProjectImportHandler,
    ],
  }).compile();

  await sandbox.init();

  const ownerId = UserId.create();
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
  ].map(
    (type) =>
      new LegacyProjectImportFile(
        type,
        new ArchiveLocation(`${type}.location`),
      ),
  );

  return {
    GivenNoExistingLegacyProjectImport: () => {},
    GivenAnExistingLegacyProjectImport: () =>
      repo.save(existingLegacyProjectImport),
    GivenFilesAreUploaded: () => {
      allRequiredFiles.forEach((importFile) =>
        existingLegacyProjectImport.addFile(importFile),
      );
      return repo.save(existingLegacyProjectImport);
    },
    GivenUpdatingALegacyProjectImportFails: () => {
      repo.saveFailure = true;
    },
    WhenRunningALegacyProjectImport: () => {
      return sut.execute(new RunLegacyProjectImport(projectId));
    },
    ThenNoEventsAreEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenMissingLegacyProjectImportError: async (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportNotFound);
    },
    ThenMissingUploadedError: async (
      result: RunLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(legacyProjectImportMissingRequiredFile);

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
      expect(legacyProjectImportSnapshot.isAcceptingFiles).toEqual(false);
      expect(legacyProjectImportSnapshot.ownerId).toEqual(ownerId.value);
      expect(legacyProjectImportSnapshot.files).toEqual(
        allRequiredFiles.map((file) => file.toSnapshot()),
      );
      expect(legacyProjectImportSnapshot.pieces).not.toHaveLength(0);
      expect(legacyProjectImportSnapshot.projectId).toEqual(projectId);
      expect(legacyProjectImportSnapshot.scenarioId).toEqual(scenarioId);
    },
  };
};
