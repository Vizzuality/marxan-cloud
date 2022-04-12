import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { MemoryExportRepo } from '../adapters/memory-export.repository';
import {
  AllPiecesExported,
  Export,
  ExportComponent,
  ExportId,
  PieceExported,
} from '../domain';
import { CompleteExportPiece } from './complete-export-piece.command';
import { CompleteExportPieceHandler } from './complete-export-piece.handler';
import { ExportPieceFailed } from './export-piece-failed.event';
import { ExportRepository } from './export-repository.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should mark a component as finished and emit PieceExported event', async () => {
  const exportInstance = await fixtures.GivenExportWasRequested();
  const [firstPiece] = exportInstance.toSnapshot().exportPieces;
  const componentId = new ComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(exportInstance.id, componentId);
  await fixtures.ThenComponentIsFinished(exportInstance.id, componentId);
  fixtures.ThenPieceExportedEventIsEmitted(exportInstance.id, componentId);
});

it('should emit a AllPiecesExported event if all components are finished', async () => {
  const exportInstance = await fixtures.GivenExportWasRequested();
  const [firstPiece, secondPiece] = exportInstance.toSnapshot().exportPieces;
  const firstComponentId = new ComponentId(firstPiece.id);
  const secondComponentId = new ComponentId(secondPiece.id);

  await fixtures.WhenAPieceIsCompleted(exportInstance.id, firstComponentId);
  await fixtures.WhenAPieceIsCompleted(exportInstance.id, secondComponentId);

  fixtures.ThenAllPiecesExportedEventIsEmitted(exportInstance.id);
});

it('should emit a ExportPieceFailed event if export instance is not found', async () => {
  const exportId = new ExportId(v4());
  await fixtures.GivenNoneExportWasRequested(exportId);
  await fixtures.WhenAPieceOfAnUnexistingExportIsCompleted(exportId);
  fixtures.ThenExportPieceFailedEventIsEmitted(exportId);
});

it('should not publish any event if export piece is already exported', async () => {
  const exportInstance = await fixtures.GivenExportWasRequested();
  const [firstPiece] = exportInstance.toSnapshot().exportPieces;
  const componentId = new ComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(exportInstance.id, componentId);
  await fixtures.ThenComponentIsFinished(exportInstance.id, componentId);
  fixtures.ThenPieceExportedEventIsEmitted(exportInstance.id, componentId);

  fixtures.WhenCleaningEventBus();
  await fixtures.WhenAPieceIsCompleted(exportInstance.id, componentId);
  fixtures.ThenNoEventIsEmitted();
});

it('should emit a ExportPieceFailed event if a piece is not found', async () => {
  const exportInstance = await fixtures.GivenExportWasRequested();

  await fixtures.WhenTryingToCompleteAnUnexistingPiece(exportInstance.id);

  fixtures.ThenExportPieceFailedEventIsEmitted(exportInstance.id);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ExportRepository,
        useClass: MemoryExportRepo,
      },
      {
        provide: Logger,
        useClass: FakeLogger,
      },
      CompleteExportPieceHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(CompleteExportPieceHandler);
  const repo = sandbox.get(ExportRepository);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  const ownerId = UserId.create();

  return {
    GivenExportWasRequested: async () => {
      const resourceId = ResourceId.create();
      const pieces = [
        ExportComponent.newOne(resourceId, ClonePiece.ProjectMetadata),
        ExportComponent.newOne(resourceId, ClonePiece.ExportConfig),
      ];
      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        ownerId,
        pieces,
        false,
      );

      await repo.save(exportInstance);

      return exportInstance;
    },
    GivenNoneExportWasRequested: async (exportId: ExportId) => {
      const result = await repo.find(exportId);
      expect(result).toBeUndefined();
    },
    WhenAPieceIsCompleted: async (
      exportId: ExportId,
      componentId: ComponentId,
    ) => {
      await sut.execute(
        new CompleteExportPiece(exportId, componentId, [
          new ComponentLocation('/tmp/foo.json', 'foo.json'),
        ]),
      );
    },
    WhenTryingToCompleteAnUnexistingPiece: async (exportId: ExportId) => {
      const exportInstance = await repo.find(exportId);

      expect(exportInstance).toBeDefined();
      const componentId = ComponentId.create();
      const piece = exportInstance
        ?.toSnapshot()
        .exportPieces.find((piece) => piece.id === componentId.value);
      expect(piece).toBeUndefined();

      await sut.execute(new CompleteExportPiece(exportId, componentId, []));
    },
    WhenAPieceOfAnUnexistingExportIsCompleted: async (exportId: ExportId) => {
      await sut.execute(
        new CompleteExportPiece(exportId, ComponentId.create(), []),
      );
    },
    ThenComponentIsFinished: async (
      exportId: ExportId,
      componentId: ComponentId,
    ) => {
      const exportInstance = await repo.find(exportId);

      expect(exportInstance).toBeDefined();

      const component = exportInstance
        ?.toSnapshot()
        .exportPieces.find((piece) => piece.id === componentId.value);

      expect(component).toBeDefined();
      expect(component?.finished).toEqual(true);
    },
    ThenPieceExportedEventIsEmitted: (
      exportId: ExportId,
      componentId: ComponentId,
    ) => {
      const pieceExportedEvent = events.find(
        (event) => event instanceof PieceExported,
      ) as PieceExported;

      expect(pieceExportedEvent).toBeDefined;
      expect(pieceExportedEvent).toBeInstanceOf(PieceExported);
      expect(pieceExportedEvent).toMatchObject({
        componentId,
        exportId,
      });
    },
    ThenAllPiecesExportedEventIsEmitted: (exportId: ExportId) => {
      const lastEventPosition = events.length - 1;
      const allComponentsFinishedEvent = events[lastEventPosition];
      expect(allComponentsFinishedEvent).toMatchObject({
        exportId,
      });
      expect(allComponentsFinishedEvent).toBeInstanceOf(AllPiecesExported);
    },
    ThenNoEventIsEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenExportPieceFailedEventIsEmitted: (exportId: ExportId) => {
      const exportPieceFailedEvent = events.find(
        (event) => event instanceof ExportPieceFailed,
      ) as ExportPieceFailed;

      expect(exportPieceFailedEvent).toBeDefined();
      expect(exportPieceFailedEvent).toBeInstanceOf(ExportPieceFailed);
      expect((exportPieceFailedEvent as ExportPieceFailed).exportId).toEqual(
        exportId,
      );
    },
    WhenCleaningEventBus: () => {
      events.splice(0, events.length);
    },
  };
};
