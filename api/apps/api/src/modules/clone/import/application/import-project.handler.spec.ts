import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  ExportConfigContent,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Either, isLeft, isRight, left, Right, right } from 'fp-ts/Either';
import { PromiseType } from 'utility-types';
import { ExportConfigReader } from './export-config-reader';
import { MemoryImportRepository } from '../adapters/memory-import.repository.adapter';
import {
  ImportComponent,
  ImportId,
  ImportRequested,
  PieceImportRequested,
} from '../domain';
import {
  Failure as ArchiveFailure,
  invalidFiles,
} from '@marxan/cloning/infrastructure/archive-reader.port';
import { ImportResourcePieces } from './import-resource-pieces.port';
import { ImportRepository } from './import.repository.port';
import { ImportProjectHandler } from './import-project.handler';
import { ImportProject } from './import-project.command';

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
        provide: ExportConfigReader,
        useClass: FakeExportConfigReader,
      },
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
      { provide: ImportResourcePieces, useClass: FakeImportResourcePieces },
      ImportProjectHandler,
    ],
  }).compile();
  await sandbox.init();

  let resourceId: ResourceId;

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportProjectHandler);
  const repo: MemoryImportRepository = sandbox.get(ImportRepository);
  const exportConfigReader: FakeExportConfigReader =
    sandbox.get(ExportConfigReader);
  const importResourcePieces: FakeImportResourcePieces =
    sandbox.get(ImportResourcePieces);

  return {
    GivenExtractingArchiveFails: () => {
      exportConfigReader.mock.mockImplementation(async () =>
        left(invalidFiles),
      );
    },
    GivenExtractingArchiveHasSequentialComponents: () => {
      importResourcePieces.mockSequentialPieces();
    },
    GivenExtractingArchiveHasEqualComponents: () => {
      importResourcePieces.mockEqualPieces();
    },
    WhenRequestingImport: async () => {
      const importResult = await sut.execute(
        new ImportProject(new ArchiveLocation(`whatever`)),
      );
      if (isRight(importResult))
        resourceId = new ResourceId(
          repo.entities[importResult.right].resourceId,
        );
      return importResult;
    },
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportProjectHandler['execute']>>,
    ) => {
      expect(isRight(importResult)).toBeTruthy();
      expect(
        repo.entities[(importResult as Right<string>).right],
      ).toBeDefined();
    },
    ThenImportFails: (
      importResult: PromiseType<ReturnType<ImportProjectHandler['execute']>>,
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
          componentId: expect.any(ComponentId),
        },
      ]);
    },
    ThenAllComponentsAreRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          importId: expect.any(ImportId),
          componentId: expect.any(ComponentId),
        },
        {
          importId: expect.any(ImportId),
          componentId: expect.any(ComponentId),
        },
      ]);
    },
  };
};

class FakeExportConfigReader {
  mock: jest.MockedFunction<ExportConfigReader['read']> = jest
    .fn()
    .mockResolvedValue(
      right({ resourceKind: ResourceKind.Project } as ExportConfigContent),
    );

  async read(
    archive: ArchiveLocation,
  ): Promise<Either<ArchiveFailure, ExportConfigContent>> {
    return this.mock(archive);
  }
}

class FakeImportResourcePieces extends ImportResourcePieces {
  mock: jest.MockedFunction<ImportResourcePieces['resolveForProject']> =
    jest.fn();

  resolveForProject(
    id: ResourceId,
    archiveLocation: ArchiveLocation,
    pieces: ProjectExportConfigContent['pieces'],
  ): ImportComponent[] {
    return this.mock(id, archiveLocation, pieces);
  }

  resolveForScenario(
    _id: ResourceId,
    _archiveLocation: ArchiveLocation,
  ): ImportComponent[] {
    return [];
  }

  mockSequentialPieces() {
    this.mock.mockImplementation((resourceId: ResourceId) => [
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
    ]);
  }

  mockEqualPieces() {
    this.mock.mockImplementation((resourceId: ResourceId) => [
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
    ]);
  }
}
