import { Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';
import { Class, DeepPartial } from 'utility-types';

export type EventFilter<T extends IEvent> = (event: DeepPartial<T>) => boolean;

@Injectable()
export class EventBusTestUtils {
  private eventBusSubscription: Subscription | undefined;
  private eventsHistory: IEvent[] = [];

  constructor(private readonly eventBus: EventBus) {}

  startInspectingEvents(): void {
    this.eventBusSubscription = this.eventBus.subscribe((event) => {
      this.eventsHistory.push(event);
    });
  }

  stopInspectingEvents(): void {
    this.eventBusSubscription?.unsubscribe();
  }

  async waitUntilEventIsPublished<T extends IEvent>(
    eventClass: Class<T>,
    filter?: EventFilter<T>,
  ): Promise<T> {
    const pastEvent = this.eventsHistory.find((event) =>
      this.evaluateEvent(event as DeepPartial<T>, eventClass, filter),
    );
    if (pastEvent) return pastEvent as T;

    let subscription: Subscription;
    const event = await new Promise<T>((resolve) => {
      subscription = this.eventBus.subscribe((event) => {
        const metsConditions = this.evaluateEvent(
          event as DeepPartial<T>,
          eventClass,
          filter,
        );

        if (metsConditions) resolve(event as T);
      });
    });

    subscription!.unsubscribe();

    return event;
  }

  private evaluateEvent<T>(
    event: DeepPartial<T>,
    eventClass: Class<IEvent>,
    filter?: EventFilter<T>,
  ): boolean {
    return event instanceof eventClass && (!filter || filter(event));
  }
}
