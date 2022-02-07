import {
  InitialCostJobInput,
  JobInput,
  FromShapefileJobInput,
} from '@marxan/scenario-cost-surface';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { CreateApiEventDTO } from '../../../api-events/dto/create.api-event.dto';
import { EventData, EventFactory } from '../../../queue-api-events';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { SurfaceCostEventsHandler } from './surface-cost.events-handler';
import { surfaceCostEventsFactoryToken } from './surface-cost-queue.provider';
import { CommandBus, CommandHandler, CqrsModule, ICommand } from '@nestjs/cqrs';
import { DeleteScenario } from './delete-scenario.command';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should create a finished cost surface api event when a initial cost job finishes successfully', async () => {
  const jobInput = fixtures.GivenInitialCostJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenACostSurfaceFinishedApiEventShouldBeCreated();
});

it('should create a failed cost surface api event when a initial cost job fails', async () => {
  const jobInput = fixtures.GivenInitialCostJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenACostSurfaceFailedApiEventShouldBeCreated();
});

it('should send a delete scenario command when a initial cost job fails', async () => {
  const jobInput = fixtures.GivenInitialCostJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenADeleteScenarioCommandShouldBeSent();
});

it('should create a finished cost surface api event when a fromShapefile job finishes successfully', async () => {
  const jobInput = fixtures.GivenFromShapeFileJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenACostSurfaceFinishedApiEventShouldBeCreated();
});

it('should create a failed cost surface api event when a fromShapefile job fails', async () => {
  const jobInput = fixtures.GivenFromShapeFileJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenACostSurfaceFailedApiEventShouldBeCreated();
});

it('should not send a delete scenario command when a fromShapefile job fails', async () => {
  const jobInput = fixtures.GivenFromShapeFileJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenADeleteScenarioCommandShouldNotBeSent();
});

const getFixtures = async () => {
  let fakeQueueEvents: FakeQueueEvents;
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      SurfaceCostEventsHandler,
      {
        provide: surfaceCostEventsFactoryToken,
        useValue: (eventFactory: EventFactory<JobInput, true>) => {
          fakeQueueEvents = new FakeQueueEvents(eventFactory);
          return fakeQueueEvents;
        },
      },
      FakeDeleteScenarioHandler,
    ],
  }).compile();
  await sandbox.init();

  const commands: ICommand[] = [];
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });

  let results: unknown[] = [];
  const getEventDataFromInput = (
    input: JobInput,
  ): EventData<JobInput, true> => ({
    eventId: v4(),
    jobId: v4(),
    data: Promise.resolve(input),
    result: Promise.resolve(true),
  });

  return {
    GivenInitialCostJob: (): InitialCostJobInput => {
      return {
        scenarioId: v4(),
        puGridShape: PlanningUnitGridShape.square,
      };
    },
    GivenFromShapeFileJob: (): FromShapefileJobInput => {
      return {
        scenarioId: v4(),
        shapefile: {
          filename: 'file-name',
        } as Express.Multer.File,
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
    ThenACostSurfaceFinishedApiEventShouldBeCreated: () => {
      const [finishedApiEvent] = results as [CreateApiEventDTO];

      expect(finishedApiEvent.kind).toEqual(
        API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
      );
    },
    ThenADeleteScenarioCommandShouldBeSent: () => {
      expect(commands).toHaveLength(1);
      const [deleteScenarioCommand] = commands;
      expect(deleteScenarioCommand).toBeInstanceOf(DeleteScenario);
    },
    ThenADeleteScenarioCommandShouldNotBeSent: () => {
      expect(commands).toHaveLength(0);
    },
    ThenACostSurfaceFailedApiEventShouldBeCreated: () => {
      const [failedApiEvent] = results as [CreateApiEventDTO];

      expect(failedApiEvent.kind).toEqual(
        API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
      );
    },
  };
};

type JobEvent = 'completed' | 'failed';

type JobEventListener = (
  eventData: EventData<JobInput, true>,
) => Promise<unknown>;

export class FakeQueueEvents {
  #listeners: Record<JobEvent, JobEventListener[]> = {
    completed: [],
    failed: [],
  };

  public constructor(private eventFactory: EventFactory<JobInput, true>) {
    this.on('completed', eventFactory.createCompletedEvent);
    this.on('failed', eventFactory.createFailedEvent);
  }

  on(type: JobEvent, callback: JobEventListener) {
    this.#listeners[type].push(callback.bind(this.eventFactory));
  }

  triggerJobEvent(
    type: JobEvent,
    eventData: EventData<JobInput, true>,
  ): Promise<unknown>[] {
    return this.#listeners[type].map((listener) => listener(eventData));
  }
}

@CommandHandler(DeleteScenario)
export class FakeDeleteScenarioHandler {
  async execute(): Promise<void> {}
}
