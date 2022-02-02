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

it('should create a finished cost surface api event when a fromShape file job finishes successfully', async () => {
  const jobInput = fixtures.GivenFromShapeFileJob();

  await fixtures.WhenJobFinishes(jobInput);

  fixtures.ThenACostSurfaceFinishedApiEventShouldBeCreated();
});

it('should create a failed cost surface api event when a fromShape file job fails', async () => {
  const jobInput = fixtures.GivenFromShapeFileJob();

  await fixtures.WhenJobFails(jobInput);

  fixtures.ThenACostSurfaceFailedApiEventShouldBeCreated();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      SurfaceCostEventsHandler,
      {
        provide: surfaceCostEventsFactoryToken,
        useValue: (eventFactory: EventFactory<JobInput, true>) =>
          FakeQueueEvents.create(eventFactory),
      },
    ],
  }).compile();
  await sandbox.init();

  const fakeQueueEvents = FakeQueueEvents.singleton!;

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
  static singleton: FakeQueueEvents | undefined = undefined;
  #listeners: Record<JobEvent, JobEventListener[]> = {
    completed: [],
    failed: [],
  };

  private constructor(private eventFactory: EventFactory<JobInput, true>) {
    this.on('completed', eventFactory.createCompletedEvent);
    this.on('failed', eventFactory.createFailedEvent);
  }

  static create(eventFactory: EventFactory<JobInput, true>): FakeQueueEvents {
    if (!this.singleton) {
      this.singleton = new FakeQueueEvents(eventFactory);
    }

    return this.singleton;
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
