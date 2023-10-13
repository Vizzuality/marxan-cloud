import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFileType,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  EventBus,
  ICommand,
  IEvent,
} from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { isLeft } from 'fp-ts/lib/These';
import { v4 } from 'uuid';
import { AllLegacyProjectImportPiecesImported } from '../domain/events/all-legacy-project-import-pieces-imported.event';
import { LegacyProjectImportCanceled } from '../domain/events/legacy-project-import-canceled.events';
import { LegacyProjectImportBatchFailed } from '../domain/events/legacy-project-import-batch-failed.event';
import { LegacyProjectImportPieceImported } from '../domain/events/legacy-project-import-piece-imported.event';
import { LegacyProjectImportPieceRequested } from '../domain/events/legacy-project-import-piece-requested.event';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportComponentStatuses } from '../domain/legacy-project-import/legacy-project-import-component-status';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportComponentSnapshot } from '../domain/legacy-project-import/legacy-project-import-component.snapshot';
import { LegacyProjectImportStatuses } from '../domain/legacy-project-import/legacy-project-import-status';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../infra/legacy-project-import-memory.repository';
import { CompleteLegacyProjectImportPiece } from './complete-legacy-project-import-piece.command';
import { CompleteLegacyProjectImportPieceHandler } from './complete-legacy-project-import-piece.handler';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('marks a component as finished and emits a LegacyProjectImportPieceImported event', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { pieces, projectId } = legacyProjectImport.toSnapshot();
  const [firstPiece] = pieces;

  const resourceId = new ResourceId(projectId);
  const componentId = new LegacyProjectImportComponentId(firstPiece.id);
  const warnings = [
    'Grid shapefile contains planning units not referenced in pu.dat file',
  ];

  await fixtures.WhenAPieceIsCompleted(resourceId, componentId, warnings);
  await fixtures.ThenComponentIsFinished(resourceId, componentId, warnings);
  fixtures.ThenLegacyProjectImportPieceImportedEventIsEmitted(
    resourceId,
    componentId,
  );
});

it('advances to next batch and emits LegacyProjectImportPieceRequested events for next batch pieces', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  const resourceId = new ResourceId(projectId);

  const previousBatchOrder = 0;
  const nextBatchOrder = 1;

  const completedPieces = await fixtures.WhenABatchIsCompleted(
    legacyProjectImport,
    previousBatchOrder,
  );
  await fixtures.ThenBatchComponentsAreFinished(resourceId, completedPieces);
  fixtures.ThenLegacyProjectImportPieceRequestedEventIsEmittedForPiecesInNextBatch(
    legacyProjectImport,
    nextBatchOrder,
  );
  await fixtures.ThenLegacyProjectImportStatusIsStillRunning(resourceId);
});

it('fails to advances to next batch and emits HaltLegacyProjectImport event when user cancels the proccess ', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  await fixtures.GivenUserCancelsALegacyProjectImport(legacyProjectImport);

  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const currentBatchOrder = 0;

  const completedPieces = await fixtures.WhenABatchIsCompleted(
    legacyProjectImport,
    currentBatchOrder,
  );
  await fixtures.ThenBatchComponentsAreFinished(resourceId, completedPieces);
  fixtures.ThenHaltLegacyProjectImportEventIsEmitted(resourceId);
  await fixtures.ThenLegacyProjectImportStatusIsCanceled(resourceId);
});

it('emits a LegacyProjectImportBatchFailed event when completing the last piece in a batch with failed pieces', async () => {
  const { projectId, submittedPiece } =
    await fixtures.GivenLegacyProjectImportWithAFailedPiece();

  const componentId = new LegacyProjectImportComponentId(submittedPiece.id);

  await fixtures.WhenAPieceIsCompleted(projectId, componentId, []);
  await fixtures.ThenComponentIsFinished(projectId, componentId, []);
  fixtures.ThenLegacyProjectImportBatchFailedEventIsEmitted(projectId);
  await fixtures.ThenLegacyProjectImportStatusIsFailed(projectId);
});

it('emits a AllLegacyProjectImportPiecesImported event if all components are finished', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();

  const resourceId = new ResourceId(projectId);

  const firstBatchOrder = 0;
  const lastBatchOrder = 1;

  await fixtures.WhenABatchIsCompleted(legacyProjectImport, firstBatchOrder);
  await fixtures.WhenABatchIsCompleted(legacyProjectImport, lastBatchOrder);

  fixtures.ThenAllLegacyProjectImportPiecesImportedEventIsEmitted(resourceId);
  await fixtures.ThenLegacyProjectImportStatusIsCompleted(
    new ResourceId(projectId),
  );
});

it('sends a MarkLegacyProjectImportAsFailed command if import instance is not found', async () => {
  const projectId = new ResourceId(v4());
  await fixtures.GivenNoneImportWasRequested(projectId);
  await fixtures.WhenAPieceOfAnUnexistingImportIsCompleted(projectId);
  fixtures.ThenMarkImportAsFailedCommandIsSent(projectId);
});

it(`doesn't publish any event if import piece component is already completed`, async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { pieces, projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const [firstPiece] = pieces;
  const componentId = new LegacyProjectImportComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(resourceId, componentId);
  await fixtures.ThenComponentIsFinished(resourceId, componentId);
  fixtures.ThenLegacyProjectImportPieceImportedEventIsEmitted(
    resourceId,
    componentId,
  );

  fixtures.cleanEventBus();
  await fixtures.WhenAPieceIsCompleted(resourceId, componentId);
  fixtures.ThenNoEventIsEmitted();
});

it('sends a MarkLegacyProjectImportAsFailed command if a piece is not found', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);

  await fixtures.WhenTryingToCompleteAnUnexistingPiece(resourceId);

  fixtures.ThenMarkImportAsFailedCommandIsSent(resourceId);
});

it('sends a MarkLegacyProjectImportAsFailed command if aggregate cannot be persisted', async () => {
  const legacyProjectImport =
    await fixtures.GivenLegacyProjectImportWasRequested();
  const { projectId, pieces } = legacyProjectImport.toSnapshot();
  const resourceId = new ResourceId(projectId);
  const [firstPiece] = pieces;
  const componentId = new LegacyProjectImportComponentId(firstPiece.id);

  await fixtures.WhenAPieceIsCompleted(resourceId, componentId, [], {
    aggregatePersistenceError: true,
  });
  fixtures.ThenMarkImportAsFailedCommandIsSent(resourceId);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      CompleteLegacyProjectImportPieceHandler,
      FakeMarkLegacyProjectImportAsFailed,
    ],
  }).compile();
  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const ownerId = UserId.create();
  const projectId = ResourceId.create();
  const scenarioId = ResourceId.create();

  const events: IEvent[] = [];
  const commands: ICommand[] = [];

  const sut = sandbox.get(CompleteLegacyProjectImportPieceHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });

  const defaultFiles: LegacyProjectImportFileSnapshot[] = [
    {
      id: v4(),
      location: `/tmp/${projectId}/pu.dat`,
      type: LegacyProjectImportFileType.PuDat,
    },
    {
      id: v4(),
      location: `/tmp/${projectId}/grid.zip`,
      type: LegacyProjectImportFileType.PlanningGridShapefile,
    },
    {
      id: v4(),
      location: `/tmp/${projectId}/spec.dat`,
      type: LegacyProjectImportFileType.SpecDat,
    },
  ];
  const defaultPieces: LegacyProjectImportComponentSnapshot[] = [
    {
      id: v4(),
      kind: LegacyProjectImportPiece.PlanningGrid,
      status: LegacyProjectImportComponentStatuses.Submitted,
      order: 0,
      errors: [],
      warnings: [],
    },
    {
      id: v4(),
      kind: LegacyProjectImportPiece.ScenarioPusData,
      status: LegacyProjectImportComponentStatuses.Submitted,
      order: 0,
      errors: [],
      warnings: [],
    },
    {
      id: v4(),
      kind: LegacyProjectImportPiece.Features,
      status: LegacyProjectImportComponentStatuses.Submitted,
      order: 1,
      errors: [],
      warnings: [],
    },
  ];

  const getLegacyProjectImport = async (
    projectId: ResourceId,
  ): Promise<LegacyProjectImport> => {
    const legacyProjectImportOrError = await repo.find(projectId);

    if (isLeft(legacyProjectImportOrError))
      throw new Error('Legacy project import not found');

    return legacyProjectImportOrError.right;
  };

  return {
    GivenLegacyProjectImportWasRequested: async (
      { files, pieces } = { files: defaultFiles, pieces: defaultPieces },
    ) => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: v4(),
        scenarioId: scenarioId.value,
        projectId: projectId.value,
        ownerId: ownerId.value,
        files,
        pieces,
        status: LegacyProjectImportStatuses.Running,
        toBeRemoved: false,
      });

      await repo.save(legacyProjectImport);

      return legacyProjectImport;
    },
    GivenLegacyProjectImportWithAFailedPiece: async () => {
      const [firstPiece, submittedPiece] = defaultPieces.filter(
        (piece) => piece.order === 0,
      );
      const failedPiece = {
        ...firstPiece,
        status: LegacyProjectImportComponentStatuses.Failed,
      };

      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: v4(),
        scenarioId: scenarioId.value,
        projectId: projectId.value,
        ownerId: ownerId.value,
        files: defaultFiles,
        pieces: [failedPiece, submittedPiece],
        status: LegacyProjectImportStatuses.Running,
        toBeRemoved: false,
      });

      await repo.save(legacyProjectImport);

      return { projectId, submittedPiece };
    },
    GivenNoneImportWasRequested: async (projectId: ResourceId) => {
      const result = await repo.find(projectId);
      expect(result).toMatchObject({ left: legacyProjectImportNotFound });
    },
    GivenUserCancelsALegacyProjectImport: async (
      legacyProjectImport: LegacyProjectImport,
    ) => {
      const canceledLegacyProjectImport = LegacyProjectImport.fromSnapshot({
        ...legacyProjectImport.toSnapshot(),
        toBeRemoved: true,
      });

      await repo.save(canceledLegacyProjectImport);
    },
    WhenAPieceIsCompleted: async (
      projectId: ResourceId,
      componentId: LegacyProjectImportComponentId,
      warnings: string[] = [],
      { aggregatePersistenceError } = { aggregatePersistenceError: false },
    ) => {
      if (aggregatePersistenceError) repo.saveFailure = true;

      await sut.execute(
        new CompleteLegacyProjectImportPiece(projectId, componentId, warnings),
      );
    },
    WhenABatchIsCompleted: async (
      legacyProjectImport: LegacyProjectImport,
      batch: number,
    ) => {
      const { projectId, pieces } = legacyProjectImport.toSnapshot();
      const piecesToComplete = pieces.filter((piece) => piece.order === batch);

      const resourceId = new ResourceId(projectId);

      for (const piece of piecesToComplete) {
        await sut.execute(
          new CompleteLegacyProjectImportPiece(
            resourceId,
            new LegacyProjectImportComponentId(piece.id),
          ),
        );
      }

      const updatedLegacyProjectImportOrError =
        await getLegacyProjectImport(resourceId);
      return updatedLegacyProjectImportOrError
        .toSnapshot()
        .pieces.filter((piece) => piece.order === batch);
    },
    WhenTryingToCompleteAnUnexistingPiece: async (projectId: ResourceId) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const componentId = LegacyProjectImportComponentId.create();
      const piece = legacyProjectImport
        .toSnapshot()
        .pieces.find((piece) => piece.id === componentId.value);
      expect(piece).toBeUndefined();

      await sut.execute(
        new CompleteLegacyProjectImportPiece(projectId, componentId),
      );
    },
    WhenAPieceOfAnUnexistingImportIsCompleted: async (
      projectId: ResourceId,
    ) => {
      await sut.execute(
        new CompleteLegacyProjectImportPiece(
          projectId,
          LegacyProjectImportComponentId.create(),
        ),
      );
    },
    ThenLegacyProjectImportStatusIsStillRunning: async (
      projectId: ResourceId,
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { status } = legacyProjectImport.toSnapshot();

      expect(status).toEqual(LegacyProjectImportStatuses.Running);
    },
    ThenLegacyProjectImportStatusIsCompleted: async (projectId: ResourceId) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { status } = legacyProjectImport.toSnapshot();

      expect(status).toEqual(LegacyProjectImportStatuses.Completed);
    },
    ThenLegacyProjectImportStatusIsFailed: async (projectId: ResourceId) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { status } = legacyProjectImport.toSnapshot();

      expect(status).toEqual(LegacyProjectImportStatuses.Failed);
    },
    ThenLegacyProjectImportStatusIsCanceled: async (projectId: ResourceId) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const { status } = legacyProjectImport.toSnapshot();

      expect(status).toEqual(LegacyProjectImportStatuses.Canceled);
    },
    ThenComponentIsFinished: async (
      projectId: ResourceId,
      componentId: LegacyProjectImportComponentId,
      expectedWarnings: string[] = [],
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);

      const component = legacyProjectImport
        .toSnapshot()
        .pieces.find((piece) => piece.id === componentId.value);

      expect(component).toBeDefined();
      expect(component!.status).toEqual(
        LegacyProjectImportComponentStatuses.Completed,
      );
      expect(component!.warnings).toEqual(expectedWarnings);
    },
    ThenBatchComponentsAreFinished: async (
      projectId: ResourceId,
      completedPieces: LegacyProjectImportComponentSnapshot[],
    ) => {
      const legacyProjectImport = await getLegacyProjectImport(projectId);
      const piecesCompletedIds = completedPieces.map((piece) => piece.id);

      const components = legacyProjectImport
        .toSnapshot()
        .pieces.filter((piece) => piecesCompletedIds.includes(piece.id));

      expect(components.length).toBe(piecesCompletedIds.length);
      expect(
        components.every(
          (piece) =>
            piece.status === LegacyProjectImportComponentStatuses.Completed,
        ),
      ).toEqual(true);
    },
    ThenLegacyProjectImportPieceImportedEventIsEmitted: (
      projectId: ResourceId,
      componentId: LegacyProjectImportComponentId,
    ) => {
      const componentFinishedEvent = events[0];

      expect(componentFinishedEvent).toMatchObject({
        componentId,
        projectId,
      });
      expect(componentFinishedEvent).toBeInstanceOf(
        LegacyProjectImportPieceImported,
      );
    },
    ThenLegacyProjectImportPieceRequestedEventIsEmittedForPiecesInNextBatch: (
      legacyProjectImport: LegacyProjectImport,
      nextBatch: number,
    ) => {
      const { pieces } = legacyProjectImport.toSnapshot();
      const nextBatchPieces = pieces.filter(
        (piece) => piece.order === nextBatch,
      );
      const allNextBatchPiecesImportRequestEvents = nextBatchPieces.every(
        (piece) =>
          events.some(
            (event) =>
              event instanceof LegacyProjectImportPieceRequested &&
              event.componentId.value === piece.id,
          ),
      );

      expect(allNextBatchPiecesImportRequestEvents).toBe(true);
    },
    ThenHaltLegacyProjectImportEventIsEmitted: (projectId: ResourceId) => {
      const lastEventPosition = events.length - 1;
      const haltLegacyProjectImportEvent = events[lastEventPosition];
      expect(haltLegacyProjectImportEvent).toMatchObject({
        projectId,
      });
      expect(haltLegacyProjectImportEvent).toBeInstanceOf(
        LegacyProjectImportCanceled,
      );
    },
    ThenLegacyProjectImportBatchFailedEventIsEmitted: (
      projectId: ResourceId,
    ) => {
      const lastEventPosition = events.length - 1;
      const importBatchFailedEvent = events[lastEventPosition];
      expect(importBatchFailedEvent).toMatchObject({
        projectId,
        batchNumber: 0,
      });
      expect(importBatchFailedEvent).toBeInstanceOf(
        LegacyProjectImportBatchFailed,
      );
    },
    ThenAllLegacyProjectImportPiecesImportedEventIsEmitted: (
      projectId: ResourceId,
    ) => {
      const lastEventPosition = events.length - 1;
      const allComponentsFinishedEvent = events[lastEventPosition];
      expect(allComponentsFinishedEvent).toMatchObject({
        projectId,
      });
      expect(allComponentsFinishedEvent).toBeInstanceOf(
        AllLegacyProjectImportPiecesImported,
      );
    },
    ThenNoEventIsEmitted: () => {
      expect(events).toHaveLength(0);
    },
    ThenMarkImportAsFailedCommandIsSent: (projectId: ResourceId) => {
      const markImportAsFailedCommand = commands[0];

      expect(markImportAsFailedCommand).toBeInstanceOf(
        MarkLegacyProjectImportAsFailed,
      );
      expect(
        (markImportAsFailedCommand as MarkLegacyProjectImportAsFailed)
          .projectId,
      ).toEqual(projectId);
    },
    cleanEventBus: () => {
      events.splice(0, events.length);
    },
  };
};

@CommandHandler(MarkLegacyProjectImportAsFailed)
class FakeMarkLegacyProjectImportAsFailed {
  async execute(): Promise<void> {}
}
