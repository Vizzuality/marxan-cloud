import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { delay } from '../../../geoprocessing/test/utils';
import { EventBusTestUtils } from './event-bus.test.utils';

class FirstEventType implements IEvent {
  constructor(readonly id: string) {}
}

class SecondEventType implements IEvent {
  constructor(readonly id: string) {}
}

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  fixtures?.cleanup();
});

it('should await until an event of a specific class is published', async () => {
  fixtures.GivenEventInspectionHasStarted();

  const event = await fixtures.WhenAnEventOfFirstEventTypeIsPublished();

  fixtures.ThenObtainedEventIsAnInstanceOfFirstEventType(event);
});

it('should await until an event which mets a specific condition is published', async () => {
  fixtures.GivenEventInspectionHasStarted();

  const event =
    await fixtures.WhenAnEventOfFirstEventTypeWithFooAsIdIsPublished();

  fixtures.ThenObtainedEventIsAnInstanceOfFirstEventTypeAndItsIdIsFoo(event);
});

it('should check previously published events', async () => {
  fixtures.GivenEventInspectionHasStarted();
  fixtures.GivenSeveralEventsHasBeenPublished();

  const result = await fixtures.WhenOneOfThePastEventsMatchesTheCondition();

  fixtures.ThenThatEventIsReturned(result);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [EventBusTestUtils],
  }).compile();
  await sandbox.init();

  const eventBus = sandbox.get(EventBus);
  const sut = sandbox.get(EventBusTestUtils);

  return {
    cleanup: () => {
      sut.stopInspectingEvents();
    },
    GivenEventInspectionHasStarted: () => {
      sut.startInspectingEvents();
    },
    GivenSeveralEventsHasBeenPublished: () => {
      Array(10)
        .fill(0)
        .forEach((_, index) => {
          eventBus.publish(new FirstEventType(index.toString()));
          eventBus.publish(new SecondEventType(index.toString()));
        });
    },
    WhenAnEventOfFirstEventTypeIsPublished: async () => {
      const [event] = await Promise.all([
        sut.waitUntilEventIsPublished(FirstEventType),
        new Promise<void>(async (resolve) => {
          eventBus.publish(new SecondEventType('Wrong event class'));

          await delay(500);

          eventBus.publish(new FirstEventType('Expected event class'));

          resolve();
        }),
      ]);

      return event;
    },
    WhenAnEventOfFirstEventTypeWithFooAsIdIsPublished: async () => {
      const [event] = await Promise.all([
        sut.waitUntilEventIsPublished(
          FirstEventType,
          (event) => event.id === 'Foo',
        ),
        new Promise<void>(async (resolve) => {
          eventBus.publish(new SecondEventType('Wrong event class'));

          await delay(500);

          eventBus.publish(
            new FirstEventType('Expected event class but wrong id'),
          );

          await delay(500);

          eventBus.publish(new FirstEventType('Foo'));

          resolve();
        }),
      ]);

      return event;
    },
    WhenOneOfThePastEventsMatchesTheCondition: async () => {
      return sut.waitUntilEventIsPublished(
        SecondEventType,
        (event) => event.id === '7',
      );
    },
    ThenObtainedEventIsAnInstanceOfFirstEventType: (event: IEvent) => {
      expect(event).toBeInstanceOf(FirstEventType);
    },
    ThenObtainedEventIsAnInstanceOfFirstEventTypeAndItsIdIsFoo: (
      event: IEvent,
    ) => {
      expect(event).toBeInstanceOf(FirstEventType);
      expect((event as FirstEventType).id).toEqual('Foo');
    },
    ThenThatEventIsReturned: (event: SecondEventType) => {
      expect(event.id).toEqual('7');
    },
  };
};
