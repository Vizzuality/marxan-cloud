import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { unusedResourcesCleanupQueueProvider } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';
import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../scenario.api.entity';
import { DeleteScenarioHandler } from './delete-scenario.handler';
import { ScenarioDeletedSaga } from './scenario-deleted.saga';
import { ScheduleCleanupForScenarioUnusedResourcesHandler } from './schedule-scenario-unused-resources-cleanup.handler';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Scenario, GeoFeature]),
  ],
  providers: [
    unusedResourcesCleanupQueueProvider,
    ScenarioDeletedSaga,
    DeleteScenarioHandler,
    ScheduleCleanupForScenarioUnusedResourcesHandler,
    Logger,
  ],
  exports: [],
})
export class DeleteScenarioModule {}
