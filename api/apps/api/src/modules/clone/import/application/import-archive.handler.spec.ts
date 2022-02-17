import { JSONValue } from '@marxan-api/utils/json.type';
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
  ImportComponent,
  ImportId,
  ImportRequested,
  PieceImportRequested,
} from '../domain';
import {
  ArchiveReader,
  Failure as ArchiveFailure,
  invalidFiles,
} from './archive-reader.port';
import { ImportArchive } from './import-archive.command';
import { ImportArchiveHandler } from './import-archive.handler';
import { ImportResourcePieces } from './import-resource-pieces.port';
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
      { provide: ImportResourcePieces, useClass: FakeImportResourcePieces },
      ImportArchiveHandler,
    ],
  }).compile();
  await sandbox.init();

  let resourceId: ResourceId;

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportArchiveHandler);
  const repo: MemoryImportRepository = sandbox.get(ImportRepository);
  const archiveReader: FakeArchiveReader = sandbox.get(ArchiveReader);
  const importResourcePieces: FakeImportResourcePieces = sandbox.get(
    ImportResourcePieces,
  );

  return {
    GivenExtractingArchiveFails: () => {
      archiveReader.mock.mockImplementation(async () => left(invalidFiles));
    },
    GivenExtractingArchiveHasSequentialComponents: () => {
      importResourcePieces.mockSequentialPieces();
    },
    GivenExtractingArchiveHasEqualComponents: () => {
      importResourcePieces.mockEqualPieces();
    },
    WhenRequestingImport: async () => {
      const importResult = await sut.execute(
        new ImportArchive(new ArchiveLocation(`whatever`)),
      );
      if (isRight(importResult))
        resourceId = new ResourceId(
          repo.entities[(importResult as Right<string>).right].resourceId,
        );
      return importResult;
    },
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
          resourceId,
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
          importId: expect.any(ImportId),
          componentId: new ComponentId(`import component unique id`),
          resourceId,
          piece: `project-metadata`,
          uris: [
            {
              relativePath: `project-metadata.json`,
              uri: `/tmp/project-metadata-random-uuid.json`,
            },
          ],
        },
        {
          importId: expect.any(ImportId),
          componentId: new ComponentId(`some other piece`),
          resourceId,
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
  mock: jest.MockedFunction<ArchiveReader['get']> = jest
    .fn()
    .mockResolvedValue(right({ resourceKind: ResourceKind.Project }));

  async get(
    archive: ArchiveLocation,
  ): Promise<Either<ArchiveFailure, JSONValue>> {
    return this.mock(archive);
  }
}

class FakeImportResourcePieces extends ImportResourcePieces {
  mock: jest.MockedFunction<ImportResourcePieces['resolveFor']> = jest.fn();

  resolveFor(
    id: ResourceId,
    kind: ResourceKind,
    archiveLocation: ArchiveLocation,
  ): Promise<ImportComponent[]> {
    return this.mock(id, kind, archiveLocation);
  }
  mockSequentialPieces() {
    this.mock.mockImplementation(
      async (
        resourceId: ResourceId,
        kind: ResourceKind,
        archiveLocation: ArchiveLocation,
      ) => [
        ImportComponent.fromSnapshot({
          finished: false,
          order: 0,
          resourceId: resourceId.value,
          id: `import component unique id`,
          piece: ClonePiece.ProjectMetadata,
          uris: [
            {
              uri: `/tmp/project-metadata-random-uuid.json`,
              relativePath: `project-metadata.json`,
            },
          ],
        }),
        ImportComponent.fromSnapshot({
          finished: false,
          order: 1,
          resourceId: resourceId.value,
          id: `some other piece`,
          piece: ClonePiece.PlanningAreaGAdm,
          uris: [
            {
              uri: `/tmp/project-planning-area-random-uuid.json`,
              relativePath: `planning-area/config.json`,
            },
          ],
        }),
      ],
    );
  }
  mockEqualPieces() {
    this.mock.mockImplementation(
      async (
        resourceId: ResourceId,
        kind: ResourceKind,
        archiveLocation: ArchiveLocation,
      ) => [
        ImportComponent.fromSnapshot({
          finished: false,
          order: 2,
          resourceId: resourceId.value,
          id: `import component unique id`,
          piece: ClonePiece.ProjectMetadata,
          uris: [
            {
              uri: `/tmp/project-metadata-random-uuid.json`,
              relativePath: `project-metadata.json`,
            },
          ],
        }),
        ImportComponent.fromSnapshot({
          finished: false,
          order: 2,
          resourceId: resourceId.value,
          id: `some other piece`,
          piece: ClonePiece.PlanningAreaGAdm,
          uris: [
            {
              uri: `/tmp/project-planning-area-random-uuid.json`,
              relativePath: `planning-area/config.json`,
            },
          ],
        }),
      ],
    );
  }
}
