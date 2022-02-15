import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApiEventsService } from '../../../api-events';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { ImportId } from '../../import/domain';
import { importPieceQueueToken } from './import-queue.provider';
import { SchedulePieceImport } from './schedule-piece-import.command';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a import-piece job to the queue and create a import piece submitted api event', async () => {
  fixtures.GivenSchedulePieceImportCommand();

  await fixtures.WhenJobIsAddedToQueue();

  fixtures.ThenImportPieceSubmittedApiEventIsCreated();
});

it('should emit an ImportPieceFailed event if the job cannot be added to the queue', async () => {
  fixtures.GivenSchedulePieceImportCommand();

  await fixtures.WhenAddingJobToQueueFails();

  fixtures.ThenImportPieceFailedEventIsPublished();
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
        provide: importPieceQueueToken,
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
      SchedulePieceImportHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  let command: SchedulePieceImport;

  const sut = sandbox.get(SchedulePieceImportHandler);

  const uri = 'zip.location';
  const relativePath = './project.metadata.json';

  return {
    GivenSchedulePieceImportCommand: (): SchedulePieceImport => {
      command = new SchedulePieceImport(
        ImportId.create(),
        ComponentId.create(),
        ResourceId.create(),
        ResourceKind.Project,
        ClonePiece.ProjectMetadata,
        [new ComponentLocation(uri, relativePath)],
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
    ThenImportPieceSubmittedApiEventIsCreated: () => {
      expect(createIfNotExistsMock).toHaveBeenCalledTimes(1);
      expect(createIfNotExistsMock).toHaveBeenCalledWith({
        kind: API_EVENT_KINDS.project__import__piece__submitted__v1__alpha,
        topic: command.componentId.value,
        data: expect.any(Object),
      });
    },
    ThenImportPieceFailedEventIsPublished: () => {
      expect(events).toHaveLength(1);
      const [exportPieceFailedEvent] = events;
      expect(exportPieceFailedEvent).toBeInstanceOf(ImportPieceFailed);
    },
  };
};
