import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '../../../queue-api-events';
import {
  surfaceCostEventsFactoryProvider,
  surfaceCostQueueEventsProvider,
  surfaceCostQueueProvider,
} from './surface-cost-queue.provider';
import { SurfaceCostEventsHandler } from './surface-cost.events-handler';

@Module({
  imports: [QueueApiEventsModule],
  providers: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
    SurfaceCostEventsHandler,
  ],
  exports: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
  ],
})
export class CostSurfaceInfraModule {}
