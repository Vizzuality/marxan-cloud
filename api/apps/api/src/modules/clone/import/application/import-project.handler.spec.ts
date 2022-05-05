import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Either, isLeft, isRight, left, Right, right } from 'fp-ts/Either';
import { PromiseType } from 'utility-types';
import { v4 } from 'uuid';
import { ExportId } from '../../export';
import {
  ExportRepository,
  saveError,
} from '../../export/application/export-repository.port';
import { Export, ExportComponentSnapshot } from '../../export/domain';
import { MemoryImportRepository } from '../adapters/memory-import.repository.adapter';
import {
  ImportComponent,
  ImportId,
  ImportRequested,
  PieceImportRequested,
} from '../domain';
import { ImportComponentStatuses } from '../domain/import/import-component-status';
import { ExportConfigReader } from './export-config-reader';
import {
  ImportProject,
  ImportProjectCommandResult,
} from './import-project.command';
import { ImportProjectHandler } from './import-project.handler';
import { ImportResourcePieces } from './import-resource-pieces.port';
import { ImportRepository, Success } from './import.repository.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`importing invalid export`, async () => {
  fixtures.GivenAnUnfinishedExport();
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

test(`importing project specifying resource name`, async () => {
  const resourceName = 'My new project!';

  fixtures.GivenExtractingArchiveHasEqualComponents();
  const result = await fixtures.WhenRequestingImport({
    withResourceName: resourceName,
  });
  fixtures.ThenRequestImportIsSaved(result, { withResourceName: resourceName });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ExportRepository,
        useClass: FakeExportRepository,
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
  const ownerId = UserId.create();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportProjectHandler);
  const repo: MemoryImportRepository = sandbox.get(ImportRepository);
  const exportRepo: FakeExportRepository = sandbox.get(ExportRepository);
  const importResourcePieces: FakeImportResourcePieces = sandbox.get(
    ImportResourcePieces,
  );

  return {
    GivenAnUnfinishedExport: () => {
      exportRepo.returnUnfinishedExport = true;
    },
    GivenExtractingArchiveHasSequentialComponents: () => {
      importResourcePieces.mockSequentialPieces();
    },
    GivenExtractingArchiveHasEqualComponents: () => {
      importResourcePieces.mockEqualPieces();
    },
    WhenRequestingImport: async (
      { withResourceName }: { withResourceName?: string } = {
        withResourceName: undefined,
      },
    ) => {
      const importResult = await sut.execute(
        new ImportProject(ExportId.create(), ownerId, withResourceName),
      );
      if (isRight(importResult))
        resourceId = new ResourceId(
          repo.entities[importResult.right.importId].resourceId,
        );

      return importResult;
    },
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportProjectHandler['execute']>>,
      { withResourceName }: { withResourceName?: string } = {
        withResourceName: undefined,
      },
    ) => {
      if (isLeft(importResult)) {
        throw new Error('left import result');
      }

      expect(repo.entities[importResult.right.importId]).toBeDefined();
      expect(repo.entities[importResult.right.importId].resourceName).toEqual(
        withResourceName,
      );
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

class FakeExportRepository implements ExportRepository {
  public returnUnfinishedExport = false;

  async save(
    exportInstance: Export,
  ): Promise<Either<typeof saveError, Success>> {
    throw new Error('Method not implemented.');
  }

  async find(exportId: ExportId): Promise<Export | undefined> {
    return Export.fromSnapshot({
      exportPieces: [],
      id: exportId.value,
      ownerId: v4(),
      resourceId: v4(),
      resourceKind: ResourceKind.Project,
      archiveLocation: this.returnUnfinishedExport ? '' : '/tmp/foo/bar.zip',
      foreignExport: false,
      createdAt: new Date(),
    });
  }

  async findLatestExportsFor(
    projectId: string,
    limit: number,
    options?: {
      isStandalone?: boolean | undefined;
      isFinished?: boolean | undefined;
      isLocal?: boolean | undefined;
    },
  ): Promise<Export[]> {
    return [];
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
}

class FakeImportResourcePieces implements ImportResourcePieces {
  mock: jest.MockedFunction<
    ImportResourcePieces['resolveForProject']
  > = jest.fn();

  resolveForProject(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
    oldProjectId: ResourceId,
  ): ImportComponent[] {
    return this.mock(id, pieces, oldProjectId);
  }

  resolveForScenario(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ImportComponent[] {
    return [];
  }

  mockSequentialPieces() {
    this.mock.mockImplementation((resourceId: ResourceId) => [
      ImportComponent.fromSnapshot({
        status: ImportComponentStatuses.Submitted,
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
        status: ImportComponentStatuses.Submitted,
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
        status: ImportComponentStatuses.Submitted,
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
        status: ImportComponentStatuses.Submitted,
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
