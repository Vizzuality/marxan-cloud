import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { InMemoryExportRepo } from '../adapters/in-memory-export.repository';
import { Export, AllPiecesExported, PieceExported, ExportId } from '../domain';
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
  const firstPieceComponentId = new ComponentId(firstPiece.id);
  const secondPieceComponentId = new ComponentId(secondPiece.id);

  await fixtures.WhenAPieceIsCompleted(
    exportInstance.id,
    firstPieceComponentId,
  );
  await fixtures.WhenAPieceIsCompleted(
    exportInstance.id,
    secondPieceComponentId,
  );

  fixtures.ThenAllPiecesExportedEventIsEmitted(exportInstance.id);
});

it('should not publish any event if export instance is not found', async () => {
  const exportId = new ExportId(v4());
  await fixtures.GivenNoneExportWasRequested(exportId);
  await fixtures.WhenAPieceOfAnUnexistingExportIsCompleted(exportId);
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
        useClass: InMemoryExportRepo,
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
  const repo: InMemoryExportRepo = sandbox.get(ExportRepository);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenExportWasRequested: async () => {
      const exportId = v4();
      const resourceId = v4();
      const exportInstance = Export.fromSnapshot({
        id: exportId,
        exportPieces: [
          {
            finished: false,
            id: v4(),
            piece: ClonePiece.ProjectMetadata,
            resourceId,
            uris: [],
          },
          {
            finished: false,
            id: v4(),
            piece: ClonePiece.ExportConfig,
            resourceId,
            uris: [],
          },
        ],
        resourceId,
        resourceKind: ResourceKind.Project,
      });

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
      const location = [
        new ComponentLocation(`${v4()}.json`, 'relative-path.json'),
      ];

      await sut.execute(
        new CompleteExportPiece(exportId, componentId, location),
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
      const componentFinishedEvent = events[0];

      expect(componentFinishedEvent).toMatchObject({
        componentId,
        exportId,
        location: expect.any(Array),
      });
      expect(componentFinishedEvent).toBeInstanceOf(PieceExported);
    },
    ThenAllPiecesExportedEventIsEmitted: (exportId: ExportId) => {
      const allComponentsFinishedEvent = events[2];
      expect(allComponentsFinishedEvent).toMatchObject({
        exportId,
      });
      expect(allComponentsFinishedEvent).toBeInstanceOf(AllPiecesExported);
    },
    ThenNoEventIsEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenExportPieceFailedEventIsEmitted: (exportId: ExportId) => {
      const exportPieceFailedEvent = events[0];

      expect(exportPieceFailedEvent).toBeInstanceOf(ExportPieceFailed);
      expect((exportPieceFailedEvent as ExportPieceFailed).exportId).toEqual(
        exportId,
      );
    },
  };
};
