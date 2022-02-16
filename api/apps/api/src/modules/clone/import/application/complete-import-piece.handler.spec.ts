import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { MemoryImportRepository } from '../adapters/memory-import.repository.adapter';
import {
  AllPiecesImported,
  Import,
  ImportComponent,
  ImportComponentSnapshot,
  ImportId,
  PieceImported,
  PieceImportRequested,
} from '../domain';
import { CompleteImportPiece } from './complete-import-piece.command';
import { CompleteImportPieceHandler } from './complete-import-piece.handler';
import { ImportPieceFailed } from './import-piece-failed.event';
import { ImportRepository } from './import.repository.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should mark a component as finished and emit PieceImported event', async () => {
  const importInstance = await fixtures.GivenImportWasRequested();
  const [firstPiece] = importInstance.toSnapshot().importPieces;
  const componentId = new ComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(importInstance.importId, componentId);
  await fixtures.ThenComponentIsFinished(importInstance.importId, componentId);
  fixtures.ThenPieceImportedEventIsEmitted(
    importInstance.importId,
    componentId,
  );
});

it('should advance to next batch and emit PieceImportRequested events when previous batch is completed', async () => {
  const importInstance = await fixtures.GivenImportWasRequested();
  const importId = importInstance.importId;
  const previousBatchOrder = 0;
  const nextBatchOrder = 1;

  const piecesCompleted = await fixtures.WhenABatchIsCompleted(
    importInstance,
    previousBatchOrder,
  );
  await fixtures.ThenBatchComponentsAreFinished(importId, piecesCompleted);
  fixtures.ThenPieceImportRequestedEventIsEmittedForPiecesInNextBatch(
    importInstance,
    nextBatchOrder,
  );
});

it('should emit a ImportAllComponentsFinished event if all components are finished', async () => {
  const importInstance = await fixtures.GivenImportWasRequested();
  const firstBatchOrder = 0;
  const lastBatchOrder = 1;

  await fixtures.WhenABatchIsCompleted(importInstance, firstBatchOrder);
  await fixtures.WhenABatchIsCompleted(importInstance, lastBatchOrder);

  fixtures.ThenAllPiecesImportedEventIsEmitted(importInstance.importId);
});

it('should not publish any event if import instance is not found', async () => {
  const importId = new ImportId(v4());
  await fixtures.GivenNoneImportWasRequested(importId);
  await fixtures.WhenAPieceOfAnUnexistingImportIsCompleted(importId);
  fixtures.ThenNoEventIsEmitted();
});

it('should not publish any event if import piece component is already completed', async () => {
  const importInstance = await fixtures.GivenImportWasRequested();
  const [firstPiece] = importInstance.toSnapshot().importPieces;
  const componentId = new ComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(importInstance.importId, componentId);
  await fixtures.ThenComponentIsFinished(importInstance.importId, componentId);
  fixtures.ThenPieceImportedEventIsEmitted(
    importInstance.importId,
    componentId,
  );

  fixtures.WhenCleaningEventBus();
  await fixtures.WhenAPieceIsCompleted(importInstance.importId, componentId);
  fixtures.ThenNoEventIsEmitted();
});

it('should emit a ImportPieceFailed event if a piece is not found', async () => {
  const importInstance = await fixtures.GivenImportWasRequested();

  await fixtures.WhenTryingToCompleteAnUnexistingPiece(importInstance.importId);

  fixtures.ThenImportPieceFailedEventIsEmitted(importInstance.importId);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
      {
        provide: Logger,
        useClass: FakeLogger,
      },
      CompleteImportPieceHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(CompleteImportPieceHandler);
  const repo = sandbox.get(ImportRepository);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenImportWasRequested: async () => {
      const importId = v4();
      const resourceId = ResourceId.create();
      const pieces = [
        ImportComponent.newOne(resourceId, ClonePiece.ProjectMetadata, 0, []),
        ImportComponent.newOne(resourceId, ClonePiece.ExportConfig, 0, []),
        ImportComponent.newOne(resourceId, ClonePiece.ScenarioMetadata, 1, []),
      ];
      const importInstance = Import.newOne(
        resourceId,
        ResourceKind.Project,
        new ArchiveLocation('/tmp/location.zip'),
        pieces,
      );

      await repo.save(importInstance);

      return importInstance;
    },
    GivenNoneImportWasRequested: async (importId: ImportId) => {
      const result = await repo.find(importId);
      expect(result).toBeUndefined();
    },
    WhenAPieceIsCompleted: async (
      importId: ImportId,
      componentId: ComponentId,
    ) => {
      await sut.execute(new CompleteImportPiece(importId, componentId));
    },
    WhenABatchIsCompleted: async (importInstance: Import, batch: number) => {
      const importId = importInstance.importId;
      const pieces = importInstance.toSnapshot().importPieces;
      const piecesToComplete = pieces.filter((piece) => piece.order === batch);

      for (let i = 0; i < piecesToComplete.length; i++) {
        await sut.execute(
          new CompleteImportPiece(
            importId,
            new ComponentId(piecesToComplete[i].id),
          ),
        );
      }

      const updatedImport = await repo.find(importId);
      if (!updatedImport)
        throw new Error('import not found after completing its pieces');

      return updatedImport
        .toSnapshot()
        .importPieces.filter((piece) => piece.order === batch);
    },
    WhenTryingToCompleteAnUnexistingPiece: async (importId: ImportId) => {
      const importInstance = await repo.find(importId);

      expect(importInstance).toBeDefined();
      const componentId = ComponentId.create();
      const piece = importInstance
        ?.toSnapshot()
        .importPieces.find((piece) => piece.id === componentId.value);
      expect(piece).toBeUndefined();

      await sut.execute(new CompleteImportPiece(importId, componentId));
    },
    WhenAPieceOfAnUnexistingImportIsCompleted: async (importId: ImportId) => {
      await sut.execute(
        new CompleteImportPiece(importId, ComponentId.create()),
      );
    },
    ThenComponentIsFinished: async (
      importId: ImportId,
      componentId: ComponentId,
    ) => {
      const importInstance = await repo.find(importId);

      expect(importInstance).toBeDefined();

      const component = importInstance
        ?.toSnapshot()
        .importPieces.find((piece) => piece.id === componentId.value);

      expect(component).toBeDefined();
      expect(component?.finished).toEqual(true);
    },
    ThenBatchComponentsAreFinished: async (
      importId: ImportId,
      piecesCompleted: ImportComponentSnapshot[],
    ) => {
      const importInstance = await repo.find(importId);

      expect(importInstance).toBeDefined();

      const piecesCompletedIds = piecesCompleted.map((piece) => piece.id);

      const components = importInstance
        ?.toSnapshot()
        .importPieces.filter((piece) => piecesCompletedIds.includes(piece.id));

      expect(components).toBeDefined();
      expect(components?.length).toBe(piecesCompletedIds.length);
      expect(components?.every((piece) => piece.finished)).toEqual(true);
    },
    ThenPieceImportedEventIsEmitted: (
      importId: ImportId,
      componentId: ComponentId,
    ) => {
      const componentFinishedEvent = events[0];

      expect(componentFinishedEvent).toMatchObject({
        componentId,
        importId,
      });
      expect(componentFinishedEvent).toBeInstanceOf(PieceImported);
    },
    ThenPieceImportRequestedEventIsEmittedForPiecesInNextBatch: (
      importInstance: Import,
      nextBatch: number,
    ) => {
      const importId = importInstance.importId;
      const pieces = importInstance.toSnapshot().importPieces;
      const nextBatchPieces = pieces.filter(
        (piece) => piece.order === nextBatch,
      );
      const allNextBatchPiecesImportRequestEvents = nextBatchPieces.every(
        (piece) =>
          events.some(
            (event) =>
              event instanceof PieceImportRequested &&
              event.componentId.value === piece.id,
          ),
      );

      expect(allNextBatchPiecesImportRequestEvents).toBe(true);
    },
    ThenAllPiecesImportedEventIsEmitted: (importId: ImportId) => {
      const lastEventPosition = events.length - 1;
      const allComponentsFinishedEvent = events[lastEventPosition];
      expect(allComponentsFinishedEvent).toMatchObject({
        importId,
      });
      expect(allComponentsFinishedEvent).toBeInstanceOf(AllPiecesImported);
    },
    ThenNoEventIsEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenImportPieceFailedEventIsEmitted: (importId: ImportId) => {
      const exportPieceFailedEvent = events[0];

      expect(exportPieceFailedEvent).toBeInstanceOf(ImportPieceFailed);
      expect((exportPieceFailedEvent as ImportPieceFailed).importId).toEqual(
        importId,
      );
    },
    WhenCleaningEventBus: () => {
      events.splice(0, events.length);
    },
  };
};
