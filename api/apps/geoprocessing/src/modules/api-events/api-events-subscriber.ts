import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';
import { ApiEventsService } from './api-events.service';
import { ApiEvent } from './api.event';

@Injectable()
export class ApiEventsSubscriber implements OnModuleDestroy {
  #sub: Subscription;
  private readonly logger = new Logger(ApiEventsSubscriber.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly eventForwarder: ApiEventsService, // "repository"
  ) {
    this.#sub = eventBus.subscribe({
      next: async (value) => {
        if (value instanceof ApiEvent) {
          try {
            await this.eventForwarder.create(
              value.resourceId,
              value.kind,
              value.data,
            );
          } catch (error) {
            this.logger.error(
              `Unable to emit ApiEvent ${value.resourceId}+${value.kind}`,
              error,
            );
          }
        }
      },
    });
  }

  onModuleDestroy() {
    this.#sub.unsubscribe();
  }
}
