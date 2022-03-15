import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import waitForExpect from 'wait-for-expect';
import { Job, Queue, QueueEvents } from 'bullmq';
import { left, right } from 'fp-ts/lib/Either';
import { EventEmitter } from 'events';
import * as uuid from 'uuid';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ApiEventsService,
  duplicate,
} from '@marxan-api/modules/api-events/api-events.service';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { AdapterFactory } from './adapter.factory';
import { EventData, EventFactory } from './adapter';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`completed event`, async () => {
  fixtures.setupForCompletedEvent();

  fixtures.GivenAJobInQueue();

  fixtures.WhenCompletedEventIsEmitted();

  await fixtures.ThenCompletedEventIsStoredInDb();
  await fixtures.ThenCompletedEventIsReemitted();
});

test(`duplicated completed event`, async () => {
  fixtures.setupForCompletedEvent();

  fixtures.GivenAJobInQueue();
  fixtures.GivenDuplicatedApiEvent();

  fixtures.WhenCompletedEventIsEmitted();

  await fixtures.ThenCompletedEventIsStoredInDb();
  await fixtures.ThenCompletedEventIsNotReemitted();
});

test(`failed event`, async () => {
  fixtures.setupForFailedEvent();

  fixtures.GivenAJobInQueue();

  fixtures.WhenFailedEventIsEmitted();

  await fixtures.ThenFailedEventIsStoredInDb();
  await fixtures.ThenFailedEventIsReemitted();
});

test(`duplicated failed event`, async () => {
  fixtures.setupForFailedEvent();

  fixtures.GivenAJobInQueue();
  fixtures.GivenDuplicatedApiEvent();

  fixtures.WhenFailedEventIsEmitted();

  await fixtures.ThenFailedEventIsStoredInDb();
  await fixtures.ThenFailedEventIsNotReemitted();
});

async function getFixtures() {
  const mockFn = <FunctionType extends (...args: any) => any>(
    implementation: FunctionType,
  ) =>
    jest.fn<ReturnType<FunctionType>, Parameters<FunctionType>>(implementation);
  const fakeApiEventsService = {
    createIfNotExists: mockFn<ApiEventsService['createIfNotExists']>(fail),
  };
  const fakeQueue = {
    getJob: mockFn<Queue['getJob']>(fail),
  };
  const eventFactory: jest.Mocked<EventFactory<unknown>> = {
    createCompletedEvent: jest.fn<any, any>(fail),
    createFailedEvent: jest.fn<any, any>(fail),
  };
  const fakeEventEmitter = new EventEmitter();
  const testingModule = await Test.createTestingModule({
    providers: [
      AdapterFactory,
      {
        provide: ApiEventsService,
        useValue: fakeApiEventsService,
      },
    ],
  }).compile();
  const reemitedHandler = {
    completed: jest.fn<any, any>(fail),
    failed: jest.fn<any, any>(fail),
  };

  const adapter = testingModule
    .get(AdapterFactory)
    .create(
      fakeQueue as Partial<Queue> as Queue,
      fakeEventEmitter as QueueEvents,
    )(eventFactory);
  adapter.on(`completed`, reemitedHandler.completed);
  adapter.on(`failed`, reemitedHandler.failed);

  return {
    setupForCompletedEvent() {
      fakeApiEventsService.createIfNotExists.mockImplementation(async () => {
        return right({ id: uuid.v4() } as ApiEvent);
      });
      eventFactory.createCompletedEvent.mockImplementation(
        async (data: EventData<unknown>) => {
          expect(data).toStrictEqual({
            data: Promise.resolve({}),
            result: Promise.resolve({}),
            eventId: `event 123`,
            jobId: `123`,
          });
          return {
            kind: API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
            topic: `aTopic`,
            externalId: `event 123`,
          };
        },
      );
      reemitedHandler.completed.mockImplementation(() => {
        //
      });
    },
    setupForFailedEvent() {
      fakeApiEventsService.createIfNotExists.mockImplementation(async () => {
        return right({ id: uuid.v4() } as ApiEvent);
      });
      eventFactory.createFailedEvent.mockImplementation(
        async (data: EventData<unknown>) => {
          expect(data).toStrictEqual({
            data: Promise.resolve({}),
            result: Promise.resolve({}),
            eventId: `event 123`,
            jobId: `123`,
          });
          return {
            kind: API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
            topic: `aTopic`,
            externalId: `event 123`,
          };
        },
      );
      reemitedHandler.failed.mockImplementation(() => {
        //
      });
    },
    GivenAJobInQueue() {
      fakeQueue.getJob.mockImplementation(async (id) => {
        expect(id).toBe('123');
        return { id: '123' } as Job;
      });
    },
    GivenDuplicatedApiEvent() {
      fakeApiEventsService.createIfNotExists.mockImplementation(async () => {
        return left(duplicate);
      });
    },
    WhenCompletedEventIsEmitted() {
      const data = {
        jobId: '123',
      };
      const eventId = 'event 123';
      fakeEventEmitter.emit(`completed`, data, eventId);
    },
    WhenFailedEventIsEmitted() {
      const data = {
        jobId: '123',
      };
      const eventId = 'event 123';
      fakeEventEmitter.emit(`failed`, data, eventId);
    },
    async ThenCompletedEventIsStoredInDb() {
      await waitForExpect(async () => {
        expect(fakeApiEventsService.createIfNotExists).toBeCalledTimes(1);
        expect(fakeApiEventsService.createIfNotExists).toBeCalledWith({
          externalId: `event 123`,
          kind: `scenario.run.finished/v1alpha`,
          topic: `aTopic`,
        });
      });
    },
    async ThenFailedEventIsStoredInDb() {
      await waitForExpect(async () => {
        expect(fakeApiEventsService.createIfNotExists).toBeCalledTimes(1);
        expect(fakeApiEventsService.createIfNotExists).toBeCalledWith({
          externalId: `event 123`,
          kind: `scenario.run.failed/v1alpha`,
          topic: `aTopic`,
        });
      });
    },
    async ThenCompletedEventIsReemitted() {
      await waitForExpect(async () => {
        expect(reemitedHandler.completed).toBeCalledTimes(1);
        expect(reemitedHandler.completed).toBeCalledWith({
          data: Promise.resolve({}),
          result: Promise.resolve({}),
          eventId: `event 123`,
          jobId: `123`,
        });
      });
    },
    async ThenCompletedEventIsNotReemitted() {
      await waitForExpect(async () => {
        expect(reemitedHandler.completed).toBeCalledTimes(0);
      });
    },
    async ThenFailedEventIsReemitted() {
      await waitForExpect(async () => {
        expect(reemitedHandler.failed).toBeCalledTimes(1);
        expect(reemitedHandler.failed).toBeCalledWith({
          data: Promise.resolve({}),
          result: Promise.resolve({}),
          eventId: `event 123`,
          jobId: `123`,
        });
      });
    },
    async ThenFailedEventIsNotReemitted() {
      await waitForExpect(async () => {
        expect(reemitedHandler.failed).toBeCalledTimes(0);
      });
    },
  };
}
