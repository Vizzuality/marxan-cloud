import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
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
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { CreateApiEventDTO } from '../../../api-events/dto/create.api-event.dto';
import { QueueModule } from '../../../queue';
import { EventData, EventFactory } from '../../../queue-api-events';
import { ExportPieceEventsHandler } from './export-piece.events-handler';
import { exportPieceEventsFactoryToken } from './export-queue.provider';
import { CompletePiece } from '../../export/application/complete-piece.command';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should create a completed api event and send a CompletePiece command when a job finishes successfully', async () => {
  const jobInput = fixtures.GivenExportPieceJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenAExportPieceFinishedApiEventShouldBeCreated();
  fixtures.ThenACompletePieceCommandShouldBeSent();
});

it('should create a failed api event and publish a ExportPieceFailed event when a job fails', async () => {
  const jobInput = fixtures.GivenExportPieceJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenAExportPieceFailedApiEventShouldBeCreated();
  fixtures.ThenAExportPieceFailedEventShouldBePublished();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule, QueueModule],
    providers: [
      ExportPieceEventsHandler,
      {
        provide: exportPieceEventsFactoryToken,
        useValue: (eventFactory: EventFactory<JobInput, JobOutput>) =>
          FakeQueueEvents.create(eventFactory),
      },
      FakeCompletePieceHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  const commands: ICommand[] = [];

  const fakeQueueEvents = FakeQueueEvents.singleton!;
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });
  let results: unknown[] = [];
  const getEventDataFromInput = (
    input: JobInput,
  ): EventData<JobInput, JobOutput> => ({
    eventId: v4(),
    jobId: v4(),
    data: Promise.resolve(input),
    result: Promise.resolve({
      ...input,
      uris: [],
    }),
  });

  return {
    GivenExportPieceJob: (): JobInput => {
      return {
        allPieces: [ClonePiece.ProjectMetadata, ClonePiece.ExportConfig],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectMetadata,
        resourceId: v4(),
        resourceKind: ResourceKind.Project,
      };
    },
    WhenJobFinishes: async (input: JobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('completed', data),
      );
    },
    WhenJobFails: async (input: JobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('failed', data),
      );
    },
    ThenAExportPieceFinishedApiEventShouldBeCreated: () => {
      const [finishedApiEvent] = results as [CreateApiEventDTO];

      expect(finishedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__export__piece__finished__v1__alpha,
      );
    },
    ThenAExportPieceFailedApiEventShouldBeCreated: () => {
      const [failedApiEvent] = results as [CreateApiEventDTO];

      expect(failedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__export__piece__failed__v1__alpha,
      );
    },
    ThenACompletePieceCommandShouldBeSent: () => {
      expect(commands).toHaveLength(1);
      const [completePieceCommand] = commands;
      expect(completePieceCommand).toBeInstanceOf(CompletePiece);
    },
    ThenAExportPieceFailedEventShouldBePublished: () => {
      expect(events).toHaveLength(1);
      const [exportPieceFailedEvent] = events;
      expect(exportPieceFailedEvent).toBeInstanceOf(ExportPieceFailed);
    },
  };
};

type JobEvent = 'completed' | 'failed';

type JobEventListener = (
  eventData: EventData<JobInput, JobOutput>,
) => Promise<unknown>;

export class FakeQueueEvents {
  static singleton: FakeQueueEvents | undefined = undefined;
  #listeners: Record<JobEvent, JobEventListener[]> = {
    completed: [],
    failed: [],
  };

  private constructor(eventFactory: EventFactory<JobInput, JobOutput>) {
    this.on('completed', eventFactory.createCompletedEvent);
    this.on('failed', eventFactory.createFailedEvent);
  }

  static create(
    eventFactory: EventFactory<JobInput, JobOutput>,
  ): FakeQueueEvents {
    if (!this.singleton) {
      this.singleton = new FakeQueueEvents(eventFactory);
    }

    return this.singleton;
  }

  on(type: JobEvent, callback: JobEventListener) {
    this.#listeners[type].push(callback);
  }

  triggerJobEvent(
    type: JobEvent,
    eventData: EventData<JobInput, JobOutput>,
  ): Promise<unknown>[] {
    return this.#listeners[type].map((listener) => listener(eventData));
  }
}

@CommandHandler(CompletePiece)
export class FakeCompletePieceHandler {
  async execute(): Promise<void> {}
}
