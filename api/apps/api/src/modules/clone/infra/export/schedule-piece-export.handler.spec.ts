import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApiEventsService } from '../../../api-events';
import { MemoryExportRepo } from '../../export/adapters/memory-export.repository';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { ExportRepository } from '../../export/application/export-repository.port';
import { Export, ExportComponent } from '../../export/domain';
import { ExportId } from '../../export/domain/export/export.id';
import { exportPieceQueueToken } from './export-queue.provider';
import { SchedulePieceExport } from './schedule-piece-export.command';
import { SchedulePieceExportHandler } from './schedule-piece-export.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a export-piece job to the queue and create a export piece submitted api event', async () => {
  const [exportId, componentId] = await fixtures.GivenExportIsCreated();
  fixtures.GivenSchedulePieceExportCommand(exportId, componentId);

  await fixtures.WhenSchedulePieceExportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenExportPieceSubmittedApiEventIsCreated();
});

it('should emit an ExportPieceFailed event if the export instance cannot be retrieved', async () => {
  fixtures.GivenSchedulePieceExportCommand(
    ExportId.create(),
    ComponentId.create(),
  );

  await fixtures.WhenSchedulePieceExportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenExportPieceFailedEventIsPublished();
});

it('should emit an ExportPieceFailed event if the export component is not found in export pieces', async () => {
  const [exportId] = await fixtures.GivenExportIsCreated();

  fixtures.GivenSchedulePieceExportCommand(exportId, ComponentId.create());

  await fixtures.WhenSchedulePieceExportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenExportPieceFailedEventIsPublished();
});

it('should emit an ExportPieceFailed event if the job cannot be added to the queue', async () => {
  const [exportId, componentId] = await fixtures.GivenExportIsCreated();
  fixtures.GivenSchedulePieceExportCommand(exportId, componentId);

  await fixtures.WhenSchedulePieceExportHandlerIsInvoked({
    addMockResolvedValue: undefined,
  });

  fixtures.ThenExportPieceFailedEventIsPublished();
});

const getFixtures = async () => {
  const createIfNotExistsMock = jest.fn();
  const addMock = jest.fn();

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ApiEventsService,
        useValue: {
          createIfNotExists: createIfNotExistsMock,
        },
      },
      {
        provide: exportPieceQueueToken,
        useValue: {
          add: addMock,
        },
      },
      {
        provide: Logger,
        useValue: {
          setContext: () => {},
          error: () => {},
        },
      },
      {
        provide: ExportRepository,
        useClass: MemoryExportRepo,
      },
      SchedulePieceExportHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  let command: SchedulePieceExport;
  const ownerId = UserId.create();

  const sut = sandbox.get(SchedulePieceExportHandler);
  const exportRepo = sandbox.get(ExportRepository);

  return {
    GivenExportIsCreated: async (): Promise<[ExportId, ComponentId]> => {
      const resourceId = ResourceId.create();
      const exportComponent = ExportComponent.newOne(
        resourceId,
        ClonePiece.ProjectMetadata,
      );
      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        ownerId,
        [exportComponent],
        false,
      );
      await exportRepo.save(exportInstance);

      return [exportInstance.id, exportComponent.id];
    },
    GivenSchedulePieceExportCommand: (
      exportId: ExportId,
      componentId: ComponentId,
    ): SchedulePieceExport => {
      command = new SchedulePieceExport(exportId, componentId);

      return command;
    },
    WhenSchedulePieceExportHandlerIsInvoked: async ({
      addMockResolvedValue,
    }: {
      addMockResolvedValue?: string;
    }) => {
      addMock.mockResolvedValueOnce(addMockResolvedValue);

      await sut.execute(command);
    },
    ThenExportPieceSubmittedApiEventIsCreated: () => {
      expect(createIfNotExistsMock).toHaveBeenCalledTimes(1);
      expect(createIfNotExistsMock).toHaveBeenCalledWith({
        kind: API_EVENT_KINDS.project__export__piece__submitted__v1__alpha,
        topic: command.componentId.value,
        data: expect.any(Object),
      });
    },
    ThenExportPieceFailedEventIsPublished: () => {
      expect(events).toHaveLength(1);
      const [exportPieceFailedEvent] = events;
      expect(exportPieceFailedEvent).toBeInstanceOf(ExportPieceFailed);
    },
  };
};
