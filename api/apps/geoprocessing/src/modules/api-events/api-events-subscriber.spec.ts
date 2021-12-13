import { ApiEventsSubscriber } from './api-events-subscriber';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from './api-events.service';
import { ApiEvent } from './api.event';

let eventForwarder: FakeForwarder;
let eventBus: EventBus;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ApiEventsService,
        useClass: FakeForwarder,
      },
      ApiEventsSubscriber,
    ],
  })
    .compile()
    .then((app) => app.init());

  eventBus = sandbox.get(EventBus);
  eventForwarder = sandbox.get(ApiEventsService);
});

describe(`when emitting event`, () => {
  beforeEach(async () => {
    await eventBus.publish(
      new ApiEvent(
        'resource',
        API_EVENT_KINDS.scenario__protectedAreas__failed__v1__alpha,
        { 1: 'one' },
      ),
    );
  });

  it(`should forward it`, () => {
    expect(eventForwarder.mock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "resource",
        "scenario.protectedAreas.failed/v1/alpha",
        Object {
          "1": "one",
        },
      ]
    `);
  });
});

class FakeForwarder {
  mock = jest.fn();

  async create<T>(
    resourceId: string,
    kind: API_EVENT_KINDS,
    data?: T,
  ): Promise<void> {
    return this.mock(resourceId, kind, data);
  }
}
