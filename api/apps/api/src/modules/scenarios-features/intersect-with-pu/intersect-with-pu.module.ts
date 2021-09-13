import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';

import { FeaturesReadySaga } from './features-ready.saga';
import { IntersectWithPuHandler } from './intersect-with-pu.handler';
import {
  intersectFeaturesWithPuQueueEventsProvider,
  intersectFeaturesWithPuQueueProvider,
  setPlanningUnitGridEventsFactoryProvider,
} from './intersect-queue.providers';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    FeaturesReadySaga,
    IntersectWithPuHandler,
    intersectFeaturesWithPuQueueProvider,
    intersectFeaturesWithPuQueueEventsProvider,
    setPlanningUnitGridEventsFactoryProvider,
  ],
})
export class IntersectWithPuModule {}
