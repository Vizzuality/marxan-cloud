import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApiEventsService } from '../../../api-events';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { ExportId } from '../../export/domain';
import { exportPieceQueueToken } from './export-queue.provider';
import { SchedulePieceExport } from './schedule-piece-export.command';
import { SchedulePieceExportHandler } from './schedule-piece-export.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a export-piece job to the queue and create a export piece submitted api event', async () => {
  fixtures.GivenSchedulePieceExportCommand();

  await fixtures.WhenJobIsAddedToQueue();

  fixtures.ThenExportPieceSubmittedApiEventIsCreated();
});

it('should emit an ExportPieceFailed event if the job cannot be added to the queue', async () => {
  fixtures.GivenSchedulePieceExportCommand();

  await fixtures.WhenAddingJobToQueueFails();

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
      SchedulePieceExportHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  let command: SchedulePieceExport;

  const sut = sandbox.get(SchedulePieceExportHandler);

  return {
    GivenSchedulePieceExportCommand: (): SchedulePieceExport => {
      command = new SchedulePieceExport(
        ExportId.create(),
        ComponentId.create(),
        ResourceId.create(),
        ResourceKind.Project,
        ClonePiece.ProjectMetadata,
        [ClonePiece.ProjectMetadata, ClonePiece.ExportConfig],
      );

      return command;
    },
    WhenJobIsAddedToQueue: async () => {
      addMock.mockResolvedValueOnce('job added successfully');

      await sut.execute(command);
    },
    WhenAddingJobToQueueFails: async () => {
      addMock.mockResolvedValueOnce(undefined);

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
