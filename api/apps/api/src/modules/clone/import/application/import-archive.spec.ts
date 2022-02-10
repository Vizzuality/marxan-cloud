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
import { ImportArchive } from './import-archive';
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
      ImportArchive,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportArchive);
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
            resourceId: `resource-id`,
            resourceKind: ResourceKind.Project,
            importPieces: [
              {
                finished: false,
                order: 0,
                resourceId: `project-id`,
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
                resourceId: `project-id`,
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
            resourceId: `resource-id`,
            resourceKind: ResourceKind.Project,
            importPieces: [
              {
                finished: false,
                order: 2,
                resourceId: `project-id`,
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
                resourceId: `project-id`,
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
      sut.import(new ArchiveLocation(`whatever`)),
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportArchive['import']>>,
    ) => {
      expect(isRight(importResult)).toBeTruthy();
      expect(
        repo.entities[(importResult as Right<string>).right],
      ).toBeDefined();
    },
    ThenImportFails: (
      importResult: PromiseType<ReturnType<ImportArchive['import']>>,
    ) => {
      expect(isLeft(importResult)).toBeTruthy();
    },
    ThenImportRequestedIsEmitted: () => {
      expect(
        events.filter((event) => event instanceof ImportRequested),
      ).toEqual([
        {
          id: expect.any(ImportId),
          resourceId: new ResourceId(`resource-id`),
          resourceKind: `project`,
        },
      ]);
    },
    ThenLowestOrderComponentIsRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          id: new ComponentId(`import component unique id`),
          resourceId: new ResourceId(`project-id`),
          piece: `project-metadata`,
          uris: [
            {
              relativePath: `project-metadata.json`,
              uri: `/tmp/project-metadata-random-uuid.json`,
            },
          ],
        },
      ]);
    },
    ThenAllComponentsAreRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          id: new ComponentId(`import component unique id`),
          resourceId: new ResourceId(`project-id`),
          piece: `project-metadata`,
          uris: [
            {
              relativePath: `project-metadata.json`,
              uri: `/tmp/project-metadata-random-uuid.json`,
            },
          ],
        },
        {
          id: new ComponentId(`some other piece`),
          resourceId: new ResourceId(`project-id`),
          piece: `planning-area-gadm`,
          uris: [
            {
              relativePath: `planning-area/config.json`,
              uri: `/tmp/project-planning-area-random-uuid.json`,
            },
          ],
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
