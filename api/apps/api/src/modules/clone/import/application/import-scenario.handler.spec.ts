import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  Failure as ArchiveFailure,
  invalidFiles,
} from '@marxan/cloning/infrastructure/archive-reader.port';
import {
  ExportConfigContent,
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Either, isLeft, isRight, left, Right, right } from 'fp-ts/Either';
import { PromiseType } from 'utility-types';
import { v4 } from 'uuid';
import { Scenario } from '../../../scenarios/scenario.api.entity';
import { ExportId } from '../../export';
import {
  ExportRepository,
  SaveError,
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
import { ImportResourcePieces } from './import-resource-pieces.port';
import {
  ImportScenario,
  ImportScenarioCommandResult,
} from './import-scenario.command';
import { ImportScenarioHandler } from './import-scenario.handler';
import { ImportRepository, Success } from './import.repository.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`importing invalid export`, async () => {
  fixtures.GivenAnUnfinishedExport();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenImportFails(result);
});

it(`importing archive with sequential components`, async () => {
  fixtures.GivenExtractingArchiveHasSequentialComponents();
  const result = await fixtures.WhenRequestingImport();

  fixtures.ThenRequestImportIsSaved(result);
  fixtures.ThenImportRequestedIsEmitted();
  fixtures.ThenLowestOrderComponentIsRequested();
});

it(`importing archive with equal order components`, async () => {
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
        provide: getRepositoryToken(Scenario),
        useClass: FakeScenarioRepository,
      },
      {
        provide: ExportRepository,
        useClass: FakeExportRepository,
      },
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
      { provide: ImportResourcePieces, useClass: FakeImportResourcePieces },
      ImportScenarioHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportScenarioHandler);
  const repo: MemoryImportRepository = sandbox.get(ImportRepository);
  const exportRepo: FakeExportRepository = sandbox.get(ExportRepository);
  const importResourcePieces: FakeImportResourcePieces = sandbox.get(
    ImportResourcePieces,
  );
  const importResourceId = ResourceId.create();

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
    WhenRequestingImport: async () => {
      return sut.execute(
        new ImportScenario(ExportId.create(), ownerId, importResourceId),
      );
    },
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportScenarioHandler['execute']>>,
    ) => {
      expect(isRight(importResult)).toBeTruthy();
      expect(
        repo.entities[
          (importResult as Right<ImportScenarioCommandResult>).right.importId
        ],
      ).toBeDefined();
      expect(
        repo.entities[
          (importResult as Right<ImportScenarioCommandResult>).right.importId
        ].resourceId,
      ).toEqual(importResourceId.value);
      expect(
        repo.entities[
          (importResult as Right<ImportScenarioCommandResult>).right.importId
        ].ownerId,
      ).toEqual(ownerId.value);
    },
    ThenImportFails: (
      importResult: PromiseType<ReturnType<ImportScenarioHandler['execute']>>,
    ) => {
      expect(isLeft(importResult)).toBeTruthy();
    },
    ThenImportRequestedIsEmitted: () => {
      expect(
        events.filter((event) => event instanceof ImportRequested),
      ).toEqual([
        {
          importId: expect.any(ImportId),
          resourceId: importResourceId,
          resourceKind: ResourceKind.Scenario,
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
  mock: jest.MockedFunction<
    ExportConfigReader['read']
  > = jest.fn().mockResolvedValue(
    right({
      resourceKind: ResourceKind.Scenario,
      projectId: v4(),
    } as ExportConfigContent),
  );

  async read(
    location: ArchiveLocation,
  ): Promise<Either<ArchiveFailure, ExportConfigContent>> {
    return this.mock(location);
  }
}

class FakeScenarioRepository {
  async findOne() {
    return {
      projectId: v4(),
    };
  }
}

class FakeExportRepository implements ExportRepository {
  public returnUnfinishedExport = false;

  async save(exportInstance: Export): Promise<Either<SaveError, Success>> {
    throw new Error('Method not implemented.');
  }

  async find(exportId: ExportId): Promise<Export | undefined> {
    return Export.fromSnapshot({
      exportPieces: [],
      id: exportId.value,
      ownerId: v4(),
      resourceId: v4(),
      resourceKind: ResourceKind.Scenario,
      archiveLocation: this.returnUnfinishedExport ? '' : '/tmp/foo/bar.zip',
    });
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
}

class FakeImportResourcePieces extends ImportResourcePieces {
  mock: jest.MockedFunction<
    ImportResourcePieces['resolveForScenario']
  > = jest.fn();

  resolveForProject(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
    oldProjectId: ResourceId,
  ): ImportComponent[] {
    return [];
  }

  resolveForScenario(
    id: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ImportComponent[] {
    return this.mock(id, pieces);
  }

  mockSequentialPieces() {
    this.mock.mockImplementation((resourceId: ResourceId) => [
      ImportComponent.fromSnapshot({
        status: ImportComponentStatuses.Submitted,
        order: 0,
        resourceId: resourceId.value,
        id: `import component unique id`,
        piece: ClonePiece.ScenarioMetadata,
        uris: [
          {
            uri: `/tmp/scenario-metadata-random-uuid.json`,
            relativePath: `scenario-metadata.json`,
          },
        ],
      }),
      ImportComponent.fromSnapshot({
        status: ImportComponentStatuses.Submitted,
        order: 1,
        resourceId: resourceId.value,
        id: `some other piece`,
        piece: ClonePiece.ScenarioRunResults,
        uris: [
          {
            uri: `/tmp/scenario-run-results-random-uuid.json`,
            relativePath: `scenario-run-results.json`,
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
        piece: ClonePiece.ScenarioMetadata,
        uris: [
          {
            uri: `/tmp/scenario-metadata-random-uuid.json`,
            relativePath: `scenario-metadata.json`,
          },
        ],
      }),
      ImportComponent.fromSnapshot({
        status: ImportComponentStatuses.Submitted,
        order: 2,
        resourceId: resourceId.value,
        id: `some other piece`,
        piece: ClonePiece.ScenarioRunResults,
        uris: [
          {
            uri: `/tmp/scenario-run-results-random-uuid.json`,
            relativePath: `scenario-run-results.json`,
          },
        ],
      }),
    ]);
  }
}
