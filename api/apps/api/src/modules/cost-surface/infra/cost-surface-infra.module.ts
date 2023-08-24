import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueApiEventsModule } from '../../queue-api-events';
import { Scenario } from '../../scenarios/scenario.api.entity';
import { DeleteScenarioHandler } from './delete-scenario.handler';
import {
  costSurfaceEventsFactoryProvider,
  costSurfaceQueueEventsProvider,
  costSurfaceQueueProvider,
} from './cost-surface-queue.provider';
import { CostSurfaceEventsHandler } from './cost-surface-events-handler.service';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Scenario]),
  ],
  providers: [
    costSurfaceQueueProvider,
    costSurfaceQueueEventsProvider,
    costSurfaceEventsFactoryProvider,
    CostSurfaceEventsHandler,
    DeleteScenarioHandler,
  ],
  exports: [
    costSurfaceQueueProvider,
    costSurfaceQueueEventsProvider,
    costSurfaceEventsFactoryProvider,
  ],
})
export class CostSurfaceInfraModule {}
