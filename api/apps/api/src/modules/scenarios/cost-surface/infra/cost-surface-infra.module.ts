import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueApiEventsModule } from '../../../queue-api-events';
import { Scenario } from '../../scenario.api.entity';
import { DeleteScenarioHandler } from './delete-scenario.handler';
import {
  surfaceCostEventsFactoryProvider,
  surfaceCostQueueEventsProvider,
  surfaceCostQueueProvider,
} from './surface-cost-queue.provider';
import { SurfaceCostEventsHandler } from './surface-cost.events-handler';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Scenario]),
  ],
  providers: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
    SurfaceCostEventsHandler,
    DeleteScenarioHandler,
  ],
  exports: [
    surfaceCostQueueProvider,
    surfaceCostQueueEventsProvider,
    surfaceCostEventsFactoryProvider,
  ],
})
export class CostSurfaceInfraModule {}
