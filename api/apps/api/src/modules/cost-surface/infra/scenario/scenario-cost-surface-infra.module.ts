import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueApiEventsModule } from '../../../queue-api-events';
import {
  scenarioCostSurfaceEventsFactoryProvider,
  scenarioCostSurfaceQueueEventsProvider,
  scenarioCostSurfaceQueueProvider,
} from '@marxan-api/modules/cost-surface/infra/scenario/scenario-cost-surface-queue.provider';
import { ScenarioCostSurfaceEventsHandler } from '@marxan-api/modules/cost-surface/infra/scenario/scenario-cost-surface-events.handler';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Scenario]),
  ],
  providers: [
    scenarioCostSurfaceQueueProvider,
    scenarioCostSurfaceQueueEventsProvider,
    scenarioCostSurfaceEventsFactoryProvider,
    ScenarioCostSurfaceEventsHandler,
  ],
  exports: [
    scenarioCostSurfaceQueueProvider,
    scenarioCostSurfaceQueueEventsProvider,
    scenarioCostSurfaceEventsFactoryProvider,
  ],
})
export class ScenarioCostSurfaceInfraModule {}
