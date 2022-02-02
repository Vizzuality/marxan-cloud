import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '../../../queue-api-events';
import {
  surfaceCostEventsFactoryProvider,
  surfaceCostQueueEventsProvider,
  surfaceCostQueueProvider,
} from './surface-cost-queue.provider';

@Module({
  imports: [QueueApiEventsModule],
  providers: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
  ],
  exports: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
  ],
})
export class CostSurfaceInfraModule {}
