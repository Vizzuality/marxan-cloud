import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteCostSurfaceHandler } from './delete-cost-surface.handler';
import { unusedResourcesCleanupQueueProvider } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { ScheduleCleanupForCostSurfaceUnusedResourcesHandler } from '@marxan-api/modules/cost-surface/delete-cost-surface/schedule-cost-surface-unused-resources-cleanup.handler';
import { CostSurfaceDeletedSaga } from '@marxan-api/modules/cost-surface/delete-cost-surface/cost-surface-deleted.saga';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([CostSurface]),
  ],
  providers: [
    unusedResourcesCleanupQueueProvider,
    CostSurfaceDeletedSaga,
    DeleteCostSurfaceHandler,
    ScheduleCleanupForCostSurfaceUnusedResourcesHandler,
    Logger,
  ],
  exports: [DeleteCostSurfaceHandler],
})
export class DeleteCostSurfaceModule {}
