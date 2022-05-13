import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, CommandHandler, CqrsModule, ICommand } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CreateApiEventDTO } from '../../api-events/dto/create.api-event.dto';
import { QueueModule } from '../../queue';
import { EventData, EventFactory } from '../../queue-api-events';
import { CompleteLegacyProjectImportPiece } from '../application/complete-import-legacy-project-piece.command';
import { MarkLegacyProjectImportPieceAsFailed } from '../application/mark-legacy-project-import-piece-as-failed.command';
import { ImportLegacyProjectPieceEventsHandler } from './import-legacy-project-piece.events-handler';
import { importLegacyProjectPieceEventsFactoryToken } from './legacy-project-import-queue.provider';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should create a completed api event and send a CompleteLegacyProjectImportPiece command when a job finishes successfully', async () => {
  const jobInput = fixtures.GivenLegacyProjectImportJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenALegacyProjectImportPieceFinishedApiEventShouldBeCreated();
  fixtures.ThenACompleteLegacyProjectImportPieceCommandShouldBeSent();
});

it('should create a failed api event and send a MarkLegacyProjectImportPieceAsFailed command when a job fails', async () => {
  const jobInput = fixtures.GivenLegacyProjectImportJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenALegacyProjectImportPieceFailedApiEventShouldBeCreated();
  fixtures.ThenAMarkLegacyProjectImportPieceAsFailedCommandShouldBeSent();
});

const getFixtures = async () => {
  let fakeQueueEvents: FakeQueueEvents;

  const projectId = v4();
  const scenarioId = v4();
  const legacyProjectImportId = v4();
  const pieceId = v4();

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule, QueueModule],
    providers: [
      ImportLegacyProjectPieceEventsHandler,
      {
        provide: importLegacyProjectPieceEventsFactoryToken,
        useValue: (
          eventFactory: EventFactory<
            LegacyProjectImportJobInput,
            LegacyProjectImportJobOutput
          >,
        ) => {
          fakeQueueEvents = new FakeQueueEvents(eventFactory);
          return fakeQueueEvents;
        },
      },
      FakeCompleteLegacyProjectImportPieceHandler,
      FakeMarkLegacyProjectImportPieceAsFailedHandler,
    ],
  }).compile();
  await sandbox.init();

  const commands: ICommand[] = [];
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });

  let results: unknown[] = [];

  const getEventDataFromInput = (
    input: LegacyProjectImportJobInput,
    warnings: string[] = [],
  ): EventData<LegacyProjectImportJobInput, LegacyProjectImportJobOutput> => ({
    eventId: v4(),
    jobId: v4(),
    data: Promise.resolve(input),
    result: Promise.resolve({
      ...input,
      warnings,
    }),
  });

  return {
    GivenLegacyProjectImportJob: (): LegacyProjectImportJobInput => {
      return {
        files: [],
        legacyProjectImportId,
        projectId,
        scenarioId,
        pieceId,
        piece: LegacyProjectImportPiece.PlanningGrid,
      };
    },
    WhenJobFinishes: async (input: LegacyProjectImportJobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('completed', data),
      );
    },
    WhenJobFails: async (input: LegacyProjectImportJobInput) => {
      const data = getEventDataFromInput(input);

      results = await Promise.all(
        fakeQueueEvents.triggerJobEvent('failed', data),
      );
    },
    ThenALegacyProjectImportPieceFinishedApiEventShouldBeCreated: () => {
      const [finishedApiEvent] = results as [CreateApiEventDTO];

      expect(finishedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__legacy__import__piece__finished__v1__alpha,
      );
    },
    ThenALegacyProjectImportPieceFailedApiEventShouldBeCreated: () => {
      const [failedApiEvent] = results as [CreateApiEventDTO];

      expect(failedApiEvent.kind).toEqual(
        API_EVENT_KINDS.project__legacy__import__piece__failed__v1__alpha,
      );
    },
    ThenACompleteLegacyProjectImportPieceCommandShouldBeSent: () => {
      expect(commands).toHaveLength(1);
      const [completePieceCommand] = commands;
      expect(completePieceCommand).toBeInstanceOf(
        CompleteLegacyProjectImportPiece,
      );
    },
    ThenAMarkLegacyProjectImportPieceAsFailedCommandShouldBeSent: () => {
      expect(commands).toHaveLength(1);
      const [completePieceCommand] = commands;
      expect(completePieceCommand).toBeInstanceOf(
        MarkLegacyProjectImportPieceAsFailed,
      );
    },
  };
};

type JobEvent = 'completed' | 'failed';

type JobEventListener = (
  eventData: EventData<
    LegacyProjectImportJobInput,
    LegacyProjectImportJobOutput
  >,
) => Promise<unknown>;

class FakeQueueEvents {
  #listeners: Record<JobEvent, JobEventListener[]> = {
    completed: [],
    failed: [],
  };

  public constructor(
    private eventFactory: EventFactory<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
  ) {
    this.on('completed', eventFactory.createCompletedEvent);
    this.on('failed', eventFactory.createFailedEvent);
  }

  on(type: JobEvent, callback: JobEventListener) {
    this.#listeners[type].push(callback.bind(this.eventFactory));
  }

  triggerJobEvent(
    type: JobEvent,
    eventData: EventData<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
  ): Promise<unknown>[] {
    return this.#listeners[type].map((listener) => listener(eventData));
  }
}

@CommandHandler(CompleteLegacyProjectImportPiece)
class FakeCompleteLegacyProjectImportPieceHandler {
  async execute(): Promise<void> {}
}

@CommandHandler(MarkLegacyProjectImportPieceAsFailed)
class FakeMarkLegacyProjectImportPieceAsFailedHandler {
  async execute(): Promise<void> {}
}
