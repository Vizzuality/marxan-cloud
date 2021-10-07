import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';

import { DataMovedFormPreparationSaga } from './data-moved-form-preparation-saga.service';
import { IntersectWithPuHandler } from './intersect-with-pu.handler';
import {
  intersectFeaturesWithPuQueueEventsProvider,
  intersectFeaturesWithPuQueueProvider,
  setPlanningUnitGridEventsFactoryProvider,
} from './intersect-queue.providers';
import { IntersectWithPuEventsService } from './intersect-with-pu-events.service';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    DataMovedFormPreparationSaga,
    IntersectWithPuHandler,
    IntersectWithPuEventsService,
    intersectFeaturesWithPuQueueProvider,
    intersectFeaturesWithPuQueueEventsProvider,
    setPlanningUnitGridEventsFactoryProvider,
  ],
})
export class IntersectWithPuModule {}
