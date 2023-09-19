import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project.api.entity';
import { DeleteProjectHandler } from './delete-project.handler';
import { ProjectDeletedSaga } from './project-deleted.saga';
import { ScheduleCleanupForProjectUnusedResourcesHandler } from './schedule-project-unused-resources-cleanup.handler';
import { unusedResourcesCleanupQueueProvider } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Project, GeoFeature]),
  ],
  providers: [
    unusedResourcesCleanupQueueProvider,
    ProjectDeletedSaga,
    DeleteProjectHandler,
    ScheduleCleanupForProjectUnusedResourcesHandler,
    Logger,
  ],
  exports: [DeleteProjectHandler],
})
export class DeleteProjectModule {}
