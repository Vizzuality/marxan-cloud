import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Either, isLeft, isRight, left, Right, right } from 'fp-ts/Either';
import { PromiseType } from 'utility-types';
import { MemoryImportRepository } from '../adapters/memory-import.repository.adapter';
import {
  Import,
  ImportId,
  ImportRequested,
  PieceImportRequested,
} from '../domain';
import {
  ArchiveReader,
  Failure as ArchiveFailure,
  invalidFiles,
  Success as ArchiveSuccess,
} from './archive-reader.port';
import { ImportArchive } from './import-archive.command';
import { ImportArchiveHandler } from './import-archive.handler';
import { ImportRepository } from './import.repository.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`importing invalid archive`, async () => {
  fixtures.GivenExtractingArchiveFails();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenImportFails(result);
});

test(`importing archive with sequential components`, async () => {
  fixtures.GivenExtractingArchiveHasSequentialComponents();
  const result = await fixtures.WhenRequestingImport();

  fixtures.ThenRequestImportIsSaved(result);
  fixtures.ThenImportRequestedIsEmitted();
  fixtures.ThenLowestOrderComponentIsRequested();
});

test(`importing archive with equal order components`, async () => {
  fixtures.GivenExtractingArchiveHasEqualComponents();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenRequestImportIsSaved(result);
  fixtures.ThenImportRequestedIsEmitted();
  fixtures.ThenAllComponentsAreRequested();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ArchiveReader,
        useClass: FakeArchiveReader,
      },
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
      ImportArchiveHandler,
    ],
  }).compile();
  await sandbox.init();

  const resourceId = ResourceId.create();
  const projectId = ResourceId.create();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportArchiveHandler);
  const repo: MemoryImportRepository = sandbox.get(ImportRepository);
  const archiveReader: FakeArchiveReader = sandbox.get(ArchiveReader);

  return {
    GivenExtractingArchiveFails: () => {
      archiveReader.mock.mockImplementation(async () => left(invalidFiles));
    },
    GivenExtractingArchiveHasSequentialComponents: () => {
      archiveReader.mock.mockImplementation(async () =>
        right(
          Import.fromSnapshot({
            id: ImportId.create().value,
            archiveLocation: 'whatever',
            resourceId: resourceId.value,
            resourceKind: ResourceKind.Project,
            importPieces: [
              {
                finished: false,
                order: 0,
                resourceId: projectId.value,
                id: `import component unique id`,
                piece: ClonePiece.ProjectMetadata,
                uris: [
                  {
                    uri: `/tmp/project-metadata-random-uuid.json`,
                    relativePath: `project-metadata.json`,
                  },
                ],
              },
              {
                finished: false,
                order: 1,
                resourceId: projectId.value,
                id: `some other piece`,
                piece: ClonePiece.PlanningAreaGAdm,
                uris: [
                  {
                    uri: `/tmp/project-planning-area-random-uuid.json`,
                    relativePath: `planning-area/config.json`,
                  },
                ],
              },
            ],
          }),
        ),
      );
    },
    GivenExtractingArchiveHasEqualComponents: () => {
      archiveReader.mock.mockImplementation(async () =>
        right(
          Import.fromSnapshot({
            id: ImportId.create().value,
            archiveLocation: 'whatever',
            resourceId: resourceId.value,
            resourceKind: ResourceKind.Project,
            importPieces: [
              {
                finished: false,
                order: 2,
                resourceId: projectId.value,
                id: `import component unique id`,
                piece: ClonePiece.ProjectMetadata,
                uris: [
                  {
                    uri: `/tmp/project-metadata-random-uuid.json`,
                    relativePath: `project-metadata.json`,
                  },
                ],
              },
              {
                finished: false,
                order: 2,
                resourceId: projectId.value,
                id: `some other piece`,
                piece: ClonePiece.PlanningAreaGAdm,
                uris: [
                  {
                    uri: `/tmp/project-planning-area-random-uuid.json`,
                    relativePath: `planning-area/config.json`,
                  },
                ],
              },
            ],
          }),
        ),
      );
    },
    WhenRequestingImport: async () =>
      sut.execute(new ImportArchive(new ArchiveLocation(`whatever`))),
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportArchiveHandler['execute']>>,
    ) => {
      expect(isRight(importResult)).toBeTruthy();
      expect(
        repo.entities[(importResult as Right<string>).right],
      ).toBeDefined();
    },
    ThenImportFails: (
      importResult: PromiseType<ReturnType<ImportArchiveHandler['execute']>>,
    ) => {
      expect(isLeft(importResult)).toBeTruthy();
    },
    ThenImportRequestedIsEmitted: () => {
      expect(
        events.filter((event) => event instanceof ImportRequested),
      ).toEqual([
        {
          importId: expect.any(ImportId),
          resourceId,
          resourceKind: `project`,
        },
      ]);
    },
    ThenLowestOrderComponentIsRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          importId: expect.any(ImportId),
          componentId: new ComponentId(`import component unique id`),
        },
      ]);
    },
    ThenAllComponentsAreRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          importId: expect.any(ImportId),
          componentId: new ComponentId(`import component unique id`),
        },
        {
          importId: expect.any(ImportId),
          componentId: new ComponentId(`some other piece`),
        },
      ]);
    },
  };
};

class FakeArchiveReader extends ArchiveReader {
  mock: jest.MockedFunction<ArchiveReader['get']> = jest.fn();

  async get(
    archive: ArchiveLocation,
  ): Promise<Either<ArchiveFailure, ArchiveSuccess>> {
    return this.mock(archive);
  }
}
