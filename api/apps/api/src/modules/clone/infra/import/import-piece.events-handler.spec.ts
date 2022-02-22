import { API_EVENT_KINDS } from '@marxan/api-events';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
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
import { v4 } from 'uuid';
import { CreateApiEventDTO } from '../../../api-events/dto/create.api-event.dto';
import { QueueModule } from '../../../queue';
import { EventData, EventFactory } from '../../../queue-api-events';
import { CompleteImportPiece } from '../../import/application/complete-import-piece.command';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { ImportPieceEventsHandler } from './import-piece.events-handler';
import { importPieceEventsFactoryToken } from './import-queue.provider';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should create a completed api event and send a CompleteImportPiece command when a job finishes successfully', async () => {
  const jobInput = fixtures.GivenImportPieceJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenAImportPieceFinishedApiEventShouldBeCreated();
  fixtures.ThenACompleteImportPieceCommandShouldBeSent();
});

it('should create a failed api event and publish a ImportPieceFailed event when a job fails', async () => {
  const jobInput = fixtures.GivenImportPieceJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenAImportPieceFailedApiEventShouldBeCreated();
  fixtures.ThenAImportPieceFailedEventShouldBePublished();
});

const getFixtures = async () => {
  let fakeQueueEvents: FakeQueueEvents;

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule, QueueModule],
    providers: [
      ImportPieceEventsHandler,
      {
        provide: importPieceEventsFactoryToken,
        useValue: (
          eventFactory: EventFactory<ImportJobInput, ImportJobOutput>,
        ) => {
          fakeQueueEvents = new FakeQueueEvents(eventFactory);
          return fakeQueueEvents;
        },
      },
      FakeCompleteImportPieceHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  const commands: ICommand[] = [];

  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });
  let results: unknown[] = [];
  const getEventDataFromInput = (
    input: ImportJobInput,
  ): EventData<ImportJobInput, ImportJobOutput> => ({
    eventId: v4(),
    jobId: v4(),
    data: Promise.resolve(input),
    result: Promise.resolve({
      ...input,
      uris: [],
    }),
  });

  return {
    GivenImportPieceJob: (): ImportJobInput => {
      return {
        componentId: v4(),
        importId: v4(),
        piece: ClonePiece.ProjectMetadata,
        componentResourceId: v4(),
        importResourceId: v4(),
        resourceKind: ResourceKind.Project,
        uris: [],
      };
    },
    WhenJobFinishes: async (input: ImportJobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('completed', data),
      );
    },
    WhenJobFails: async (input: ImportJobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('failed', data),
      );
    },
    ThenAImportPieceFinishedApiEventShouldBeCreated: () => {
      const [finishedApiEvent] = results as [CreateApiEventDTO];

      expect(finishedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__import__piece__finished__v1__alpha,
      );
    },
    ThenAImportPieceFailedApiEventShouldBeCreated: () => {
      const [failedApiEvent] = results as [CreateApiEventDTO];

      expect(failedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__import__piece__failed__v1__alpha,
      );
    },
    ThenACompleteImportPieceCommandShouldBeSent: () => {
      expect(commands).toHaveLength(1);
      const [completePieceCommand] = commands;
      expect(completePieceCommand).toBeInstanceOf(CompleteImportPiece);
    },
    ThenAImportPieceFailedEventShouldBePublished: () => {
      expect(events).toHaveLength(1);
      const [importPieceFailedEvent] = events;
      expect(importPieceFailedEvent).toBeInstanceOf(ImportPieceFailed);
    },
  };
};

type JobEvent = 'completed' | 'failed';

type JobEventListener = (
  eventData: EventData<ImportJobInput, ImportJobOutput>,
) => Promise<unknown>;

class FakeQueueEvents {
  #listeners: Record<JobEvent, JobEventListener[]> = {
    completed: [],
    failed: [],
  };

  public constructor(
    private eventFactory: EventFactory<ImportJobInput, ImportJobOutput>,
  ) {
    this.on('completed', eventFactory.createCompletedEvent);
    this.on('failed', eventFactory.createFailedEvent);
  }

  on(type: JobEvent, callback: JobEventListener) {
    this.#listeners[type].push(callback.bind(this.eventFactory));
  }

  triggerJobEvent(
    type: JobEvent,
    eventData: EventData<ImportJobInput, ImportJobOutput>,
  ): Promise<unknown>[] {
    return this.#listeners[type].map((listener) => listener(eventData));
  }
}

@CommandHandler(CompleteImportPiece)
class FakeCompleteImportPieceHandler {
  async execute(): Promise<void> {}
}
